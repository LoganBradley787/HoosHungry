import requests, re, json
from collections import defaultdict

BASE_URL = "https://virginia.campusdish.com/en/locationsandmenus/observatoryhilldiningroom/"

def extract_braced_object(s: str, start_idx: int) -> str:
    """Return the JSON object starting at the first '{' after start_idx.
    Handles nested braces and quoted strings."""
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

def merge_period(menu_struct, acc, forced_period_id=None, forced_period_name=None):
    """
    acc: meal -> station -> pid -> item
    forced_*: the period we explicitly fetched (?periodId=...), used when data lacks period info.
    """
    menu = menu_struct.get("Menu", menu_struct)

    periods = {str(p["PeriodId"]): p["Name"]
               for p in (menu.get("MenuPeriods") or [])
               if "PeriodId" in p and "Name" in p}

    if forced_period_id is not None:
        forced_period_id = str(forced_period_id)
        if not forced_period_name:
            forced_period_name = periods.get(forced_period_id, f"Period {forced_period_id}")

    # Stations
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

    # Products
    for mp in (menu.get("MenuProducts") or []):
        sid = str(mp.get("StationId") or "")
        prod = (mp.get("Product") or {})
        pid  = prod.get("ProductId") or mp.get("ProductId")
        title = (prod.get("MarketingName") or prod.get("DisplayName") or "").strip()
        if not pid or not title:
            continue

        # Resolve period for this item
        p_id = (stations.get(sid, {}).get("periodId")
                or mp.get("MenuPeriodId") or mp.get("PeriodId"))
        p_id = str(p_id) if p_id else None
        if not p_id and forced_period_id:
            p_id = forced_period_id

        meal = periods.get(p_id) or forced_period_name or f"Period {p_id or '?'}"
        station_name = stations.get(sid, {}).get("name") or (f"Station {sid}" if sid else "Station ?")

        acc.setdefault(meal, {}).setdefault(station_name, {})[pid] = {
            "title": title,
            "productId": pid,
            "stationId": sid,
            "periodId": p_id,
            "diets": [d["Name"] for d in (prod.get("DietaryInformation") or []) if d.get("IsEnabled")],
            "categories": [c["DisplayName"] for c in (prod.get("Categories") or []) if c.get("DisplayName")],
        }

def build_menu_json():
    # Load base page (whatever period is selected by default)
    base_model = get_model_from_html(BASE_URL)
    date_str = base_model.get("Date")  # "MM/DD/YYYY"
    menu = base_model.get("Menu", {})
    periods = [(str(p["PeriodId"]), p["Name"]) for p in (menu.get("MenuPeriods") or [])]

    grouped = {}

    # Merge currently selected period
    sel_pid = str(base_model.get("SelectedPeriodId") or "")
    sel_name = next((name for pid, name in periods if pid == sel_pid), None)
    merge_period(base_model, grouped, forced_period_id=sel_pid, forced_period_name=sel_name)

    # Explicitly fetch each period via HTML ?periodId=
    for pid, pname in periods:
        try:
            m2 = get_model_from_html(f"{BASE_URL}?periodId={pid}")
            merge_period(m2, grouped, forced_period_id=pid, forced_period_name=pname)
        except Exception:
            # Some periods may legitimately be empty; ignore gracefully
            pass

    # Order meals nicely
    MEAL_ORDER = {"Breakfast": 0, "Brunch": 1, "Lunch": 2, "Dinner": 3, "Late Night": 4}
    def meal_key(m): return MEAL_ORDER.get(m, 99)

    meals_out = []
    for meal in sorted(grouped.keys(), key=meal_key):
        stations_out = []
        for st_name in sorted(grouped[meal].keys()):
            items = list(grouped[meal][st_name].values())
            items.sort(key=lambda x: x["title"].lower())
            stations_out.append({"name": st_name, "items": items})
        meals_out.append({"name": meal, "stations": stations_out})

    return {
        "venue": "O'Hill",
        "date": date_str,
        "meals": meals_out,
    }

if __name__ == "__main__":
    data = build_menu_json()
    print(json.dumps(data, indent=2, ensure_ascii=False))
    with open("ohill_menu.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("\nWrote ohill_menu.json")