#!/usr/bin/env python3
"""
Scraper complet 7DS Origin → Google Sheets + game_data.json
Récupère Characters, Weapons, Gear, Costumes, Masteries, Food, Items depuis zeroluck.gg
"""
import requests, json, time, os, sys
from bs4 import BeautifulSoup
from pathlib import Path

BASE    = "https://zeroluck.gg/7dso"
SHEET_ID = os.environ.get("GOOGLE_SHEET_ID", "1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM")
HEADERS_HTTP = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
}

session = requests.Session()
session.headers.update(HEADERS_HTTP)

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=20)
            r.raise_for_status()
            time.sleep(0.4)
            return r
        except Exception as e:
            if i == retries - 1: print(f"  ❌ {url}: {e}")
            time.sleep(2 ** i)
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
    if isinstance(o, dict): return {k: fixo(v) for k, v in o.items()}
    if isinstance(o, list): return [fixo(i) for i in o]
    if isinstance(o, str): return fix(o)
    return o

# ── KEY → LABEL ───────────────────────────────────────────────────────────────
KEY_LABEL = {
    'B_MaxHP_Equip':'PV max','B_Def_Equip':'Défense','B_Atk_Equip':'Attaque',
    'B_Atk':'Attaque','B_Def':'Défense','B_MaxHp':'PV',
    'I_AtkAdd_Rate':'Attaque %','I_DefAdd_Rate':'Défense %','I_MaxHPAdd_Rate':'HP %',
    'H_MaxHP_Add_Rate':'PV max %','H_Def_Add_Rate':'Défense %','H_Atk_Add_Rate':'Attaque %',
    'C_Critical_Rate':'Chance critique','C_Critical_Dam_Rate':'Dégâts crit.',
    'C_Critical_ResRate':'Résist. crit.','C_Critical_DamRes_Rate':'Déf. crit.',
    'A_Accuracy':'Précision','A_Block':'Blocage','H_HealPower_Rate':'Puissance soin',
    'UltimateSkill_DamAdd_Rate':'Dégâts ultime %','Fire_Burst_Gauge_Rate':'Jauge Burst Feu',
    'S_MoveSpdAdd_Rate':'Vitesse de dépl. %','S_SkillRecycle_Rate':'Recharg. comp. %',
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

RARITY_ORDER = {'Grade5': 0, 'Grade4': 1, 'Grade3': 2, 'Grade2': 3, 'Grade1': 4}
RARITY_LABEL = {'Grade5': 'SSR', 'Grade4': 'SR', 'Grade3': 'R', 'Grade2': 'N', 'Grade1': 'N-'}

# ── CHARACTERS ────────────────────────────────────────────────────────────────
def scrape_characters():
    print("\n👤 Characters...")
    r = get(f"{BASE}/characters/")
    if not r: return [], {}
    char_slugs = list(set(
        a['href'].strip('/').split('/')[-1]
        for a in BeautifulSoup(r.text, "html.parser").select('a[href*="/7dso/characters/"]')
        if a['href'] not in ('/7dso/characters/',)
    ))
    print(f"  {len(char_slugs)} characters trouvés")

    characters, masteries_all = [], {}
    for i, slug in enumerate(char_slugs):
        if i % 5 == 0: print(f"  {i}/{len(char_slugs)}...")
        r2 = get(f"https://zeroluck.gg/7dso/characters/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        char = fixo(nd2["props"]["pageProps"].get("character", {}))

        weapons_info = char.get("weapons", [])
        arms  = [TYPE_MAP.get(w.get("weapon_type",""), w.get("weapon_type","")) for w in weapons_info]
        elems = [w.get("element","") for w in weapons_info]
        costumes = char.get("costumes", [])
        portraits = char.get("portraits", {})
        img_big   = portraits.get("big","") or char.get("image_url","")
        img_equip = portraits.get("equip","") or portraits.get("big","") or char.get("image_url","")
        img_slot  = portraits.get("slot","") or img_equip

        # Skills
        skills_raw = char.get("skills", []) or []
        skills = []
        for sk in skills_raw[:6]:  # max 6 skills
            if isinstance(sk, dict):
                sname = sk.get("name_fr") or sk.get("name_en") or sk.get("name","")
                sdesc = sk.get("description_fr") or sk.get("description_en") or sk.get("description","")
                stype = sk.get("skill_type","")
                simg  = sk.get("image_url","")
                skills.append({"nom": sname, "desc": str(sdesc)[:200], "type": stype, "image_url": simg})

        characters.append({
            "slug":         slug,
            "nom":          char.get("name_fr") or char.get("name",""),
            "armes":        " / ".join(arms),
            "weapon_types": arms,
            "elements":     " / ".join(elems),
            "element_list": elems,
            "image_url":    img_big.replace("?class=thumb",""),
            "image_equip":  img_equip.replace("?class=thumb",""),
            "image_slot":   img_slot.replace("?class=thumb",""),
            "costumes_count": len(costumes),
            "skin_costumes": [{"nom": c.get("name_fr") or c.get("name",""),
                               "image_url": c.get("image_url","")} for c in costumes[:10]],
            "skills":       skills,
        })

        # Masteries
        for section in char.get("progression_sections", []):
            wtype = section.get("weapon_type","")
            if wtype in masteries_all: continue
            tiers = {}
            for tier in section.get("tiers", []):
                tn = tier["tier"]
                unlocks = tier.get("unlocks", [])
                normal  = [u for u in unlocks if u.get("type") == "Normal"]
                special = next((u for u in unlocks if u.get("type") == "Special"), None)
                global_stats = {}
                if special:
                    for ab in special.get("abilities",[]):
                        k, v = ab["key"], ab["value"]
                        global_stats[lbl(k)] = round(v/100,2) if is_pct(k) else v
                sub_nodes = []
                for nn in normal:
                    node = []
                    for ab in nn.get("abilities",[]):
                        k, v = ab["key"], ab["value"]
                        node.append({"label": lbl(k), "val": round(v/100,2) if is_pct(k) else v,
                                     "unit": "%" if is_pct(k) else ""})
                    sub_nodes.append(node)
                tiers[tn] = {"global": global_stats, "subs": sub_nodes}
            masteries_all[wtype] = tiers
        time.sleep(0.2)

    return characters, masteries_all

# ── GEAR + COSTUMES ───────────────────────────────────────────────────────────
def scrape_gear():
    print("\n⚙️  Gear & Costumes...")
    r = get(f"{BASE}/gear/")
    if not r: return []
    nd = ndata(r.text)
    gears_list = fixo(nd["props"]["pageProps"].get("gears", []))
    print(f"  {len(gears_list)} items")

    results = []
    for i, g in enumerate(gears_list):
        if i % 20 == 0: print(f"  {i}/{len(gears_list)}...")
        slug = g.get("slug_en","")
        if not slug: continue
        r2 = get(f"https://zeroluck.gg/7dso/gear/{slug}/")
        if not r2: continue
        nd2 = ndata(r2.text)
        if not nd2: continue
        gear = fixo(nd2["props"]["pageProps"].get("gear", {}))
        stats = gear.get("stats", {})

        main_stat, main_val = "", 0
        if stats.get("main"):
            m = stats["main"][0]
            main_stat = lbl(m.get("ability_type",""))
            main_val  = m.get("value_total", 0)

        subs = []
        for s in stats.get("sub", []):
            subs.append({"stat": lbl(s.get("ability_type","")), "val": s.get("value_total",0)})

        rand_opts = []
        for opt in (gear.get("passiveOptions") or gear.get("passive_options") or []):
            if isinstance(opt, dict) and opt.get("ability_type"):
                rand_opts.append({"stat": lbl(opt["ability_type"]),
                                  "min": opt.get("value_min",0), "max": opt.get("value_max",0)})

        set_info = gear.get("set_info", []) or []
        set_name, set_bonuses = "", []
        if set_info:
            si = set_info[0]
            set_name = si.get("name",{}).get("fr") or si.get("name",{}).get("en","")
            for b in (si.get("bonus") or si.get("set_effects") or []):
                if isinstance(b, dict):
                    desc = b.get("description", {})
                    set_bonuses.append({
                        "pieces": b.get("set_parts_count", 0),
                        "desc":   desc.get("fr") or desc.get("en","")
                    })

        results.append({
            "id":          str(gear.get("id") or g.get("id","")),
            "slug":        slug,
            "nom":         gear.get("name_fr") or gear.get("name",""),
            "slot":        gear.get("division",""),
            "type":        gear.get("detail_type",""),
            "rarete":      gear.get("rarity") or gear.get("grade",""),
            "rarete_label": RARITY_LABEL.get(gear.get("rarity",""), gear.get("rarity","")),
            "image_url":   gear.get("image_url") or gear.get("image_raw_url",""),
            "main_stat":   main_stat,
            "main_val":    main_val,
            "sub_stats":   subs,
            "rand_opts":   rand_opts,
            "set_name":    set_name,
            "set_bonuses": set_bonuses,
        })
        time.sleep(0.2)
    return results

# ── WEAPONS ───────────────────────────────────────────────────────────────────
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
        stats = wp.get("stats", {})

        main_stat, atk_stages = "", {}
        if stats.get("main"):
            m = stats["main"][0]
            main_stat = lbl(m.get("ability_type",""))
            raw_stages = {str(s["stage"]): s["value"] for s in m.get("stages",[])}
            base = raw_stages.get("0", 0)
            cumul = base
            for echelon in range(1, 6):
                cumul += raw_stages.get(str(echelon), 0)
                atk_stages[echelon] = cumul

        passive = wp.get("weapon_passive") or {}
        passive_name = (passive.get("name_fr") or passive.get("name_en","")) if isinstance(passive, dict) else ""
        passive_desc = (passive.get("effect_fr") or passive.get("effect_en","")) if isinstance(passive, dict) else ""

        # Substats de l'arme
        subs = []
        for s in stats.get("sub", []):
            subs.append({"stat": lbl(s.get("ability_type","")), "val": s.get("value_total",0)})

        results.append({
            "id":           str(wp.get("id") or w.get("id","")),
            "slug":         slug,
            "nom":          wp.get("name_fr") or wp.get("name",""),
            "type":         wp.get("division") or wp.get("detail_type",""),
            "rarete":       wp.get("rarity") or wp.get("grade",""),
            "rarete_label": RARITY_LABEL.get(wp.get("rarity",""), wp.get("rarity","")),
            "image_url":    wp.get("image_url") or wp.get("image_raw_url",""),
            "atk_base":     atk_stages.get(1, 0),
            "atk_echelon5": atk_stages.get(5, 0),
            "atk_by_echelon": atk_stages,
            "sub_stats":    subs,
            "passive_name": passive_name,
            "passive_desc": passive_desc[:300] if passive_desc else "",
        })
        time.sleep(0.2)
    return results

# ── FOOD / RECETTES ───────────────────────────────────────────────────────────
def scrape_food():
    print("\n🍖 Food & Recettes...")
    results = []
    # Essayer plusieurs patterns d'URL
    for section_url in [f"{BASE}/food/", f"{BASE}/cooking/", f"{BASE}/recipes/"]:
        r = get(section_url)
        if not r or r.status_code != 200: continue
        nd = ndata(r.text)
        if not nd: continue
        pp = nd["props"]["pageProps"]
        items_raw = pp.get("foods") or pp.get("items") or pp.get("recipes") or []
        if not items_raw: continue
        print(f"  {len(items_raw)} food items (depuis {section_url})")

        for i, item in enumerate(fixo(items_raw)):
            slug = item.get("slug_en") or item.get("slug","")
            if not slug: continue

            # Détail optionnel
            detail_url = section_url + slug + "/"
            r2 = get(detail_url)
            detail = {}
            if r2:
                nd2 = ndata(r2.text)
                if nd2:
                    dp = nd2["props"]["pageProps"]
                    detail = fixo(dp.get("food") or dp.get("recipe") or dp.get("item") or {})

            nom = detail.get("name_fr") or detail.get("name_en") or item.get("name_fr") or item.get("name","")
            desc = detail.get("description_fr") or detail.get("description_en") or ""
            img  = detail.get("image_url") or item.get("image_url","")
            cat  = detail.get("category") or item.get("type","")
            effects = detail.get("effects") or detail.get("stats") or []

            buffs = []
            for e in (effects if isinstance(effects, list) else []):
                if isinstance(e, dict):
                    k = e.get("ability_type","")
                    v = e.get("value", e.get("value_total",0))
                    dur = e.get("duration",0)
                    if k:
                        buffs.append({"stat": lbl(k), "val": round(v/100,2) if is_pct(k) else v,
                                      "unit": "%" if is_pct(k) else "", "duration_min": dur})

            ingredients = []
            for ing in (detail.get("ingredients") or detail.get("recipe_items") or []):
                if isinstance(ing, dict):
                    ingredients.append({
                        "nom":   ing.get("name_fr") or ing.get("name_en") or ing.get("name",""),
                        "qty":   ing.get("quantity", ing.get("amount", 1)),
                        "image": ing.get("image_url","")
                    })

            results.append({
                "slug":        slug,
                "nom":         nom,
                "categorie":   cat,
                "description": desc[:200],
                "image_url":   img,
                "buffs":       buffs,
                "ingredients": ingredients,
            })
            time.sleep(0.2)
        break  # On a trouvé et scrappé une section

    if not results:
        print("  ℹ Food: section non trouvée sur zeroluck.gg")
    return results

# ── ITEMS / MATÉRIAUX ─────────────────────────────────────────────────────────
def scrape_items():
    print("\n📦 Items & Matériaux...")
    results = []
    for section_url in [f"{BASE}/items/", f"{BASE}/materials/", f"{BASE}/consumables/"]:
        r = get(section_url)
        if not r or r.status_code != 200: continue
        nd = ndata(r.text)
        if not nd: continue
        pp = nd["props"]["pageProps"]
        items_raw = pp.get("items") or pp.get("materials") or pp.get("consumables") or []
        if not items_raw: continue
        print(f"  {len(items_raw)} items (depuis {section_url})")

        for item in fixo(items_raw):
            nom  = item.get("name_fr") or item.get("name_en") or item.get("name","")
            cat  = item.get("category") or item.get("type","")
            img  = item.get("image_url","")
            slug = item.get("slug_en") or item.get("slug","")
            desc = item.get("description_fr") or item.get("description_en") or ""
            results.append({
                "slug":       slug,
                "nom":        nom,
                "categorie":  cat,
                "description": desc[:150],
                "image_url":  img,
            })
        break

    if not results:
        print("  ℹ Items: section non trouvée sur zeroluck.gg")
    return results

# ── BUILD game_data.json ──────────────────────────────────────────────────────
def build_game_data(characters, gear_items, weapons, masteries, food, items):
    """Construit le fichier game_data.json consolidé pour le site."""
    gear_by_slot, costume_list = {}, []
    for g in gear_items:
        slot = g.get("slot","?")
        if slot == "BindArmor":
            costume_list.append(g)
        else:
            if slot not in gear_by_slot: gear_by_slot[slot] = []
            gear_by_slot[slot].append(g)

    weapons_by_type = {}
    for w in weapons:
        tp = w.get("type","?")
        if tp not in weapons_by_type: weapons_by_type[tp] = []
        weapons_by_type[tp].append(w)

    # Sets d'équipements regroupés
    sets = {}
    for slot, g_list in gear_by_slot.items():
        for g in g_list:
            sn = g.get("set_name","")
            if not sn: continue
            if sn not in sets:
                sets[sn] = {"nom": sn, "bonuses": g.get("set_bonuses",[]), "pieces": []}
            sets[sn]["pieces"].append({
                "slot": slot, "nom": g["nom"], "image_url": g["image_url"],
                "slug": g["slug"], "rarete": g["rarete_label"]
            })

    return {
        "meta": {
            "generated_at": __import__('datetime').datetime.utcnow().isoformat() + "Z",
            "source": "zeroluck.gg",
            "counts": {
                "characters": len(characters),
                "weapons": len(weapons),
                "gear": sum(len(v) for v in gear_by_slot.values()),
                "costumes": len(costume_list),
                "sets": len(sets),
                "food": len(food),
                "items": len(items),
            }
        },
        "characters":    sorted(characters, key=lambda c: c["nom"]),
        "weapons_by_type": weapons_by_type,
        "gear_by_slot":  gear_by_slot,
        "costumes":      costume_list,
        "sets":          sets,
        "mastery_by_type": masteries,
        "food":          food,
        "items":         items,
    }

# ── PUSH TO SHEETS ────────────────────────────────────────────────────────────
def push_to_sheets(characters, gear_items, weapons, masteries, food, items):
    print("\n📤 Pushing to Google Sheets...")
    creds_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON","")
    if not creds_json:
        print("  ⚠ Pas de GOOGLE_SERVICE_ACCOUNT_JSON — skip Sheets")
        return

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build as gbuild
    except ImportError:
        os.system("pip install google-auth google-auth-httplib2 google-api-python-client -q")
        from google.oauth2 import service_account
        from googleapiclient.discovery import build as gbuild

    creds = service_account.Credentials.from_service_account_info(
        json.loads(creds_json),
        scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    service = gbuild("sheets", "v4", credentials=creds)
    sheets  = service.spreadsheets()

    def write_tab(tab, headers, rows):
        try:
            sheets.values().clear(spreadsheetId=SHEET_ID, range=f"{tab}!A:ZZ").execute()
            sheets.values().update(
                spreadsheetId=SHEET_ID, range=f"{tab}!A1",
                valueInputOption="USER_ENTERED",
                body={"values": [headers] + rows}
            ).execute()
            print(f"  ✅ {tab}: {len(rows)} rows")
        except Exception as e:
            print(f"  ❌ {tab}: {e}")

    # Characters_DB
    ch_h = ["slug","nom","armes","elements","image_url","image_equip","image_slot","skills_json","skin_costumes_json"]
    write_tab("Characters_DB", ch_h, [[
        c["slug"], c["nom"], c["armes"], c["elements"],
        c["image_url"], c["image_equip"], c.get("image_slot",""),
        json.dumps(c.get("skills",[]), ensure_ascii=False),
        json.dumps(c.get("skin_costumes",[]), ensure_ascii=False),
    ] for c in characters])

    # Gear
    armor = [g for g in gear_items if g.get("slot") != "BindArmor"]
    g_h = ["id","slug","nom","slot","rarete","image_url","main_stat","main_val","sub_stats","rand_opts","set_name","set_bonuses"]
    write_tab("Gear", g_h, [[
        g["id"], g["slug"], g["nom"], g["slot"], g.get("rarete_label", g["rarete"]),
        g["image_url"], g["main_stat"], str(g["main_val"]),
        json.dumps(g["sub_stats"], ensure_ascii=False),
        json.dumps(g["rand_opts"], ensure_ascii=False),
        g["set_name"],
        json.dumps(g["set_bonuses"], ensure_ascii=False),
    ] for g in armor])

    # Costumes
    costumes = [g for g in gear_items if g.get("slot") == "BindArmor"]
    write_tab("Costumes", g_h, [[
        g["id"], g["slug"], g["nom"], g["slot"], g.get("rarete_label", g["rarete"]),
        g["image_url"], g["main_stat"], str(g["main_val"]),
        json.dumps(g["sub_stats"], ensure_ascii=False),
        json.dumps(g["rand_opts"], ensure_ascii=False),
        g["set_name"],
        json.dumps(g["set_bonuses"], ensure_ascii=False),
    ] for g in costumes])

    # Weapons
    w_h = ["id","slug","nom","type","rarete","image_url","atk_base","atk_e5","passive_name","passive_desc","sub_stats"]
    write_tab("Weapons", w_h, [[
        w["id"], w["slug"], w["nom"], w["type"], w.get("rarete_label", w["rarete"]),
        w["image_url"], str(w["atk_base"]), str(w.get("atk_echelon5",0)),
        w["passive_name"], w["passive_desc"],
        json.dumps(w.get("sub_stats",[]), ensure_ascii=False),
    ] for w in weapons])

    # Masteries
    m_h = ["weapon_type","tier","global_stats","sub_nodes"]
    m_rows = []
    for wtype, tiers in masteries.items():
        for tier_num, td in tiers.items():
            m_rows.append([wtype, str(tier_num),
                           json.dumps(td.get("global",{}), ensure_ascii=False),
                           json.dumps(td.get("subs",[]), ensure_ascii=False)])
    write_tab("Masteries", m_h, m_rows)

    # Food
    if food:
        f_h = ["slug","nom","categorie","description","image_url","buffs","ingredients"]
        write_tab("Food", f_h, [[
            f["slug"], f["nom"], f["categorie"], f["description"], f["image_url"],
            json.dumps(f["buffs"], ensure_ascii=False),
            json.dumps(f["ingredients"], ensure_ascii=False),
        ] for f in food])

    # Items
    if items:
        i_h = ["slug","nom","categorie","description","image_url"]
        write_tab("Items", i_h, [[
            i["slug"], i["nom"], i["categorie"], i["description"], i["image_url"]
        ] for i in items])

    print("✅ Google Sheets mis à jour!")

# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 7DS Origin Scraper → Google Sheets + game_data.json")
    print("=" * 55)

    characters, masteries = scrape_characters()
    gear_items             = scrape_gear()
    weapons                = scrape_weapons()
    food                   = scrape_food()
    items                  = scrape_items()

    print(f"\n📊 Résumé:")
    print(f"  Personnages:  {len(characters)}")
    print(f"  Équipements:  {len([g for g in gear_items if g.get('slot') != 'BindArmor'])}")
    print(f"  Costumes:     {len([g for g in gear_items if g.get('slot') == 'BindArmor'])}")
    print(f"  Armes:        {len(weapons)}")
    print(f"  Maîtrises:    {len(masteries)} types")
    print(f"  Nourriture:   {len(food)}")
    print(f"  Items:        {len(items)}")

    # Sauvegarder game_data.json
    gd = build_game_data(characters, gear_items, weapons, masteries, food, items)
    out_path = Path("assets/data/game_data.json")
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(gd, f, ensure_ascii=False, separators=(',',':'))
    size_kb = out_path.stat().st_size // 1024
    print(f"\n✅ assets/data/game_data.json ({size_kb}KB)")

    push_to_sheets(characters, gear_items, weapons, masteries, food, items)
