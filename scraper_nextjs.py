#!/usr/bin/env python3
"""
Scraper zeroluck.gg via __NEXT_DATA__ JSON embarqué dans le HTML
Next.js pré-rend les données dans <script id="__NEXT_DATA__">
"""
import requests, csv, json, time
from bs4 import BeautifulSoup
from pathlib import Path

BASE    = "https://zeroluck.gg"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
OUT     = Path("scraper_output")
session = requests.Session()
session.headers.update(HEADERS)

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            return r
        except Exception as e:
            if i == retries-1: print(f"  ❌ {url}: {e}")
            time.sleep(2)
    return None

def extract_next_data(html):
    """Extract __NEXT_DATA__ JSON from Next.js page"""
    soup = BeautifulSoup(html, "html.parser")
    script = soup.find("script", {"id": "__NEXT_DATA__"})
    if not script:
        return None
    try:
        return json.loads(script.string)
    except:
        return None

def read_csv(name):
    rows = []
    with open(OUT / name, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    return rows

def write_csv(name, rows, fields):
    p = OUT / name
    with open(p, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"✅ {p} — {len(rows)} lignes")

def flatten_stats(data_dict, prefix=""):
    """Flatten nested dict to flat key:value pairs"""
    result = {}
    if not isinstance(data_dict, dict):
        return result
    for k, v in data_dict.items():
        key = f"{prefix}_{k}" if prefix else k
        if isinstance(v, (str, int, float, bool, type(None))):
            result[key] = v
        elif isinstance(v, list):
            result[key] = json.dumps(v, ensure_ascii=False)
        elif isinstance(v, dict):
            result.update(flatten_stats(v, key))
    return result

# Test one gear page first
def test_one():
    print("🔍 Testing __NEXT_DATA__ extraction...")
    r = get(f"{BASE}/7dso/gear/arachne-s-melody-belt/")
    if not r:
        print("❌ Can't reach site")
        return

    data = extract_next_data(r.text)
    if not data:
        print("❌ No __NEXT_DATA__ found")
        # Save for inspection
        with open(OUT / "test_gear_detail.html", "w", encoding="utf-8") as f:
            f.write(r.text[:50000])
        print("  → Saved test_gear_detail.html (first 50k chars)")
        return

    print("✅ __NEXT_DATA__ found!")
    print(f"  Keys: {list(data.keys())}")
    props = data.get("props", {}).get("pageProps", {})
    print(f"  pageProps keys: {list(props.keys())}")

    # Save full JSON for analysis
    with open(OUT / "test_next_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  → Saved test_next_data.json")

    # Try to find gear stats
    def find_stat_keys(d, depth=0, path=""):
        if depth > 6: return
        if isinstance(d, dict):
            for k, v in d.items():
                p = f"{path}.{k}"
                if any(word in str(k).lower() for word in ["stat", "atk", "attack", "def", "hp", "main", "sub"]):
                    print(f"    Potential stat key: {p} = {str(v)[:80]}")
                find_stat_keys(v, depth+1, p)
        elif isinstance(d, list) and d:
            find_stat_keys(d[0], depth+1, f"{path}[0]")

    find_stat_keys(props)

if __name__ == "__main__":
    test_one()
