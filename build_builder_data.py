#!/usr/bin/env python3
import json
import csv
from pathlib import Path

ROOT = Path(".")
SCRAPER = ROOT / "scraper_output"
ASSETS = ROOT / "assets" / "data"
RAW = ASSETS / "raw"
NORM = ASSETS / "normalized"

RAW.mkdir(parents=True, exist_ok=True)
NORM.mkdir(parents=True, exist_ok=True)

STAT_MAP = {
    "A_Attack": "attack_flat",
    "A_AttackAdd_Rate": "attack_pct",
    "D_Defense": "defense_flat",
    "D_DefenseAdd_Rate": "defense_pct",
    "H_Health": "hp_flat",
    "H_HealthAdd_Rate": "hp_pct",
    "C_Critical_Rate": "crit_rate_pct",
    "C_Critical_Damage": "crit_damage_pct",
    "C_Critical_ResRate": "crit_resist_pct",
    "C_Accuracy_Rate": "accuracy_pct",
    "C_Evasion_Rate": "evasion_pct",
    "All_DamageAdd_Rate": "damage_dealt_pct",
    "All_DamageReduce_Rate": "damage_taken_pct",
    "P_Shield_Rate": "shield_power_pct",
    "H_HealAdd_Rate": "healing_done_pct",
    "H_HealReceive_Rate": "healing_received_pct",
    "MF_ChargeEffic_Rate": "ultimate_charge_pct",
    "AllElement_Add": "element_damage_pct",
    "AllElement_Res": "element_resist_pct",
}

def load_json(path: Path, default=None):
    if not path.exists():
        return default if default is not None else {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_csv(path: Path):
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def norm_stat(raw):
    if not raw:
        return None
    return STAT_MAP.get(raw, f"unknown_{raw}")

def normalize_stat_obj(obj):
    if not isinstance(obj, dict):
        return obj
    out = dict(obj)
    raw = obj.get("ability_type") or obj.get("stat")
    if raw:
        out["raw_stat"] = raw
        out["stat"] = norm_stat(raw)
    return out

def normalize_stats_block(stats):
    if not isinstance(stats, dict):
        return {}
    out = {}
    for key, value in stats.items():
        if isinstance(value, list):
            out[key] = [normalize_stat_obj(v) if isinstance(v, dict) else v for v in value]
        elif isinstance(value, dict):
            out[key] = normalize_stat_obj(value)
        else:
            out[key] = value
    return out

def normalize_gear_data(items):
    out = []
    for g in items or []:
        row = dict(g)
        row["stats"] = normalize_stats_block(g.get("stats", {}))
        out.append(row)
    return out

def normalize_weapons_data(items):
    out = []
    for w in items or []:
        row = dict(w)
        row["stats"] = normalize_stats_block(w.get("stats", {}))
        out.append(row)
    return out

def main():
    gear_csv = load_csv(SCRAPER / "gear.csv")
    chars_csv = load_csv(SCRAPER / "characters.csv")
    weapons_csv = load_csv(SCRAPER / "weapons.csv")

    gear_full_csv = load_csv(SCRAPER / "gear_full.csv")
    weapons_full_csv = load_csv(SCRAPER / "weapons_full.csv")

    gear_data = load_json(SCRAPER / "gear_data.json", [])
    weapons_data = load_json(SCRAPER / "weapons_data.json", [])

    costumes_full = load_json(SCRAPER / "costumes_full.json", [])
    mastery_data = load_json(SCRAPER / "mastery_data.json", {})
    characters_full = load_json(SCRAPER / "characters_full.json", [])

    gear_data_norm = normalize_gear_data(gear_data)
    weapons_data_norm = normalize_weapons_data(weapons_data)

    save_json(RAW / "gear.csv.json", gear_csv)
    save_json(RAW / "characters.csv.json", chars_csv)
    save_json(RAW / "weapons.csv.json", weapons_csv)
    save_json(RAW / "gear_full.csv.json", gear_full_csv)
    save_json(RAW / "weapons_full.csv.json", weapons_full_csv)
    save_json(RAW / "gear_data.json", gear_data)
    save_json(RAW / "weapons_data.json", weapons_data)
    save_json(RAW / "costumes_full.json", costumes_full)
    save_json(RAW / "mastery_data.json", mastery_data)
    save_json(RAW / "characters_full.json", characters_full)

    builder_data = {
        "version": 1,
        "stat_map": STAT_MAP,
        "characters_csv": chars_csv,
        "characters_full": characters_full,
        "gear_csv": gear_csv,
        "gear_full_csv": gear_full_csv,
        "gear_data": gear_data_norm,
        "weapons_csv": weapons_csv,
        "weapons_full_csv": weapons_full_csv,
        "weapons_data": weapons_data_norm,
        "costumes_full": costumes_full,
        "mastery_data": mastery_data,
    }

    save_json(NORM / "gear_data.json", gear_data_norm)
    save_json(NORM / "weapons_data.json", weapons_data_norm)
    save_json(ASSETS / "builder_data.json", builder_data)

    print("✅ build_builder_data.py terminé")
    print(f"✅ builder_data.json généré dans {ASSETS / 'builder_data.json'}")

if __name__ == "__main__":
    main()