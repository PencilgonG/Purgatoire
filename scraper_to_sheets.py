#!/usr/bin/env python3
"""
Scraper complet 7DS Origin → Google Sheets
Récupère Characters, Weapons, Gear, Costumes, Masteries depuis zeroluck.gg
Puis écrit tout dans les onglets du Google Sheet
"""
import requests, json, time, os, sys
from bs4 import BeautifulSoup
from pathlib import Path

# ── CONFIG ────────────────────────────────────────────────────────────────────
BASE = "https://zeroluck.gg/7dso"
SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM")
HEADERS_HTTP = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

session = requests.Session()
session.headers.update(HEADERS_HTTP)

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            time.sleep(0.3)
            return r
        except Exception as e:
            if i == retries-1: print(f"  ❌ {url}: {e}")
            time.sleep(2**i)
    return None

def ndata(html):
    s = BeautifulSoup(html, "html.parser").find("script", {"id": "__NEXT_DATA__"})
    if not s: return None
    try: return json.loads(s.string)
    except: return None

def fix(s):
    if not isinstance(s, str): return s
    try: return s.encode('latin-1').decode('utf-8')
    except: return s

def fixo(o):
    if isinstance(o, dict): return {k: fixo(v) for k,v in o.items()}
    if isinstance(o, list): return [fixo(i) for i in o]
    if isinstance(o, str): return fix(o)
    return o

# ── ABILITY KEY → LABEL ───────────────────────────────────────────────────────
KEY_LABEL = {
    'B_MaxHP_Equip': 'PV max', 'B_Def_Equip': 'Défense', 'B_Atk_Equip': 'Attaque',
    'B_Atk': 'Attaque', 'B_Def': 'Défense', 'B_MaxHp': 'PV',
    'I_AtkAdd_Rate': 'Attaque %', 'I_DefAdd_Rate': 'Défense %', 'I_MaxHPAdd_Rate': 'HP %',
    'H_MaxHP_Add_Rate': 'PV max %', 'H_Def_Add_Rate': 'Défense %', 'H_Atk_Add_Rate': 'Attaque %',
    'C_Critical_Rate': 'Chance critique', 'C_Critical_Dam_Rate': 'Dégâts crit.',
    'C_Critical_ResRate': 'Résist. crit.', 'C_Critical_DamRes_Rate': 'Déf. crit.',
    'A_Accuracy': 'Précision', 'A_Block': 'Blocage',
    'H_HealPower_Rate': 'Puissance soin',
    'UltimateSkill_DamAdd_Rate': 'Dégâts ultime %',
    'Fire_Burst_Gauge_Rate': 'Jauge Burst Feu',
    'H_CritRate_Rate': 'Chance critique %', 'H_CritDam_Rate': 'Dégâts critiques %',
}

def lbl(key): return KEY_LABEL.get(key, key)
def is_pct(key): return 'Rate' in key or 'Add_Rate' in key

TYPE_MAP = {
    'Shield':'Shield','Book':'Book','Wand':'Wand','Axe':'Axe',
    'Gauntlets':'Gauntlets','Cudgel':'Cudgel3c','Cudgel3c':'Cudgel3c',
    'Lance':'Lance','Rapier':'Rapier','Greatsword':'Sword2h','Longsword':'Sword1h',
    'Staff':'END_WEAPON','Dual Swords':'SwordDual','SwordDual':'SwordDual',
    'Sword1h':'Sword1h','Sword2h':'Sword2h','END_WEAPON':'END_WEAPON',
}

# ── SCRAPE CHARACTERS ─────────────────────────────────────────────────────────
def scrape_characters():
    print("\n👤 Characters...")
    r = get(f"{BASE}/characters/")
    if not r: return [], {}
    nd = ndata(r.text)
    char_slugs = list(set(
        a['href'].strip('/').split('/')[-1]
        for a in BeautifulSoup(r.text,"html.parser").select('a[href*="/7dso/characters/"]')
        if a['href'] not in ('/7dso/characters/',)
    ))
    print(f"  {len(char_slugs)} characters")

    characters = []
    masteries_all = {}  # weapon_type → tier → {global, subs}

    for i, slug in enumerate(char_slugs):
        if i % 5 == 0: print(f"  {i}/{len(char_slugs)}...")
        r2 = get(f"https://zeroluck.gg/7dso/characters/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        char = fixo(nd2["props"]["pageProps"].get("character",{}))

        weapons_info = char.get("weapons", [])
        arms   = [TYPE_MAP.get(w.get("weapon_type",""), w.get("weapon_type","")) for w in weapons_info]
        elems  = [w.get("element","") for w in weapons_info]
        costumes = char.get("costumes", [])

        # Portraits
        portraits = char.get("portraits", {})
        img_equip = portraits.get("equip","") or portraits.get("big","") or char.get("image_url","")
        img_big   = portraits.get("big","") or char.get("image_url","")

        characters.append({
            "slug":      slug,
            "nom":       char.get("name_fr") or char.get("name",""),
            "armes":     " / ".join(arms),
            "elements":  " / ".join(elems),
            "image_url": img_big.replace("?class=thumb",""),
            "image_equip": img_equip.replace("?class=thumb",""),
            "costumes_ids": " | ".join([str(c.get("itemId","")) for c in costumes]),
        })

        # Extract mastery data
        for section in char.get("progression_sections", []):
            wtype = section.get("weapon_type","")
            if wtype in masteries_all: continue  # already got this type
            tiers = {}
            for tier in section.get("tiers", []):
                tn = tier["tier"]
                unlocks = tier.get("unlocks", [])
                normal  = [u for u in unlocks if u.get("type")=="Normal"]
                special = next((u for u in unlocks if u.get("type")=="Special"), None)
                global_stats = {}
                if special:
                    for ab in special.get("abilities",[]):
                        k,v = ab["key"], ab["value"]
                        l = lbl(k)
                        global_stats[l] = round(v/100,2) if is_pct(k) else v
                sub_nodes = []
                for nn in normal:
                    node = []
                    for ab in nn.get("abilities",[]):
                        k,v = ab["key"], ab["value"]
                        l = lbl(k)
                        node.append({"label":l,"val":round(v/100,2) if is_pct(k) else v,"unit":"%" if is_pct(k) else ""})
                    sub_nodes.append(node)
                tiers[tn] = {"global":global_stats,"subs":sub_nodes}
            masteries_all[wtype] = tiers

        time.sleep(0.2)

    return characters, masteries_all

# ── SCRAPE GEAR ───────────────────────────────────────────────────────────────
def scrape_gear():
    print("\n⚙️  Gear...")
    r = get(f"{BASE}/gear/")
    if not r: return []
    nd = ndata(r.text)
    gears_list = fixo(nd["props"]["pageProps"].get("gears",[]))
    print(f"  {len(gears_list)} items (incl. costumes)")

    results = []
    for i, g in enumerate(gears_list):
        if i % 20 == 0: print(f"  {i}/{len(gears_list)}...")
        slug = g.get("slug_en","")
        if not slug: continue
        r2 = get(f"https://zeroluck.gg/7dso/gear/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        gear = fixo(nd2["props"]["pageProps"].get("gear",{}))
        stats = gear.get("stats",{})

        main_stat, main_val = "", 0
        if stats.get("main"):
            m = stats["main"][0]
            main_stat = lbl(m.get("ability_type",""))
            main_val  = m.get("value_total",0)

        subs = []
        for s in stats.get("sub",[]):
            subs.append({"stat":lbl(s.get("ability_type","")),"val":s.get("value_total",0)})

        rand_opts = []
        for opt in (gear.get("passiveOptions") or gear.get("passive_options") or []):
            if isinstance(opt,dict) and opt.get("ability_type"):
                rand_opts.append({
                    "stat":lbl(opt["ability_type"]),
                    "min":opt.get("value_min",0),"max":opt.get("value_max",0)
                })

        set_info = gear.get("set_info",[]) or []
        set_name, set_bonuses = "", []
        if set_info:
            si = set_info[0]
            set_name = (si.get("name",{}).get("fr") or si.get("name",{}).get("en",""))
            for b in (si.get("bonus") or si.get("set_effects") or []):
                if isinstance(b,dict):
                    desc = b.get("description",{})
                    set_bonuses.append({
                        "pieces": b.get("set_parts_count",0),
                        "desc":   desc.get("fr") or desc.get("en","")
                    })

        results.append({
            "id":        str(gear.get("id") or g.get("id","")),
            "slug":      slug,
            "nom":       gear.get("name_fr") or gear.get("name",""),
            "slot":      gear.get("division",""),
            "type":      gear.get("detail_type",""),
            "rarete":    gear.get("rarity") or gear.get("grade",""),
            "image_url": gear.get("image_url") or gear.get("image_raw_url",""),
            "main_stat": main_stat,
            "main_val":  main_val,
            "subs":      json.dumps(subs, ensure_ascii=False),
            "rand_opts": json.dumps(rand_opts, ensure_ascii=False),
            "set_name":  set_name,
            "set_bonuses": json.dumps(set_bonuses, ensure_ascii=False),
        })
        time.sleep(0.2)

    return results

# ── SCRAPE WEAPONS ────────────────────────────────────────────────────────────
def scrape_weapons():
    print("\n⚔️  Weapons...")
    r = get(f"{BASE}/weapons/")
    if not r: return []
    nd = ndata(r.text)
    props = nd["props"]["pageProps"]
    weapons_list = fixo(props.get("weapons") or props.get("items") or [])
    print(f"  {len(weapons_list)} weapons")

    results = []
    for i, w in enumerate(weapons_list):
        if i % 30 == 0: print(f"  {i}/{len(weapons_list)}...")
        slug = w.get("slug_en","")
        if not slug: continue
        r2 = get(f"https://zeroluck.gg/7dso/weapons/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        wprop = nd2["props"]["pageProps"]
        wp = fixo(wprop.get("weapon") or wprop.get("item") or {})
        stats = wp.get("stats",{})

        main_stat, atk_stages = "", {}
        if stats.get("main"):
            m = stats["main"][0]
            main_stat = lbl(m.get("ability_type",""))
            raw_stages = {str(s["stage"]): s["value"] for s in m.get("stages",[])}
            base = raw_stages.get("0",0)
            cumul = base
            for echelon in range(1,6):
                cumul += raw_stages.get(str(echelon),0)
                atk_stages[echelon] = cumul

        passive = wp.get("weapon_passive") or {}
        passive_name = (passive.get("name_fr") or passive.get("name_en","")) if isinstance(passive,dict) else ""
        passive_desc = (passive.get("effect_fr") or passive.get("effect_en","")) if isinstance(passive,dict) else ""

        results.append({
            "id":           str(wp.get("id") or w.get("id","")),
            "slug":         slug,
            "nom":          wp.get("name_fr") or wp.get("name",""),
            "type":         wp.get("division") or wp.get("detail_type",""),
            "rarete":       wp.get("rarity") or wp.get("grade",""),
            "image_url":    wp.get("image_url") or wp.get("image_raw_url",""),
            "atk_base":     atk_stages.get(1,0),
            "atk_echelon":  json.dumps(atk_stages, ensure_ascii=False),
            "passive_name": passive_name,
            "passive_desc": passive_desc[:200] if passive_desc else "",
        })
        time.sleep(0.2)

    return results

# ── BUILD JSON + PUSH TO SHEETS ───────────────────────────────────────────────
def push_to_sheets(characters, gear_items, weapons, masteries):
    print("\n📤 Pushing to Google Sheets...")
    import importlib.util
    # Try to import google-auth
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build as gbuild
    except ImportError:
        print("  Installing google dependencies...")
        os.system("pip install google-auth google-auth-httplib2 google-api-python-client --break-system-packages -q")
        from google.oauth2 import service_account
        from googleapiclient.discovery import build as gbuild

    # Get service account credentials from env
    creds_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON","")
    if not creds_json:
        print("  ⚠ No GOOGLE_SERVICE_ACCOUNT_JSON env var — skipping Sheets push")
        print("  Saving JSON files locally instead...")
        save_json_local(characters, gear_items, weapons, masteries)
        return

    import json as json_mod
    creds_data = json_mod.loads(creds_json)
    creds = service_account.Credentials.from_service_account_info(
        creds_data,
        scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    service = gbuild("sheets", "v4", credentials=creds)
    sheets = service.spreadsheets()

    def clear_and_write(tab_name, headers, rows):
        """Clear sheet tab and write fresh data"""
        range_name = f"{tab_name}!A1"
        data = [headers] + rows
        try:
            sheets.values().clear(spreadsheetId=SHEET_ID, range=f"{tab_name}!A:Z").execute()
            sheets.values().update(
                spreadsheetId=SHEET_ID, range=range_name,
                valueInputOption="USER_ENTERED",
                body={"values": data}
            ).execute()
            print(f"  ✅ {tab_name}: {len(rows)} rows")
        except Exception as e:
            print(f"  ❌ {tab_name}: {e}")

    # Characters_DB
    char_headers = ["slug","nom","armes","elements","image_url","image_equip","costumes_ids"]
    char_rows = [[c.get(h,"") for h in char_headers] for c in characters]
    clear_and_write("Characters_DB", char_headers, char_rows)

    # Gear
    gear_armor = [g for g in gear_items if g.get("slot") not in ("BindArmor",)]
    gear_headers = ["id","slug","nom","slot","type","rarete","image_url","main_stat","main_val","subs","rand_opts","set_name","set_bonuses"]
    gear_rows = [[g.get(h,"") for h in gear_headers] for g in gear_armor]
    clear_and_write("Gear", gear_headers, gear_rows)

    # Costumes
    costume_items = [g for g in gear_items if g.get("slot")=="BindArmor"]
    clear_and_write("Costumes", gear_headers, [[g.get(h,"") for h in gear_headers] for g in costume_items])

    # Weapons
    wp_headers = ["id","slug","nom","type","rarete","image_url","atk_base","atk_echelon","passive_name","passive_desc"]
    wp_rows = [[w.get(h,"") for h in wp_headers] for w in weapons]
    clear_and_write("Weapons", wp_headers, wp_rows)

    # Masteries
    mast_headers = ["weapon_type","tier","global_stats","sub_nodes"]
    mast_rows = []
    for wtype, tiers in masteries.items():
        for tier_num, tdata in tiers.items():
            mast_rows.append([
                wtype, str(tier_num),
                json.dumps(tdata.get("global",{}), ensure_ascii=False),
                json.dumps(tdata.get("subs",[]), ensure_ascii=False),
            ])
    clear_and_write("Masteries", mast_headers, mast_rows)

    print("\n✅ All data pushed to Google Sheets!")

def save_json_local(characters, gear_items, weapons, masteries):
    """Fallback: save data as JSON files"""
    out = Path("scraper_output")
    out.mkdir(exist_ok=True)

    # Rebuild builder_data.json
    gear_by_slot = {}
    for g in gear_items:
        slot = g.get("slot","?")
        if slot not in gear_by_slot: gear_by_slot[slot] = []
        gear_by_slot[slot].append({
            "id":g["id"],"slug":g["slug"],"nom":g["nom"],
            "rarete":g["rarete"],"image_url":g["image_url"],
            "main_stat":g["main_stat"],"main_val":g["main_val"],
            "sub_stats":json.loads(g["subs"]) if g["subs"] else [],
            "rand_opts":json.loads(g["rand_opts"]) if g["rand_opts"] else [],
            "set_name":g["set_name"],
        })

    weapons_by_type = {}
    for w in weapons:
        tp = w.get("type","?")
        if tp not in weapons_by_type: weapons_by_type[tp] = []
        atk_ech = json.loads(w["atk_echelon"]) if w.get("atk_echelon") else {}
        # convert keys to int
        atk_by_echelon = {int(k): v for k,v in atk_ech.items()}
        weapons_by_type[tp].append({
            "id":w["id"],"slug":w["slug"],"nom":w["nom"],
            "rarete":w["rarete"],"image_url":w["image_url"],
            "atk_base":w["atk_base"],"atk_by_echelon":atk_by_echelon,
            "passive_name":w.get("passive_name",""),
        })

    db = {
        "gear_by_slot": gear_by_slot,
        "weapons_by_type": weapons_by_type,
        "characters": [{
            "slug":c["slug"],"nom":c["nom"],
            "armes":c["armes"],"elements":c["elements"],
            "weapon_types":c["armes"].split(" / ") if c["armes"] else [],
            "image_url":c["image_url"],"image_equip":c["image_equip"],
        } for c in characters],
        "mastery_by_type": masteries,
    }

    with open(out/"builder_data.json","w",encoding="utf-8") as f:
        json.dump(db,f,ensure_ascii=False,indent=2)
    print(f"  ✅ scraper_output/builder_data.json")

    for name, data in [("characters.json",characters),("gear.json",gear_items),("weapons.json",weapons)]:
        with open(out/name,"w",encoding="utf-8") as f:
            json.dump(data,f,ensure_ascii=False,indent=2)
    print(f"  ✅ scraper_output/characters.json, gear.json, weapons.json")

# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 7DS Origin Scraper → Google Sheets")
    print("=" * 50)

    characters, masteries = scrape_characters()
    gear_items  = scrape_gear()
    weapons     = scrape_weapons()

    print(f"\n📊 Summary:")
    print(f"  Characters: {len(characters)}")
    print(f"  Gear items: {len(gear_items)}")
    print(f"  Weapons:    {len(weapons)}")
    print(f"  Mastery types: {len(masteries)}")

    push_to_sheets(characters, gear_items, weapons, masteries)
