// assets/js/builder-engine.js (V2)

export function emptyStats() {
  return {
    attack_flat: 0,
    attack_pct: 0,
    defense_flat: 0,
    defense_pct: 0,
    hp_flat: 0,
    hp_pct: 0,
    crit_rate_pct: 0,
    crit_damage_pct: 0,
    crit_resist_pct: 0,
    accuracy_pct: 0,
    evasion_pct: 0,
    damage_dealt_pct: 0,
    damage_taken_pct: 0,
    shield_power_pct: 0,
    barrier_efficiency_pct: 0,
    healing_done_pct: 0,
    healing_received_pct: 0,
    ultimate_charge_pct: 0,
    element_damage_pct: 0,
    element_resist_pct: 0,
  };
}

function addStat(target, stat, value) {
  if (!stat || !Number.isFinite(value)) return;
  if (!(stat in target)) target[stat] = 0;
  target[stat] += value;
}

function addStats(target, source) {
  if (!source) return;
  for (const [k, v] of Object.entries(source)) {
    if (Number.isFinite(v)) addStat(target, k, v);
  }
}

function buildIndex(arr, key = "id") {
  const m = new Map();
  (arr || []).forEach((x) => {
    if (x && x[key]) m.set(String(x[key]), x);
  });
  return m;
}

function collectEffect(effect, buckets, source) {
  if (!effect) return;

  const payload = { ...effect, source };

  const cat = effect.category || "unknown";

  if (!buckets[cat]) buckets[cat] = [];
  buckets[cat].push(payload);
}

function applyPermanentEffect(effect, stats) {
  if (!effect || effect.category !== "permanent") return;
  (effect.effects || []).forEach((e) => {
    addStat(stats, e.stat, e.value);
  });
}

/* =========================
   WEAPONS
========================= */

function applyWeapon(weapon, entry, stats, breakdown, effects) {
  if (!weapon) return;

  const ratio = entry.active ? 1 : 0.3;
  const stage = entry.stage || 0;

  const main = (weapon.main_value_base || 0) +
               (weapon.atk_stages?.[stage] || 0);

  addStat(stats, weapon.main_stat, main * ratio);

  const sub = (weapon.sub_value_base || 0) +
              (weapon.sub_stages?.[stage] || 0);

  addStat(stats, weapon.sub_stat, sub * ratio);

  if (weapon.effect) {
    collectEffect(weapon.effect, effects, { type: "weapon", id: weapon.id });
    applyPermanentEffect(weapon.effect, stats);
  }
}

/* =========================
   GEAR
========================= */

function applyGear(gear, stats, breakdown) {
  if (!gear) return;

  // Hypothèse structure actuelle : stats déjà normalisées
  if (gear.stats) {
    addStats(stats, gear.stats);
  }

  if (gear.main_stat && gear.main_value) {
    addStat(stats, gear.main_stat, gear.main_value);
  }

  if (gear.sub_stats) {
    gear.sub_stats.forEach((s) => {
      addStat(stats, s.stat, s.value);
    });
  }
}

/* =========================
   COSTUMES
========================= */

function applyCostume(costume, stats, effects) {
  if (!costume) return;

  // bind_stats = stats passives
  if (costume.bind_stats) {
    for (const s of costume.bind_stats) {
      addStat(stats, s.stat, s.value);
    }
  }

  // effets
  if (costume.effects) {
    costume.effects.forEach((eff) => {
      const parsed = {
        category: "conditional", // simplification actuelle
        raw: eff.description,
        effects: [],
        name: eff.name,
      };

      collectEffect(parsed, effects, { type: "costume", id: costume.id });
    });
  }
}

/* =========================
   FINAL
========================= */

function computeFinal(stats) {
  return {
    attack: Math.round(stats.attack_flat * (1 + stats.attack_pct / 100)),
    defense: Math.round(stats.defense_flat * (1 + stats.defense_pct / 100)),
    hp: Math.round(stats.hp_flat * (1 + stats.hp_pct / 100)),
    ...stats,
  };
}

/* =========================
   MAIN ENTRY
========================= */

export function computeBuild(build, db) {
  const stats = emptyStats();

  const effects = {
    permanent: [],
    conditional: [],
    proc: [],
    rotation: [],
    none: [],
    unknown: [],
  };

  const weaponsIndex = buildIndex(db.weapons);
  const gearIndex = buildIndex(db.gear);
  const costumeIndex = buildIndex(db.costumes);

  /* ===== weapons ===== */
  (build.weapons || []).forEach((w, i) => {
    const weapon = weaponsIndex.get(String(w.id));
    applyWeapon(weapon, w, stats, null, effects);
  });

  /* ===== gear ===== */
  (build.gear || []).forEach((g) => {
    const gear = gearIndex.get(String(g.id));
    applyGear(gear, stats);
  });

  /* ===== costumes ===== */
  (build.costumes || []).forEach((c) => {
    const costume = costumeIndex.get(String(c.id));
    applyCostume(costume, stats, effects);
  });

  return {
    permanentStats: computeFinal(stats),
    effects,
  };
}