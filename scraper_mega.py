#!/usr/bin/env python3
"""
Mega scraper 7DS Origin — zeroluck.gg + origindb.gg
Cible : costumes, stats complètes gear/weapons, masteries, characters
"""
import requests, json, time, re, csv, os
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urljoin, urlparse

BASE_ZL  = "https://zeroluck.gg/7dso"
BASE_ODB = "https://origindb.gg/en"
HEADERS  = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"}
OUT = Path("scraper_output")
OUT.mkdir(exist_ok=True)

session = requests.Session()
session.headers.update(HEADERS)

def get(url, retries=3, delay=0.3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            time.sleep(delay)
            return r
        except Exception as e:
            if i == retries-1: print(f"  ❌ {url}: {e}")
            time.sleep(2**i)
    return None

def next_data(html):
    soup = BeautifulSoup(html, "html.parser")
    s = soup.find("script", {"id": "__NEXT_DATA__"})
    if not s: return None
    try: return json.loads(s.string)
    except: return None

def save_json(name, data):
    p = OUT / name
    with open(p, "w", encoding="utf-8") as f: json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ {p} ({len(data) if isinstance(data, list) else 'dict'})")
    return data

def fix_enc(s):
    if not isinstance(s, str): return s
    try: return s.encode('latin-1').decode('utf-8')
    except: return s

def fix_obj(o):
    if isinstance(o, dict): return {k: fix_obj(v) for k,v in o.items()}
    if isinstance(o, list): return [fix_obj(i) for i in o]
    if isinstance(o, str): return fix_enc(o)
    return o

# ── 1. ZEROLUCK COSTUMES ─────────────────────────────────────────────────────
def scrape_zl_costumes():
    print("\n👘 ZeroLuck — Costumes...")
    results = []
    # Try multiple possible paths
    for path in ["/costumes/", "/costume/", "/characters/"]:
        r = get(f"{BASE_ZL}{path}")
        if not r: continue
        nd = next_data(r.text)
        if nd:
            props = nd.get("props", {}).get("pageProps", {})
            print(f"  Found __NEXT_DATA__ at {path}: {list(props.keys())[:8]}")
            # Look for costume data
            for key in ["costumes", "items", "costume_list", "data"]:
                if key in props:
                    print(f"  Key '{key}' found: {str(props[key])[:200]}")

    # Try direct costume URLs from gear scraper knowledge
    r = get(f"{BASE_ZL}/costumes/")
    if not r:
        print("  No /costumes/ page, trying gear page for costume items...")
        r = get(f"{BASE_ZL}/gear/")
    if not r: return []

    nd = next_data(r.text)
    if nd:
        props = nd.get("props", {}).get("pageProps", {})
        # Look for all gear/costume items in the list page
        print(f"  List page pageProps keys: {list(props.keys())}")

    # Scrape individual costume pages from characters
    chars_r = get(f"{BASE_ZL}/characters/")
    if chars_r:
        soup = BeautifulSoup(chars_r.text, "html.parser")
        char_links = [a['href'] for a in soup.select('a[href*="/7dso/characters/"]') if a['href'] not in ('/7dso/characters/',)]
        char_links = list(set(char_links))
        print(f"  Found {len(char_links)} character pages, scraping costumes...")
        for clink in char_links[:5]:  # Test first 5
            cr = get(f"https://zeroluck.gg{clink}")
            if not cr: continue
            nd = next_data(cr.text)
            if nd:
                props = nd.get("props", {}).get("pageProps", {})
                char = props.get("character") or props.get("hero") or {}
                costumes = char.get("costumes") or char.get("costume_list") or props.get("costumes") or []
                if costumes:
                    print(f"  {clink}: found {len(costumes)} costumes!")
                    print(f"  Sample: {json.dumps(costumes[0] if costumes else {}, ensure_ascii=False)[:300]}")
                    break
                else:
                    # Dump all keys for inspection
                    def find_costume_keys(d, depth=0, path=""):
                        if depth > 5: return
                        if isinstance(d, dict):
                            for k, v in d.items():
                                if 'cost' in str(k).lower():
                                    print(f"    Costume key found: {path}.{k} = {str(v)[:100]}")
                                find_costume_keys(v, depth+1, f"{path}.{k}")
                        elif isinstance(d, list) and d:
                            find_costume_keys(d[0], depth+1, f"{path}[0]")
                    find_costume_keys(props)

    return results

# ── 2. ORIGINDB.GG ────────────────────────────────────────────────────────────
def scrape_origindb():
    print("\n🌐 OriginDB.gg — Exploring structure...")
    results = {"gear": [], "weapons": [], "costumes": [], "masteries": []}

    # Homepage
    r = get(BASE_ODB)
    if not r:
        print("  ❌ Can't reach origindb.gg")
        return results

    soup = BeautifulSoup(r.text, "html.parser")
    print(f"  Title: {soup.title.string if soup.title else '?'}")

    # Find all internal links
    links = set()
    for a in soup.find_all("a", href=True):
        href = a['href']
        if href.startswith('/en/') or href.startswith('https://origindb.gg'):
            links.add(href)
    print(f"  Found {len(links)} internal links: {list(links)[:15]}")

    # Check for Next.js data
    nd = next_data(r.text)
    if nd:
        print(f"  __NEXT_DATA__ keys: {list(nd.get('props',{}).get('pageProps',{}).keys())[:10]}")
        # Save for analysis
        save_json("origindb_home_nextdata.json", nd)

    # Try common paths
    for path in ["/en/gear", "/en/weapon", "/en/weapons", "/en/costume", "/en/costumes",
                 "/en/equipment", "/en/items", "/en/mastery", "/en/heroes", "/en/characters"]:
        r2 = get(f"https://origindb.gg{path}")
        if not r2: continue
        nd2 = next_data(r2.text)
        if nd2:
            props = nd2.get("props",{}).get("pageProps",{})
            print(f"\n  ✅ {path}: pageProps keys = {list(props.keys())[:10]}")
            save_json(f"origindb_{path.replace('/','_')}_nextdata.json", nd2)
        else:
            soup2 = BeautifulSoup(r2.text, "html.parser")
            print(f"  {path}: title={soup2.title.string if soup2.title else '?'}")
        time.sleep(0.5)

    return results

# ── 3. ZEROLUCK MASTERY PAGES ────────────────────────────────────────────────
def scrape_zl_masteries():
    print("\n⚔️  ZeroLuck — Masteries...")
    for path in ["/mastery/", "/masteries/", "/weapon-mastery/"]:
        r = get(f"{BASE_ZL}{path}")
        if not r: continue
        nd = next_data(r.text)
        if nd:
            props = nd.get("props",{}).get("pageProps",{})
            print(f"  Found at {path}: {list(props.keys())[:10]}")
            save_json("mastery_page.json", nd)
            return nd
    print("  No dedicated mastery page found")
    return None

# ── 4. ZEROLUCK GEAR DETAIL WITH RANDOM OPTS ─────────────────────────────────
def scrape_gear_randoms():
    print("\n🎲 ZeroLuck — Gear random opts (testing)...")
    # Some gear has random options - find those
    r = get(f"{BASE_ZL}/gear/archangel-s-ring-of-blessing/")  # Test SSR accessory likely to have randoms
    if not r: return
    nd = next_data(r.text)
    if nd:
        props = nd.get("props",{}).get("pageProps",{})
        gear = props.get("gear",{})
        stats = gear.get("stats",{})
        passive_opts = gear.get("passiveOptions") or gear.get("passive_options") or []
        print(f"  passive_options: {json.dumps(passive_opts[:2], ensure_ascii=False)}")

        # Look deeper for random stats
        def find_random(d, depth=0, path=""):
            if depth > 6: return
            if isinstance(d, dict):
                for k, v in d.items():
                    if any(w in str(k).lower() for w in ["random", "option", "roll", "passive", "sub_rand"]):
                        if v: print(f"    {path}.{k} = {str(v)[:150]}")
                    find_random(v, depth+1, f"{path}.{k}")
            elif isinstance(d, list) and d:
                find_random(d[0], depth+1, f"{path}[0]")
        find_random(props)

# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Mega Scraper 7DS Origin")
    print("=" * 50)

    scrape_zl_costumes()
    scrape_origindb()
    scrape_zl_masteries()
    scrape_gear_randoms()

    print("\n📁 Résultats dans scraper_output/")
    print("   → Uploade les fichiers JSON générés pour analyse")
