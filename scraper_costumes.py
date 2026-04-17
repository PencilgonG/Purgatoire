#!/usr/bin/env python3
"""Find costume stats — they're in the gear list or character page under a different key"""
import requests, json, time
from bs4 import BeautifulSoup
from pathlib import Path

OUT = Path("scraper_output")
session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})

def get(url):
    try:
        r = session.get(url, timeout=15); r.raise_for_status(); time.sleep(0.3); return r
    except Exception as e: print(f"  ❌ {url}: {e}"); return None

def ndata(html):
    s = BeautifulSoup(html,"html.parser").find("script",{"id":"__NEXT_DATA__"})
    if not s: return None
    try: return json.loads(s.string)
    except: return None

def fix(s):
    if not isinstance(s,str): return s
    try: return s.encode('latin-1').decode('utf-8')
    except: return s

def fixo(o):
    if isinstance(o,dict): return {k:fixo(v) for k,v in o.items()}
    if isinstance(o,list): return [fixo(i) for i in o]
    if isinstance(o,str): return fix(o)
    return o

# 1. Check if costumes appear in the full gear list (with division=Costume?)
print("1. Checking gear list for costumes...")
r = get("https://zeroluck.gg/7dso/gear/")
nd = ndata(r.text)
props = nd["props"]["pageProps"]
gears = fixo(props.get("gears", []))
divisions = {}
for g in gears:
    d = g.get("division","?")
    divisions[d] = divisions.get(d,0) + 1
print(f"  Gear divisions: {divisions}")
print(f"  Gear total: {len(gears)}")
# Check if any costume-like items
for g in gears[:3]:
    print(f"  Sample gear keys: {list(g.keys())}")
    break

# 2. Full Tioreh character page — dump ALL data
print("\n2. Full Tioreh character data...")
r2 = get("https://zeroluck.gg/7dso/characters/tioreh/")
nd2 = ndata(r2.text)
char = fixo(nd2["props"]["pageProps"].get("character",{}))
print(f"  Character keys: {list(char.keys())}")

# Costumes details
costumes = char.get("costumes",[])
print(f"  Costumes: {len(costumes)}")
for c in costumes[:2]:
    print(f"\n  Costume keys: {list(c.keys())}")
    print(f"  Full: {json.dumps(c, ensure_ascii=False)[:500]}")

# 3. Check origindb character for costume stats
print("\n3. OriginDB Tioreh page...")
r3 = get("https://origindb.gg/en/characters/tioreh/18")
if r3:
    nd3 = ndata(r3.text)
    if nd3:
        props3 = fixo(nd3["props"]["pageProps"])
        print(f"  pageProps keys: {list(props3.keys())}")
        # Look for costume/skin data
        def dump_keys(d, depth=0, path=""):
            if depth > 4: return
            if isinstance(d, dict):
                for k, v in d.items():
                    if any(w in str(k).lower() for w in ["cost","skin","gear","equip","stat"]):
                        print(f"  KEY: {path}.{k} = {str(v)[:120]}")
                    dump_keys(v, depth+1, f"{path}.{k}")
            elif isinstance(d, list) and d:
                dump_keys(d[0], depth+1, f"{path}[0]")
        dump_keys(props3)
        # Save full data
        with open(OUT/"origindb_tioreh.json","w") as f:
            json.dump(props3, f, ensure_ascii=False, indent=2)
        print("  Saved origindb_tioreh.json")

# 4. Check if costume items accessible via item_id on zeroluck
print("\n4. Trying zeroluck item by ID...")
# costume itemId was "134100201" for Tioreh
for test_path in [
    "https://zeroluck.gg/7dso/gear/134100201/",
    "https://zeroluck.gg/7dso/items/134100201/",
    "https://zeroluck.gg/7dso/costume/adorable-fairy/",
]:
    r4 = get(test_path)
    if r4:
        print(f"  ✅ Found at {test_path}")
        nd4 = ndata(r4.text)
        if nd4:
            p4 = fixo(nd4["props"]["pageProps"])
            print(f"  Keys: {list(p4.keys())}")
        break

# 5. Save existing costumes.json for builder (without stats for now)
print("\n5. Building costumes dataset from all chars...")
all_costumes = []
char_slugs_r = get("https://zeroluck.gg/7dso/characters/")
char_slugs = list(set(
    a['href'].strip('/').split('/')[-1]
    for a in BeautifulSoup(char_slugs_r.text,"html.parser").select('a[href*="/7dso/characters/"]')
    if a['href'] not in ('/7dso/characters/',)
))

with open(OUT/"costumes.json", encoding='utf-8') as f:
    existing = json.load(f)

print(f"  Already have {len(existing)} costumes")
# Check if costume stats are in character page under a different structure
r5 = get("https://zeroluck.gg/7dso/characters/meliodas/")
nd5 = ndata(r5.text)
char5 = fixo(nd5["props"]["pageProps"].get("character",{}))
meli_costumes = char5.get("costumes",[])
print(f"\n  Meliodas costumes: {len(meli_costumes)}")
for c in meli_costumes:
    print(f"  {c.get('name','')} — full keys: {list(c.keys())}")
    # Try to get stats from all possible fields
    for k in ['stats','stat','effects','ability','passive','gear_stats','item_stats']:
        if c.get(k): print(f"    {k}: {c[k]}")
