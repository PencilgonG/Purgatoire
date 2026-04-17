#!/usr/bin/env python3
"""
Scraper FINAL — Costumes (BindArmor) + bind_stats + effects + masteries
"""
import requests, json, time
from bs4 import BeautifulSoup
from pathlib import Path

OUT = Path("scraper_output")
session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15); r.raise_for_status(); time.sleep(0.25); return r
        except Exception as e:
            if i==retries-1: print(f"  ❌ {e}")
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
    print(f"✅ {OUT/name}")

# ── 1. COSTUMES via BindArmor gear items ──────────────────────────────────────
def scrape_costumes():
    print("\n👘 Scraping costumes (BindArmor gear items)...")
    r = get("https://zeroluck.gg/7dso/gear/")
    nd = ndata(r.text)
    gears = fixo(nd["props"]["pageProps"].get("gears",[]))
    bind_items = [g for g in gears if g.get("division") == "BindArmor"]
    print(f"  {len(bind_items)} BindArmor costumes in list")

    # Get character pages for bind_stats and effects
    chars_r = get("https://zeroluck.gg/7dso/characters/")
    char_slugs = list(set(
        a['href'].strip('/').split('/')[-1]
        for a in BeautifulSoup(chars_r.text,"html.parser").select('a[href*="/7dso/characters/"]')
        if a['href'] not in ('/7dso/characters/',)
    ))

    # Build costume map from character pages
    costume_map = {}  # itemId → costume data with stats
    mastery_data = {}  # char_slug → mastery info
    char_full_data = []

    print(f"  Scraping {len(char_slugs)} character pages...")
    for i, slug in enumerate(char_slugs):
        if i % 5 == 0: print(f"  {i}/{len(char_slugs)}...")
        r2 = get(f"https://zeroluck.gg/7dso/characters/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        props = nd2["props"]["pageProps"]
        char = fixo(props.get("character",{}))

        # Costumes + bind_stats
        for c in char.get("costumes",[]):
            cid = str(c.get("itemId") or c.get("id",""))
            costume_map[cid] = {
                "char_slug":   slug,
                "char_nom":    char.get("name_fr") or char.get("name",""),
                "id":          cid,
                "nom":         c.get("name",""),
                "description": c.get("description",""),
                "image_url":   c.get("image_url",""),
                "default":     c.get("default",False),
                "variant_lv":  c.get("variant_level",1),
                "effects":     json.dumps(c.get("effects",[]), ensure_ascii=False),
                "bind_stats":  json.dumps(c.get("bind_stats",{}), ensure_ascii=False),
            }

        # Masteries — check progression_sections and combinations
        prog = char.get("progression_sections",[])
        compat_weapons = char.get("compatible_weapons",[])
        combinations = char.get("combinations",[])

        mastery_data[slug] = {
            "compatible_weapons": json.dumps(compat_weapons, ensure_ascii=False),
            "combinations": json.dumps(combinations[:2] if combinations else [], ensure_ascii=False),
            "progression_sections_count": len(prog),
        }

        # Save first char with progression for analysis
        if prog and slug == "meliodas":
            save("char_meliodas_full.json", char)

        # Build char data
        weapons_info = char.get("weapons",[])
        char_full_data.append({
            "slug": slug,
            "nom":  char.get("name_fr") or char.get("name",""),
            "armes": " / ".join([w.get("weapon_type","") or w.get("type","") for w in weapons_info]),
            "elements": " / ".join([w.get("element","") for w in weapons_info]),
            "image_url": char.get("image_url",""),
            "costumes": [{"id":c.get("id"),"nom":c.get("name"),"image_url":c.get("image_url"),"default":c.get("default")} for c in char.get("costumes",[])],
        })
        time.sleep(0.2)

    # Now scrape BindArmor gear detail pages for stats
    print(f"\n  Scraping {len(bind_items)} costume gear detail pages...")
    costumes_final = []
    for i, item in enumerate(bind_items):
        if i % 10 == 0: print(f"  {i}/{len(bind_items)}...")
        slug = item.get("slug_en","")
        if not slug: continue
        r3 = get(f"https://zeroluck.gg/7dso/gear/{slug}/")
        if not r3: continue
        nd3 = ndata(r3.text)
        if not nd3: continue
        gear = fixo(nd3["props"]["pageProps"].get("gear",{}))
        stats = gear.get("stats",{})

        main_stat, main_val = "", 0
        subs = []
        if stats.get("main"):
            m = stats["main"][0]
            main_stat = m.get("ability_type","")
            main_val  = m.get("value_total",0)
        for s in stats.get("sub",[]):
            subs.append({"stat":s.get("ability_type",""),"val":s.get("value_total",0)})

        # Match with char costume data
        item_id = str(item.get("id",""))
        char_c = costume_map.get(item_id, {})

        costumes_final.append({
            "id":          item_id,
            "slug":        slug,
            "nom":         item.get("name_fr") or item.get("name_en") or gear.get("name_fr") or gear.get("name",""),
            "char_slug":   char_c.get("char_slug",""),
            "char_nom":    char_c.get("char_nom",""),
            "description": char_c.get("description",""),
            "image_url":   item.get("image_raw_url") or item.get("image_url",""),
            "rarete":      item.get("rarity") or item.get("grade",""),
            "default":     char_c.get("default",False),
            "variant_lv":  char_c.get("variant_lv",1),
            "main_stat":   main_stat,
            "main_val":    main_val,
            "subs":        json.dumps(subs, ensure_ascii=False),
            "effects":     char_c.get("effects","[]"),
            "bind_stats":  char_c.get("bind_stats","{}"),
        })
        time.sleep(0.2)

    save("costumes_full.json", costumes_final)
    save("mastery_data.json", mastery_data)
    save("characters_full.json", char_full_data)
    print(f"  → {len(costumes_final)} costumes avec stats")
    return costumes_final, char_full_data

if __name__ == "__main__":
    print("🚀 Scraper Final — Costumes + Masteries")
    print("=" * 50)
    costumes, chars = scrape_costumes()
    print(f"\n✅ Done: {len(costumes)} costumes, {len(chars)} persos")
    print("📁 Fichiers: costumes_full.json, characters_full.json, mastery_data.json")
