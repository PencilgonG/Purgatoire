#!/usr/bin/env python3
"""
Scraper complet zeroluck.gg via __NEXT_DATA__ JSON
Gear + Weapons avec stats complètes
"""

import requests
import csv
import json
import time
from bs4 import BeautifulSoup
from pathlib import Path

BASE = "https://zeroluck.gg"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
OUT = Path("scraper_output")
session = requests.Session()
session.headers.update(HEADERS)

OUT.mkdir(exist_ok=True)

def get(url, retries=3):
    for i in range(retries):
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            return r
        except Exception as e:
            if i == retries - 1:
                print(f"  ❌ {url}: {e}")
            time.sleep(2)
    return None

def next_data(html):
    soup = BeautifulSoup(html, "html.parser")
    s = soup.find("script", {"id": "__NEXT_DATA__"})
    if not s:
        return None
    try:
        return json.loads(s.string)
    except Exception:
        return None

def read_csv(name):
    with open(OUT / name, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def write_json(name, data):
    with open(OUT / name, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ {OUT / name}")

def safe_json_loads(value, default=None):
    if default is None:
        default = {}
    if not isinstance(value, str):
        return value
    value = value.strip()
    if not value:
        return default
    try:
        return json.loads(value)
    except Exception:
        return default

def scrape_gear_details():
    print("\n⚙️  Scraping gear details via __NEXT_DATA__...")
    gear_rows = read_csv("gear.csv")
    gear_data = []

    for i, row in enumerate(gear_rows):
        if i % 20 == 0:
            print(f"  {i}/{len(gear_rows)}...")

        slug = row.get("slug", "").strip()
        if not slug:
            continue

        url = f"{BASE}/7dso/gear/{slug}/"
        r = get(url)
        if not r:
            continue

        nd = next_data(r.text)
        if not nd:
            continue

        props = nd.get("props", {}).get("pageProps", {})
        gear = props.get("gear", {})
        if not isinstance(gear, dict):
            continue

        stats = gear.get("stats", {}) or {}
        main_stats = stats.get("main", []) or []
        sub_stats = stats.get("sub", []) or []
        set_info = gear.get("set_info", {}) or {}
        craft = gear.get("craft", {}) or {}
        effects = gear.get("effects", []) or []
        random_options = gear.get("random_options") or gear.get("rand_opts") or []

        gear_data.append({
            "id": gear.get("id") or row.get("id"),
            "slug": gear.get("slug_en") or row.get("slug"),
            "nom": gear.get("name_fr") or row.get("nom") or gear.get("name"),
            "nom_en": gear.get("name_en"),
            "nom_fr": gear.get("name_fr"),
            "division": gear.get("division") or row.get("division"),
            "slot": gear.get("division") or row.get("division"),
            "rarete": gear.get("grade") or row.get("rarete") or gear.get("rarity"),
            "rarity": gear.get("rarity") or gear.get("grade"),
            "image_url": gear.get("image_raw_url") or row.get("image_url") or gear.get("image_url"),
            "page_url": url,

            "primary_set_name_en": gear.get("primary_set_name_en"),
            "primary_set_name_fr": gear.get("primary_set_name_fr"),
            "set_names_en": gear.get("set_names_en"),
            "set_names_fr": gear.get("set_names_fr"),
            "set_info": set_info,

            "main_stat": main_stats[0].get("ability_type") if main_stats else "",
            "main_value": main_stats[0].get("value_total") if main_stats else 0,
            "sub_stat": sub_stats[0].get("ability_type") if sub_stats else "",
            "sub_value": sub_stats[0].get("value_total") if sub_stats else 0,

            "stats": stats,
            "effects": effects,
            "craft": craft,
            "random_options": random_options,
            "rand_opts": random_options,

            "raw": gear,
        })

    write_json("gear_data.json", gear_data)

def scrape_weapon_details():
    print("\n⚔️  Scraping weapons details via __NEXT_DATA__...")
    weapon_rows = read_csv("weapons.csv")
    weapon_data = []

    for i, row in enumerate(weapon_rows):
        if i % 30 == 0:
            print(f"  {i}/{len(weapon_rows)}...")

        slug = row.get("slug", "").strip()
        if not slug:
            continue

        url = f"{BASE}/7dso/weapons/{slug}/"
        r = get(url)
        if not r:
            continue

        nd = next_data(r.text)
        if not nd:
            continue

        props = nd.get("props", {}).get("pageProps", {})
        weapon = props.get("weapon", {})
        if not isinstance(weapon, dict):
            continue

        stats = weapon.get("stats", {}) or {}
        main_stats = stats.get("main", []) or []
        sub_stats = stats.get("sub", []) or []

        main_0 = main_stats[0] if main_stats else {}
        sub_0 = sub_stats[0] if sub_stats else {}

        atk_stages = {}
        if isinstance(main_0, dict):
            for st in main_0.get("stages", []) or []:
                atk_stages[str(st.get("stage"))] = st.get("value")

        sub_stages = {}
        if isinstance(sub_0, dict):
            for st in sub_0.get("stages", []) or []:
                sub_stages[str(st.get("stage"))] = st.get("value")

        weapon_data.append({
            "id": weapon.get("id") or row.get("id"),
            "slug": weapon.get("slug_en") or row.get("slug"),
            "slug_en": weapon.get("slug_en"),
            "slug_fr": weapon.get("slug_fr"),

            "nom": weapon.get("name_fr") or row.get("nom") or weapon.get("name"),
            "name_en": weapon.get("name_en"),
            "name_fr": weapon.get("name_fr"),
            "name": weapon.get("name"),

            "type": weapon.get("division") or row.get("type"),
            "weapon_type": weapon.get("division"),
            "division": weapon.get("division"),

            "rarete": weapon.get("grade") or row.get("rarete") or weapon.get("rarity"),
            "rarity": weapon.get("rarity") or weapon.get("grade"),
            "grade": weapon.get("grade"),

            "image_url": weapon.get("image_raw_url") or row.get("image_url") or weapon.get("image_url"),
            "page_url": url,

            "description_en": weapon.get("description_en"),
            "description_fr": weapon.get("description_fr"),
            "description": weapon.get("description"),

            "effect_en": weapon.get("effect_en"),
            "effect_fr": weapon.get("effect_fr"),
            "effect": weapon.get("effect"),
            "max_effect_en": weapon.get("max_effect_en"),
            "max_effect_fr": weapon.get("max_effect_fr"),

            "passive_name": weapon.get("weapon_passive"),
            "passive_icon_path": weapon.get("weapon_passive_icon_path"),
            "passive_icon_url": weapon.get("weapon_passive_icon_url"),

            "main_stat": main_0.get("ability_type") if isinstance(main_0, dict) else "",
            "main_value_base": main_0.get("value_base") if isinstance(main_0, dict) else 0,
            "main_value_total": main_0.get("value_total") if isinstance(main_0, dict) else 0,
            "main_growth_type": main_0.get("growth_type") if isinstance(main_0, dict) else "",
            "atk_stages": atk_stages,

            "sub_stat": sub_0.get("ability_type") if isinstance(sub_0, dict) else "",
            "sub_value_base": sub_0.get("value_base") if isinstance(sub_0, dict) else 0,
            "sub_value_total": sub_0.get("value_total") if isinstance(sub_0, dict) else 0,
            "sub_growth_type": sub_0.get("growth_type") if isinstance(sub_0, dict) else "",
            "sub_stages": sub_stages,

            "enchant_slots": weapon.get("sub_unlock_reinforce") or [],
            "associated_characters": weapon.get("associated_characters") or [],

            "stats": stats,
            "promotion": weapon.get("promotion") or {},
            "overlimit": weapon.get("overlimit") or {},
            "sources": weapon.get("sources") or [],
            "usages": weapon.get("usages") or [],
            "metadata": weapon.get("metadata") or {},

            "raw": weapon,
        })

    write_json("weapons_data.json", weapon_data)

if __name__ == "__main__":
    print("🔎 Scraper full (Next.js JSON) zeroluck.gg")
    print("=" * 44)
    scrape_gear_details()
    scrape_weapon_details()
    print("\n📊 Done")
    print("📁 → scraper_output/gear_data.json + weapons_data.json")