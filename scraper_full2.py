#!/usr/bin/env python3
"""
Scraper final — costumes + masteries + gear complet + origindb items
"""
import requests, json, time, csv
from bs4 import BeautifulSoup
from pathlib import Path

BASE_ZL  = "https://zeroluck.gg/7dso"
BASE_ODB = "https://origindb.gg/en"
HEADERS  = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8"}
OUT = Path("scraper_output")
OUT.mkdir(exist_ok=True)

session = requests.Session()
session.headers.update(HEADERS)

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15); r.raise_for_status(); return r
        except Exception as e:
            if i==retries-1: print(f"  ❌ {url}: {e}")
            time.sleep(2**i)
    return None

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

def save(name, data):
    with open(OUT/name,"w",encoding="utf-8") as f: json.dump(data,f,ensure_ascii=False,indent=2)
    n = len(data) if isinstance(data,list) else len(data) if isinstance(data,dict) else '?'
    print(f"✅ {OUT/name} ({n})")

# ─────────────────────────────────────────────────────────────────────────────
# 1. ZEROLUCK — COSTUMES + MASTERIES par perso
# ─────────────────────────────────────────────────────────────────────────────
def scrape_chars_full():
    print("\n👤 Characters + Costumes + Masteries (ZeroLuck)...")
    r = get(f"{BASE_ZL}/characters/")
    if not r: return []
    soup = BeautifulSoup(r.text,"html.parser")
    char_slugs = list(set(
        a['href'].strip('/').split('/')[-1]
        for a in soup.select('a[href*="/7dso/characters/"]')
        if a['href'] not in ('/7dso/characters/',)
    ))
    print(f"  {len(char_slugs)} characters found")

    all_costumes = []
    all_masteries = []
    char_data = []

    for i, slug in enumerate(char_slugs):
        if i % 5 == 0: print(f"  {i}/{len(char_slugs)}...")
        r = get(f"https://zeroluck.gg/7dso/characters/{slug}/")
        if not r: continue
        nd = ndata(r.text)
        if not nd: continue
        props = nd.get("props",{}).get("pageProps",{})
        char = props.get("character") or props.get("hero") or {}
        char = fixo(char)

        # Costumes
        costumes = char.get("costumes") or []
        for c in costumes:
            all_costumes.append({
                "char_slug":   slug,
                "char_nom":    char.get("name_fr") or char.get("name_en") or char.get("name",""),
                "id":          c.get("id") or c.get("itemId"),
                "item_id":     c.get("itemId"),
                "nom":         c.get("name_fr") or c.get("name_en") or c.get("name",""),
                "description": c.get("description_fr") or c.get("description_en") or c.get("description",""),
                "image_url":   c.get("image_url") or c.get("imageUrl") or c.get("icon_url",""),
                "default":     c.get("default",False),
                "unique":      c.get("unique",False),
                "variant_lv":  c.get("variant_level",1),
                # Stats si dispo
                "main_stat":   "",
                "main_val":    0,
                "sub_stats":   json.dumps(c.get("stats",{}).get("sub",[]), ensure_ascii=False),
            })

        # Masteries
        masteries = char.get("masteries") or char.get("weapon_masteries") or []
        for m in masteries:
            all_masteries.append({
                "char_slug": slug,
                "weapon_type": m.get("weapon_type") or m.get("type",""),
                "name": m.get("name_fr") or m.get("name",""),
                "tiers": json.dumps(m.get("tiers") or m.get("levels") or [], ensure_ascii=False),
            })

        # Basic char info
        char_data.append({
            "slug": slug,
            "nom":  char.get("name_fr") or char.get("name_en") or char.get("name",""),
            "armes": " / ".join([
                w.get("weapon_type","") for w in (char.get("weapons") or char.get("weapon_slots") or [])
            ]),
            "elements": " / ".join([
                w.get("element","") for w in (char.get("weapons") or char.get("weapon_slots") or [])
            ]),
            "image_url": char.get("image_url") or char.get("portrait_url",""),
            "costumes_count": len(costumes),
            "has_masteries": len(masteries) > 0,
        })
        time.sleep(0.25)

    print(f"  → {len(all_costumes)} costumes, {len(all_masteries)} masteries")

    # Get costume stats from gear pages (costumes are gear items)
    print("  Enriching costume stats from gear pages...")
    for c in all_costumes:
        if not c["item_id"]: continue
        # Try to find costume slug from gear list
        slug_guess = c["nom"].lower().replace(" ","-").replace("'","-").replace("é","e").replace("è","e").replace("ê","e")
        r2 = get(f"https://zeroluck.gg/7dso/gear/{slug_guess}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        gear = nd2.get("props",{}).get("pageProps",{}).get("gear",{})
        gear = fixo(gear)
        stats = gear.get("stats",{})
        if stats.get("main"):
            m = stats["main"][0]
            c["main_stat"] = m.get("ability_type","")
            c["main_val"]  = m.get("value_total",0)
        if stats.get("sub"):
            c["sub_stats"] = json.dumps([{"stat":s.get("ability_type",""),"val":s.get("value_total",0)} for s in stats["sub"]], ensure_ascii=False)
        time.sleep(0.2)

    save("costumes.json", all_costumes)
    save("masteries_chars.json", all_masteries)
    return all_costumes, all_masteries

# ─────────────────────────────────────────────────────────────────────────────
# 2. ZEROLUCK — GEAR complet avec sets et random opts
# ─────────────────────────────────────────────────────────────────────────────
def scrape_gear_full():
    print("\n⚙️  Gear complet + sets (ZeroLuck)...")
    r = get(f"{BASE_ZL}/gear/")
    if not r: return []
    nd = ndata(r.text)
    if not nd: return []
    props = nd.get("props",{}).get("pageProps",{})
    gears_list = fixo(props.get("gears") or [])
    gear_sets   = fixo(props.get("gearSets") or [])
    print(f"  {len(gears_list)} gear items, {len(gear_sets)} sets from list page")

    # Save sets data
    save("gear_sets.json", gear_sets)

    # Scrape each gear detail
    results = []
    for i, g in enumerate(gears_list):
        if i % 20 == 0: print(f"  {i}/{len(gears_list)}...")
        slug = g.get("slug_en") or g.get("slug","")
        if not slug: continue
        r2 = get(f"https://zeroluck.gg/7dso/gear/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        gear = fixo(nd2.get("props",{}).get("pageProps",{}).get("gear",{}))
        stats = gear.get("stats",{})

        main = {}
        if stats.get("main"):
            m = stats["main"][0]
            main = {"stat": m.get("ability_type",""), "val": m.get("value_total",0), "stages":{str(s["stage"]):s["value"] for s in m.get("stages",[])}}

        subs = []
        for s in stats.get("sub",[]):
            subs.append({"stat": s.get("ability_type",""), "val": s.get("value_total",0)})

        rand_opts = []
        passive_opts = gear.get("passiveOptions") or gear.get("passive_options") or []
        for opt in passive_opts:
            if isinstance(opt,dict) and opt.get("ability_type"):
                rand_opts.append({"stat":opt.get("ability_type",""),"min":opt.get("value_min",0),"max":opt.get("value_max",0),"pct":opt.get("probability",100)})

        set_info = gear.get("set_info") or []
        set_bonuses = []
        if isinstance(set_info, list):
            for si in set_info:
                bonus_list = si.get("bonus") or si.get("effects") or si.get("set_effects") or []
                for b in bonus_list if isinstance(bonus_list,list) else [bonus_list]:
                    if isinstance(b,dict):
                        desc = b.get("description",{})
                        set_bonuses.append({"pieces":b.get("set_parts_count",0),"desc":desc.get("fr") or desc.get("en","")})

        results.append({
            "id":         gear.get("id") or g.get("id"),
            "slug":       slug,
            "nom":        gear.get("name_fr") or gear.get("name",""),
            "slot":       gear.get("division",""),
            "type":       gear.get("detail_type",""),
            "rarete":     gear.get("rarity") or gear.get("grade",""),
            "image_url":  gear.get("image_url") or gear.get("image_raw_url",""),
            "main":       json.dumps(main, ensure_ascii=False),
            "subs":       json.dumps(subs, ensure_ascii=False),
            "rand_opts":  json.dumps(rand_opts, ensure_ascii=False),
            "set_name":   (set_info[0].get("name",{}).get("fr","") if set_info else ""),
            "set_count":  (set_info[0].get("pieces_count",0) if set_info else 0),
            "set_bonuses":json.dumps(set_bonuses, ensure_ascii=False),
        })
        time.sleep(0.2)

    save("gear_full2.json", results)
    return results

# ─────────────────────────────────────────────────────────────────────────────
# 3. ZEROLUCK — WEAPONS complet par perso et ATK par échelon
# ─────────────────────────────────────────────────────────────────────────────
def scrape_weapons_full():
    print("\n⚔️  Weapons complet (ZeroLuck)...")
    r = get(f"{BASE_ZL}/weapons/")
    if not r: return []
    nd = ndata(r.text)
    if not nd: return []
    props = nd.get("props",{}).get("pageProps",{})
    weapons_list = fixo(props.get("weapons") or props.get("items") or [])
    print(f"  {len(weapons_list)} weapons from list page, keys: {list(props.keys())}")

    results = []
    for i, w in enumerate(weapons_list[:5]):  # Test 5 first
        print(f"  Weapon keys: {list(w.keys())[:15]}")
        slug = w.get("slug_en") or w.get("slug","")
        if not slug: continue
        r2 = get(f"https://zeroluck.gg/7dso/weapons/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        wprop = nd2.get("props",{}).get("pageProps",{})
        print(f"  Weapon page keys: {list(wprop.keys())}")
        wp = fixo(wprop.get("weapon") or wprop.get("item") or {})
        print(f"  Weapon obj keys: {list(wp.keys())[:20]}")

        # Enchant options
        enchants = wp.get("enchant_options") or wp.get("weapon_enchant_options") or wp.get("enchantOptions") or []
        print(f"  Enchant options: {len(enchants)} slots")
        if enchants:
            print(f"  Slot 1: {json.dumps(enchants[0], ensure_ascii=False)[:200]}")
        break

    return results

# ─────────────────────────────────────────────────────────────────────────────
# 4. ORIGINDB — Items / Characters
# ─────────────────────────────────────────────────────────────────────────────
def scrape_origindb_full():
    print("\n🌐 OriginDB — Characters + Items...")

    # Characters list
    r = get(f"{BASE_ODB}/characters")
    if r:
        nd = ndata(r.text)
        if nd:
            props = nd.get("props",{}).get("pageProps",{})
            print(f"  /en/characters pageProps: {list(props.keys())}")
            chars = props.get("characters") or props.get("heroes") or props.get("data") or []
            if chars:
                print(f"  Found {len(chars)} characters")
                print(f"  Sample: {json.dumps(fixo(chars[0]), ensure_ascii=False)[:300]}")
                save("origindb_characters.json", fixo(chars))

    # Database items
    r2 = get(f"{BASE_ODB}/database/items")
    if r2:
        nd2 = ndata(r2.text)
        if nd2:
            props2 = nd2.get("props",{}).get("pageProps",{})
            print(f"  /en/database/items pageProps: {list(props2.keys())}")
            items = props2.get("items") or props2.get("data") or []
            if items:
                print(f"  Found {len(items)} items")
                print(f"  Sample: {json.dumps(fixo(items[0]), ensure_ascii=False)[:300]}")
                save("origindb_items.json", fixo(items))

    # Crafting
    r3 = get(f"{BASE_ODB}/database/crafting")
    if r3:
        nd3 = ndata(r3.text)
        if nd3:
            props3 = nd3.get("props",{}).get("pageProps",{})
            print(f"  /en/database/crafting pageProps: {list(props3.keys())}")
            crafting = props3.get("recipes") or props3.get("crafting") or props3.get("data") or []
            if crafting:
                print(f"  Found {len(crafting)} recipes")
                save("origindb_crafting.json", fixo(crafting))

    # Try first character detail
    r4 = get(f"{BASE_ODB}/characters/meliodas/16")
    if r4:
        nd4 = ndata(r4.text)
        if nd4:
            props4 = nd4.get("props",{}).get("pageProps",{})
            print(f"\n  Character page keys: {list(props4.keys())}")
            char = props4.get("character") or props4.get("hero") or {}
            print(f"  Char keys: {list(fixo(char).keys())[:20]}")
            save("origindb_meliodas.json", fixo(props4))

if __name__ == "__main__":
    print("🚀 Scraper Final 7DS Origin")
    print("=" * 50)

    costumes, masteries = scrape_chars_full()
    scrape_gear_full()
    scrape_weapons_full()
    scrape_origindb_full()

    print(f"\n📊 Résumé:")
    print(f"  Costumes: {len(costumes)}")
    print(f"  Masteries: {len(masteries)}")
    print(f"\n📁 Fichiers dans scraper_output/")
