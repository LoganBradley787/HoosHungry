import requests, re, json, os
from datetime import datetime, timezone

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
    """Return the RAW API response (dict) for a period if available; else None."""
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
                return r.json()  # return EXACT response body
        except Exception:
            pass
    return None

def main(dump_dir: str = "ohill_dumps", also_split_files: bool = False):
    os.makedirs(dump_dir, exist_ok=True)

    # 1) BASE MODEL (from HTML)
    base_model = get_model_from_html(BASE_URL)
    date_str = base_model.get("Date") or ""       # "MM/DD/YYYY"
    location_id = str(base_model.get("LocationId") or "")
    menu = base_model.get("Menu", {})
    periods = [(str(p["PeriodId"]), p.get("Name")) for p in (menu.get("MenuPeriods") or [])]
    sel_pid = str(base_model.get("SelectedPeriodId") or "")

    # 2) PERIOD RAW FETCHES (API first, then HTML fallback)
    period_payloads = {}
    for pid, pname in periods:
        payload = None
        source = None

        if location_id and date_str:
            payload = try_api(location_id, date_str, pid)
            if payload is not None:
                source = "api"

        if payload is None:
            # fallback to period-specific HTML
            try:
                payload = get_model_from_html(f"{BASE_URL}?periodId={pid}")
                source = "html"
            except Exception:
                payload = None

        period_payloads[pid] = {
            "name": pname,
            "source": source,
            "raw": payload  # may be None if truly empty
        }

        # Optional: write each period to its own file
        if also_split_files:
            out_path = os.path.join(dump_dir, f"period_{pid}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(period_payloads[pid], f, indent=2, ensure_ascii=False)

    # 3) WRITE ONE BIG COMBINED RAW DUMP
    combined = {
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00","Z"),
        "base_url": BASE_URL,
        "date": date_str,
        "location_id": location_id,
        "selected_period_id": sel_pid,
        "base_model_raw": base_model,     # EXACT base model JSON
        "periods": period_payloads        # EXACT per-period JSONs (or None)
    }

    # Name file with normalized date if possible
    out_name = f"ohill_raw_{date_str.replace('/','-') or 'unknown'}.json"
    out_path = os.path.join(dump_dir, out_name)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)

    print(f"Wrote {out_path}")
    if also_split_files:
        print(f"Also wrote individual period files in {dump_dir}/")

if __name__ == "__main__":
    # Set also_split_files=True if you want per-period JSON files too.
    main(also_split_files=False)