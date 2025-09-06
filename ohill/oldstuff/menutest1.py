import requests, re, json, sys
from collections import defaultdict, OrderedDict

URL = "https://virginia.campusdish.com/en/locationsandmenus/observatoryhilldiningroom/"

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
            if c in ('"', "'"):
                in_str = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    return s[i:j+1]
        j += 1
    raise ValueError("Unbalanced braces")

def get_model():
    r = requests.get(URL, timeout=30)
    r.raise_for_status()
    html = r.text
    m = re.search(r'\bmodel\s*:', html)
    if not m:
        raise RuntimeError("Could not find 'model:'")
    return json.loads(extract_braced_object(html, m.end()))

def normalize(model):
    menu = model.get("Menu", {})

    # Periods (id -> name)
    period_name = {str(p["PeriodId"]): p["Name"]
                   for p in menu.get("MenuPeriods", [])
                   if "PeriodId" in p and "Name" in p}

    # Stations (id -> {name, periodId})
    station_info = {}
    for s in menu.get("Stations", []) or []:
        sid = str(s.get("StationId") or s.get("Id") or "")
        if not sid: 
            continue
        # CampusDish is inconsistent: try several keys
        p_id = (s.get("MenuPeriodId") or s.get("PeriodId") 
                or (s.get("MenuPeriod") or {}).get("PeriodId"))
        station_info[sid] = {
            "name": s.get("Name") or f"Station {sid}",
            "periodId": str(p_id) if p_id is not None else None
        }

    def resolve_period_id(mp, sid):
        # 1) from station
        s = station_info.get(str(sid) if sid is not None else "")
        if s and s.get("periodId"):
            return s["periodId"]
        # 2) from the menu product itself
        for k in ("MenuPeriodId", "PeriodId"):
            if mp.get(k) is not None:
                return str(mp[k])
        # 3) fallback to selected (usually Breakfast)
        sel = model.get("SelectedPeriodId")
        return str(sel) if sel is not None else None

    grouped = {}  # meal -> station -> pid -> item
    for mp in menu.get("MenuProducts", []) or []:
        sid = mp.get("StationId")
        pid = (mp.get("Product") or {}).get("ProductId") or mp.get("ProductId")
        prod = (mp.get("Product") or {})
        name = (prod.get("MarketingName") or prod.get("DisplayName") or "").strip()
        if not name:
            continue

        period_id = resolve_period_id(mp, sid)
        meal_name = period_name.get(period_id, f"Period {period_id or '?'}")

        st = station_info.get(str(sid) if sid is not None else "", {})
        station_name = st.get("name") or (f"Station {sid}" if sid else "Station ?")

        grouped.setdefault(meal_name, {}).setdefault(station_name, {})[pid] = {
            "title": name,
            "productId": pid,
            "stationId": sid,
            "periodId": period_id,
            "diets": [d["Name"] for d in prod.get("DietaryInformation", []) if d.get("IsEnabled")],
            "categories": [c["DisplayName"] for c in prod.get("Categories", []) if c.get("DisplayName")],
        }

    # Stable meal order
    MEAL_ORDER = {"Breakfast": 0, "Brunch": 1, "Lunch": 2, "Dinner": 3, "Late Night": 4}
    def meal_key(m): return MEAL_ORDER.get(m, 99)

    meals_out = []
    for meal in sorted(grouped.keys(), key=meal_key):
        stations = []
        for st_name in sorted(grouped[meal].keys()):
            items = list(grouped[meal][st_name].values())
            items.sort(key=lambda x: x["title"].lower())
            stations.append({"name": st_name, "items": items})
        meals_out.append({"name": meal, "stations": stations})

    return {
        "venue": "O'Hill",
        "date": model.get("Date"),
        "generated_at": model.get("GeneratedAt") or model.get("Date"),
        "meals": meals_out,
    }

def print_pretty(struct):
    print(f"{struct['venue']} • {struct['date']}")
    for meal in struct["meals"]:
        print(meal["name"])
        for st in meal["stations"]:
            print(f"  {st['name']}")
            for it in st["items"]:
                print(f"    - {it['title']}")

if __name__ == "__main__":
    model = get_model()
    struct = normalize(model)
    print_pretty(struct)

    # write JSON for your site
    out_path = "menu_test1.json" if len(sys.argv) < 2 else sys.argv[1]
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(struct, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {out_path}")