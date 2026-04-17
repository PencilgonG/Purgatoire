#!/usr/bin/env python3
"""
Scraper détails zeroluck.gg — stats principales, secondaires, aléatoires, sets
"""
import requests, csv, json, time, re
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

def parse_gear_detail(soup, slug):
    result = {"slug": slug, "stat_principale": "", "val_principale": "",
              "stat_secondaire_1": "", "val_secondaire_1": "",
              "stat_secondaire_2": "", "val_secondaire_2": "",
              "stats_aleatoires": "", "set_nom": "", "set_pieces": "", "set_bonus": ""}

    text = soup.get_text(" ", strip=True)

    # ── Stats principales ──
    # Pattern: "STATS PRINCIPALES" then "StatName VALUE"
    main_match = re.search(r'STATS\s+PRINCIPALES\s+([\w\s%]+?)\s+([\d,\.]+)\s+([\w\s%]+?)\s+([\d,\.]+)', text, re.I)
    if main_match:
        result["stat_principale"]    = main_match.group(1).strip()
        result["val_principale"]     = main_match.group(2).strip()
        result["stat_secondaire_1"]  = main_match.group(3).strip()
        result["val_secondaire_1"]   = main_match.group(4).strip()

    # ── Stats secondaires ──
    sec_match = re.search(r'STATS\s+SECONDAIRES\s+([\w\s%]+?)\s+([\d,\.]+%?)\s+([\w\s%]+?)\s+([\d,\.]+%?)', text, re.I)
    if sec_match:
        result["stat_secondaire_1"] = sec_match.group(1).strip()
        result["val_secondaire_1"]  = sec_match.group(2).strip()
        result["stat_secondaire_2"] = sec_match.group(3).strip()
        result["val_secondaire_2"]  = sec_match.group(4).strip()

    # ── Stats aléatoires ──
    rand_matches = re.findall(r'([\w\s%àâéèêëîïôùûüç]+?)\s+([\d,\.]+-[\d,\.]+%?)', text)
    if rand_matches:
        rand_list = [f"{m[0].strip()}: {m[1].strip()}" for m in rand_matches[:8]]
        result["stats_aleatoires"] = " | ".join(rand_list)

    # ── Sets ──
    set_match = re.search(r'([\w\s\']+?)\s+(\d+)\s+pieces?\s+(.*?)(?:PIECES|$)', text, re.I)
    if set_match:
        result["set_nom"]    = set_match.group(1).strip()
        result["set_pieces"] = set_match.group(2).strip()
        result["set_bonus"]  = set_match.group(3).strip()[:300]

    # Try more targeted HTML selectors
    # Look for structured stat blocks
    for el in soup.find_all(['div','p','span'], string=re.compile(r'\d+\.\d+%?$')):
        pass  # will use text-based approach

    return result

def parse_weapon_detail(soup, slug):
    result = {"slug": slug, "stat_principale": "", "val_principale": "",
              "enchant_slots": "", "enchant_stats": ""}

    text = soup.get_text(" ", strip=True)

    # Enchantment slots
    enchant_sections = re.findall(
        r"Emplacement d.enchantement\s+(\d+)\s+(\d+)\s*%\s*(.*?)(?=Emplacement|$)",
        text, re.I | re.S
    )
    if enchant_sections:
        slots = []
        for slot_num, pct, stats_text in enchant_sections:
            stats = re.findall(r'([A-Za-zÀ-ÿ\s]+?)\s+\+?([\d,\.]+\s*~\s*[\d,\.]+\s*%?)', stats_text)
            stat_strs = [f"{s[0].strip()}: {s[1].strip()}" for s in stats[:5]]
            slots.append(f"Slot{slot_num}({pct}%): {' / '.join(stat_strs)}")
        result["enchant_slots"] = str(len(enchant_sections))
        result["enchant_stats"] = " || ".join(slots)

    return result

def scrape_gear_details():
    print("\n⚙️  Scraping détails gear...")
    items = read_csv("gear.csv")
    results = []
    for i, item in enumerate(items):
        if i % 20 == 0: print(f"  {i}/{len(items)}...")
        r = get(item["page_url"])
        if not r:
            results.append({**item, "stat_principale":"","val_principale":"","stat_secondaire_1":"","val_secondaire_1":"","stat_secondaire_2":"","val_secondaire_2":"","stats_aleatoires":"","set_nom":"","set_pieces":"","set_bonus":""})
            continue
        soup = BeautifulSoup(r.text, "html.parser")
        detail = parse_gear_detail(soup, item["slug"])
        results.append({**item, **detail})
        time.sleep(0.3)

    write_csv("gear_full.csv", results, [
        "slug","nom","categorie","slot","set","rarete",
        "stat_principale","val_principale",
        "stat_secondaire_1","val_secondaire_1",
        "stat_secondaire_2","val_secondaire_2",
        "stats_aleatoires","set_nom","set_pieces","set_bonus",
        "image_url","page_url"
    ])
    return results

def scrape_weapon_details():
    print("\n⚔️  Scraping détails weapons...")
    items = read_csv("weapons.csv")
    results = []
    for i, item in enumerate(items):
        if i % 30 == 0: print(f"  {i}/{len(items)}...")
        r = get(item["page_url"])
        if not r:
            results.append({**item, "stat_principale":"","val_principale":"","enchant_slots":"","enchant_stats":""})
            continue
        soup = BeautifulSoup(r.text, "html.parser")
        detail = parse_weapon_detail(soup, item["slug"])
        results.append({**item, **detail})
        time.sleep(0.25)

    write_csv("weapons_full.csv", results, [
        "slug","nom","categorie","rarete",
        "stat_principale","val_principale",
        "enchant_slots","enchant_stats",
        "image_url","page_url"
    ])
    return results

if __name__ == "__main__":
    print("🔎 Scraper détails zeroluck.gg")
    print("=" * 40)
    gear    = scrape_gear_details()
    weapons = scrape_weapon_details()
    print(f"\n✅ Done — gear_full.csv + weapons_full.csv dans scraper_output/")
