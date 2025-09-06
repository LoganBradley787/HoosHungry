import requests, re, json
from collections import defaultdict

BASE_URL = "https://virginia.campusdish.com/en/locationsandmenus/observatoryhilldiningroom/"

def extract_braced_object(s: str, start_idx: int) -> str:
    i = s.find('{', start_idx)
    if i == -1:
        raise ValueError("No opening '{' after start index")
    depth, in_str, esc = 0, None, False
    j = i
    while j < len(s):
        c = s[j]
        if in_str:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == in_str: in_str = None
        else:
            if c in ('"', "'"): in_str = c
            elif c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return s[i:j+1]
        j += 1
    raise ValueError("Unbalanced braces")

def get_model_from_html(url: str):
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    html = r.text
    m = re.search(r'\bmodel\s*:', html)
    if not m:
        raise RuntimeError("Could not find 'model:' in page")
    return json.loads(extract_braced_object(html, m.end()))

def try_api(location_id: str, date_mmddyyyy: str, period_id: str):
    """
    Try CampusDish JSON API. If they change casing/params, we try a few variants.
    Returns dict model-like or None.
    """
    candidates = [
        f"https://virginia.campusdish.com/api/menus/GetMenu?locationId={location_id}&date={date_mmddyyyy}&mode=Daily&periodId={period_id}",
        f"https://virginia.campusdish.com/api/menus/GetMenu?locationId={location_id}&date={date_mmddyyyy}&periodId={period_id}",
        f"https://virginia.campusdish.com/api/menus/GetMenu?locationId={location_id}&date={date_mmddyyyy}&week=0&mode=Daily&selectedPeriodId={period_id}",
    ]
    headers = {
        "Accept": "application/json, text/plain, */*",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": BASE_URL,
        "User-Agent": "Mozilla/5.0 CleanMenuBot/1.0"
    }
    for url in candidates:
        try:
            r = requests.get(url, headers=headers, timeout=20)
            if r.status_code == 200 and r.headers.get("content-type","").startswith("application/json"):
                data = r.json()
                # Normalize to a structure with "Menu" inside (API sometimes returns model directly)
                if "Menu" in data:
                    return data
                if "model" in data:
                    return data["model"]
                # Some instances nest under data["Data"] or similar — add cases if needed
                return {"Menu": data}  # fallback
        except Exception:
            pass
    return None

def merge_period(menu_struct, acc, forced_period_id=None, forced_period_name=None):
    """
    acc: meal -> station -> pid -> item
    forced_*: if the response is for a specific period (e.g. you fetched ?periodId=1423),
              use these when an item/station doesn't carry a period id.
    """
    menu = menu_struct.get("Menu", menu_struct)  # tolerate either shape

    # Period lookup for names
    periods = {str(p["PeriodId"]): p["Name"]
               for p in (menu.get("MenuPeriods") or [])
               if "PeriodId" in p and "Name" in p}

    # If caller provided a forced period, make sure we know its name
    if forced_period_id is not None:
        forced_period_id = str(forced_period_id)
        if not forced_period_name:
            forced_period_name = periods.get(forced_period_id, f"Period {forced_period_id}")

    # Stations: id -> {name, periodId?}
    stations = {}
    for s in (menu.get("Stations") or []):
        sid = str(s.get("StationId") or s.get("Id") or "")
        if not sid: 
            continue
        p_id = (s.get("MenuPeriodId") or s.get("PeriodId") or (s.get("MenuPeriod") or {}).get("PeriodId"))
        stations[sid] = {
            "name": s.get("Name") or f"Station {sid}",
            "periodId": str(p_id) if p_id is not None else None
        }

    # Merge products
    for mp in (menu.get("MenuProducts") or []):
        sid = str(mp.get("StationId") or "")
        prod = (mp.get("Product") or {})
        pid  = prod.get("ProductId") or mp.get("ProductId")
        title = (prod.get("MarketingName") or prod.get("DisplayName") or "").strip()
        if not pid or not title:
            continue

        # Resolve period for this item
        p_id = (
            stations.get(sid, {}).get("periodId")
            or mp.get("MenuPeriodId")
            or mp.get("PeriodId")
        )
        p_id = str(p_id) if p_id is not None else None

        # If still unknown, fall back to the period we *fetched*
        if not p_id and forced_period_id:
            p_id = forced_period_id

        meal = periods.get(p_id, None)
        if not meal and forced_period_id:
            meal = forced_period_name or f"Period {forced_period_id}"
        if not meal:
            meal = f"Period {p_id or '?'}"

        station_name = stations.get(sid, {}).get("name") or (f"Station {sid}" if sid else "Station ?")

        acc.setdefault(meal, {}).setdefault(station_name, {})[pid] = {
            "title": title,
            "productId": pid,
            "stationId": sid,
            "periodId": p_id,
            "diets": [d["Name"] for d in (prod.get("DietaryInformation") or []) if d.get("IsEnabled")],
            "categories": [c["DisplayName"] for c in (prod.get("Categories") or []) if c.get("DisplayName")],
        }

def main():
    BASE_URL = "https://virginia.campusdish.com/en/locationsandmenus/observatoryhilldiningroom/"
    model = get_model_from_html(BASE_URL)

    date_str = model.get("Date")            # "MM/DD/YYYY"
    location_id = str(model.get("LocationId") or "")
    menu = model.get("Menu", {})
    periods = [(str(p["PeriodId"]), p["Name"]) for p in (menu.get("MenuPeriods") or [])]

    grouped = {}

    # Merge the currently selected period on the base page
    sel_pid = str(model.get("SelectedPeriodId") or "")
    sel_name = next((name for pid, name in periods if pid == sel_pid), None)
    merge_period(model, grouped, forced_period_id=sel_pid, forced_period_name=sel_name)

    # Fetch and merge each period explicitly
    for pid, pname in periods:
        # Try API first
        api_data = try_api(location_id, date_str, pid) if (location_id and date_str) else None
        if api_data:
            merge_period(api_data, grouped, forced_period_id=pid, forced_period_name=pname)
            continue

        # Fallback: period-specific HTML
        url = f"{BASE_URL}?periodId={pid}"
        try:
            m2 = get_model_from_html(url)
            merge_period(m2, grouped, forced_period_id=pid, forced_period_name=pname)
        except Exception:
            pass  # Some periods may legitimately be empty

    # Pretty-print in meal order
    MEAL_ORDER = {"Breakfast": 0, "Brunch": 1, "Lunch": 2, "Dinner": 3, "Late Night": 4}
    def meal_key(m): return MEAL_ORDER.get(m, 99)

    print(f"O'Hill • {date_str}")
    for meal in sorted(grouped.keys(), key=meal_key):
        print(meal)
        for station in sorted(grouped[meal].keys()):
            print(f"  {station}")
            items = list(grouped[meal][station].values())
            for it in sorted(items, key=lambda x: x["title"].lower()):
                print(f"    - {it['title']}")

if __name__ == "__main__":
    main()