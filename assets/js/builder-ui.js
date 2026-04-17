// assets/js/builder-ui.js

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatNumber(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

function labelForStat(stat) {
  const labels = {
    attack: "ATK",
    defense: "DEF",
    hp: "HP",

    attack_flat: "ATK brut",
    attack_pct: "ATK %",
    defense_flat: "DEF brute",
    defense_pct: "DEF %",
    hp_flat: "HP brut",
    hp_pct: "HP %",

    crit_rate_pct: "Crit %",
    crit_damage_pct: "Crit DMG %",
    crit_resist_pct: "Crit RES %",

    accuracy_pct: "Précision %",
    evasion_pct: "Esquive %",

    damage_dealt_pct: "Dégâts infligés %",
    damage_taken_pct: "Réduction dégâts %",

    shield_power_pct: "Puissance bouclier %",
    barrier_efficiency_pct: "Efficacité barrière %",

    healing_done_pct: "Soins donnés %",
    healing_received_pct: "Soins reçus %",

    ultimate_charge_pct: "Charge ultime %",
    element_damage_pct: "Dégâts élémentaires %",
    element_resist_pct: "Résistance élémentaire %",
    all_element_burst_resist_pct: "Résistance burst élémentaire %",

    normal_skill_damage_pct: "Dégâts skill normal %",
    tag_skill_damage_pct: "Dégâts tag skill %",

    special_attack_cooldown_pct: "CD attaque spéciale %",
    tag_gauge_flat: "Jauge tag",
    movement_speed_pct: "Vitesse déplacement %",
  };

  return labels[stat] || stat;
}

function renderStatList(stats, preferredOrder = []) {
  const entries = Object.entries(stats || {}).filter(([, v]) => {
    return typeof v === "number" && !Number.isNaN(v) && v !== 0;
  });

  entries.sort((a, b) => {
    const ai = preferredOrder.indexOf(a[0]);
    const bi = preferredOrder.indexOf(b[0]);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a[0].localeCompare(b[0]);
  });

  if (!entries.length) {
    return `<div class="builder-empty">Aucune valeur</div>`;
  }

  return `
    <div class="builder-stat-list">
      ${entries
        .map(
          ([k, v]) => `
            <div class="builder-stat-row">
              <span class="builder-stat-name">${esc(labelForStat(k))}</span>
              <span class="builder-stat-value">${esc(formatNumber(v))}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderEffectCard(effect) {
  const source = effect.source || {};
  const statsHtml =
    Array.isArray(effect.effects) && effect.effects.length
      ? `
        <div class="builder-effect-stats">
          ${effect.effects
            .map((e) => {
              const value = typeof e.value === "number" ? formatNumber(e.value) : e.value;
              return `<div class="builder-effect-stat">${esc(labelForStat(e.stat))}: ${esc(value)}</div>`;
            })
            .join("")}
        </div>
      `
      : "";

  return `
    <div class="builder-effect-card">
      <div class="builder-effect-title">
        ${esc(effect.name || source.name || source.id || "Effet")}
      </div>
      <div class="builder-effect-meta">
        <div>Catégorie: ${esc(effect.category || "-")}</div>
        <div>Source: ${esc(source.name || source.id || "-")}</div>
        ${effect.trigger ? `<div>Trigger: ${esc(effect.trigger)}</div>` : ""}
        ${effect.duration != null ? `<div>Durée: ${esc(formatNumber(effect.duration))}s</div>` : ""}
        ${effect.chance != null ? `<div>Chance: ${esc(formatNumber(effect.chance))}%</div>` : ""}
      </div>
      ${statsHtml}
      ${effect.raw ? `<div class="builder-effect-raw">${esc(effect.raw)}</div>` : ""}
    </div>
  `;
}

function renderEffectGroup(title, effects) {
  return `
    <section class="builder-panel">
      <h3>${esc(title)}</h3>
      ${
        effects && effects.length
          ? effects.map(renderEffectCard).join("")
          : `<div class="builder-empty">Aucun effet</div>`
      }
    </section>
  `;
}

export function renderBuilderResult(result, selectors = {}) {
  const statsRoot =
    document.querySelector(selectors.stats || "#builder-stats-panel");
  const breakdownRoot =
    document.querySelector(selectors.breakdown || "#builder-breakdown-panel");
  const effectsRoot =
    document.querySelector(selectors.effects || "#builder-effects-panel");

  const orderMain = [
    "attack",
    "defense",
    "hp",
    "crit_rate_pct",
    "crit_damage_pct",
    "crit_resist_pct",
    "damage_dealt_pct",
    "damage_taken_pct",
    "shield_power_pct",
    "barrier_efficiency_pct",
    "healing_done_pct",
    "healing_received_pct",
    "ultimate_charge_pct",
    "element_damage_pct",
    "element_resist_pct",
  ];

  if (statsRoot) {
    statsRoot.innerHTML = `
      <section class="builder-panel">
        <h3>Stats permanentes</h3>
        ${renderStatList(result.permanentStats, orderMain)}
      </section>
    `;
  }

  if (breakdownRoot) {
    breakdownRoot.innerHTML = `
      <section class="builder-panel">
        <h3>Décomposition</h3>

        <h4>Base personnage</h4>
        ${renderStatList(result.breakdown.character_base)}

        <h4>Arme active</h4>
        ${renderStatList(result.breakdown.weapons_active)}

        <h4>Armes inactives</h4>
        ${renderStatList(result.breakdown.weapons_inactive)}

        <h4>Effets permanents</h4>
        ${renderStatList(result.breakdown.permanent_effects)}
      </section>
    `;
  }

  if (effectsRoot) {
    effectsRoot.innerHTML = [
      renderEffectGroup("Effets rotation", result.effects.rotation),
      renderEffectGroup("Effets proc", result.effects.proc),
      renderEffectGroup("Effets conditionnels", result.effects.conditional),
      renderEffectGroup("Effets inconnus", result.effects.unknown),
    ].join("");
  }
}