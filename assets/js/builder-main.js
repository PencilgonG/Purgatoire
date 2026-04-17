// assets/js/builder-main.js

import { computeBuild } from "/assets/js/builder-engine.js";
import { renderBuilderResult } from "/assets/js/builder-ui.js";

let BUILDER_DB = null;

/**
 * Essaie de lire les stats de base depuis différentes formes possibles.
 * Adapte proprement si ton personnage actif expose déjà des stats.
 */
function normalizeCharacterBaseStats(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      attack_flat: 0,
      defense_flat: 0,
      hp_flat: 0,
    };
  }

  return {
    attack_flat: Number(
      raw.attack_flat ??
      raw.attack ??
      raw.atk ??
      raw.base_attack ??
      raw.baseAtk ??
      0
    ) || 0,

    defense_flat: Number(
      raw.defense_flat ??
      raw.defense ??
      raw.def ??
      raw.base_defense ??
      raw.baseDef ??
      0
    ) || 0,

    hp_flat: Number(
      raw.hp_flat ??
      raw.hp ??
      raw.health ??
      raw.base_hp ??
      raw.baseHp ??
      0
    ) || 0,
  };
}

function toArray(v) {
  return Array.isArray(v) ? v : [];
}

function byId(id) {
  return document.getElementById(id);
}

function selectedValue(selector) {
  const el = document.querySelector(selector);
  if (!el) return "";
  return el.value ?? "";
}

function selectedChecked(selector) {
  const el = document.querySelector(selector);
  return !!(el && el.checked);
}

function numberValue(selector, fallback = 0) {
  const el = document.querySelector(selector);
  if (!el) return fallback;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Essaie d’extraire l’état depuis des attributs data-* si tu les poses dans le DOM.
 * Exemple:
 * <div id="builder-root"
 *      data-character-id="1005"
 *      data-character-name="Meliodas"
 *      data-base-attack="1000"
 *      data-base-defense="700"
 *      data-base-hp="12000"></div>
 */
function readCharacterFromRootDataset() {
  const root = byId("builder-root");
  if (!root) return null;

  return {
    id: root.dataset.characterId || null,
    name: root.dataset.characterName || null,
    baseStats: normalizeCharacterBaseStats({
      attack_flat: root.dataset.baseAttack,
      defense_flat: root.dataset.baseDefense,
      hp_flat: root.dataset.baseHp,
    }),
  };
}

/**
 * Fallback simple si tu stockes un état global existant dans la page.
 * Tu pourras l’adapter à ton builder actuel.
 */
function readLegacyGlobalState() {
  const globalCandidates = [
    window.BUILDER_STATE,
    window.builderState,
    window.STATE,
    window.S,
  ];

  const state = globalCandidates.find(Boolean);
  if (!state || typeof state !== "object") return null;

  const weapons = [];

  // Cas fréquent: state.weapons = [...]
  if (Array.isArray(state.weapons)) {
    state.weapons.forEach((w, i) => {
      if (!w) return;
      weapons.push({
        id: String(w.id ?? w.weapon_id ?? w.weaponId ?? ""),
        stage: Number(w.stage ?? w.echelon ?? w.promotion ?? 0) || 0,
        active: !!(w.active ?? (i === 0)),
      });
    });
  }

  return {
    characterBaseStats: normalizeCharacterBaseStats(
      state.characterBaseStats ||
      state.character ||
      state.base ||
      {}
    ),
    weapons,
  };
}

/**
 * Lecture DOM minimale et générique.
 *
 * Pour l’utiliser facilement, tu peux donner à tes inputs des attributs:
 * data-builder-weapon-id="0|1|2"
 * data-builder-weapon-stage="0|1|2"
 * data-builder-weapon-active="0|1|2"
 *
 * Exemple:
 * <select data-builder-weapon-id="0">...</select>
 * <input type="number" data-builder-weapon-stage="0" />
 * <input type="radio" data-builder-weapon-active="0" />
 */
function readWeaponsFromDom() {
  const ids = [...document.querySelectorAll("[data-builder-weapon-id]")];
  const stages = [...document.querySelectorAll("[data-builder-weapon-stage]")];
  const actives = [...document.querySelectorAll("[data-builder-weapon-active]")];

  const byIndex = new Map();

  ids.forEach((el) => {
    const idx = Number(el.dataset.builderWeaponId);
    if (!Number.isFinite(idx)) return;
    if (!byIndex.has(idx)) byIndex.set(idx, {});
    byIndex.get(idx).id = String(el.value || "");
  });

  stages.forEach((el) => {
    const idx = Number(el.dataset.builderWeaponStage);
    if (!Number.isFinite(idx)) return;
    if (!byIndex.has(idx)) byIndex.set(idx, {});
    const n = Number(el.value);
    byIndex.get(idx).stage = Number.isFinite(n) ? n : 0;
  });

  actives.forEach((el) => {
    const idx = Number(el.dataset.builderWeaponActive);
    if (!Number.isFinite(idx)) return;
    if (!byIndex.has(idx)) byIndex.set(idx, {});
    byIndex.get(idx).active = !!el.checked;
  });

  const ordered = [...byIndex.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, value], i) => ({
      id: String(value.id || ""),
      stage: Number(value.stage || 0),
      active: value.active ?? i === 0,
    }))
    .filter((w) => w.id);

  return ordered;
}

/**
 * Essaie plusieurs sources d’état sans casser ton builder actuel.
 */
export function readCurrentBuildState() {
  // 1) état legacy global si présent
  const legacy = readLegacyGlobalState();
  if (legacy && legacy.weapons && legacy.weapons.length) {
    return legacy;
  }

  // 2) DOM dataset / inputs
  const rootCharacter = readCharacterFromRootDataset();
  const domWeapons = readWeaponsFromDom();

  return {
    characterBaseStats: rootCharacter?.baseStats || {
      attack_flat: 0,
      defense_flat: 0,
      hp_flat: 0,
    },
    weapons: domWeapons,
  };
}

export async function loadBuilderDb() {
  const res = await fetch("/assets/data/builder_data.json", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Impossible de charger builder_data.json (${res.status})`);
  }
  BUILDER_DB = await res.json();
  return BUILDER_DB;
}

export function getBuilderDb() {
  return BUILDER_DB;
}

export function recalcBuilder() {
  if (!BUILDER_DB) {
    console.warn("BUILDER_DB non chargé");
    return null;
  }

  const build = readCurrentBuildState();
  const result = computeBuild(build, BUILDER_DB);

  renderBuilderResult(result, {
    stats: "#builder-stats-panel",
    breakdown: "#builder-breakdown-panel",
    effects: "#builder-effects-panel",
  });

  window.__BUILDER_LAST_BUILD__ = build;
  window.__BUILDER_LAST_RESULT__ = result;

  return result;
}

/**
 * Branche automatiquement les listeners sur les éléments qui changent le build.
 */
export function bindBuilderAutoRecalc() {
  const selectors = [
    "[data-builder-weapon-id]",
    "[data-builder-weapon-stage]",
    "[data-builder-weapon-active]",
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener("change", () => {
        recalcBuilder();
      });
      el.addEventListener("input", () => {
        recalcBuilder();
      });
    });
  });
}

/**
 * Point d’entrée principal.
 */
export async function initBuilder() {
  await loadBuilderDb();
  bindBuilderAutoRecalc();
  return recalcBuilder();
}

// Exposition globale pratique si ta page actuelle n’est pas encore modulaire
window.initBuilder = initBuilder;
window.recalcBuilder = recalcBuilder;
window.readCurrentBuildState = readCurrentBuildState;