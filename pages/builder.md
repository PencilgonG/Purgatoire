---
layout: default
title: Builder
permalink: /pages/builder/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild · Membres</span>
    <h1>Builder d'équipement</h1>
    <p>Planifie ton build, sauvegarde-le et partage-le avec la guilde.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container" id="builder-root">

    <!-- Étape 1 : Identification -->
    <div id="step-login" class="builder-card" style="max-width:520px;margin:0 auto">
      <div style="margin-bottom:24px">
        <span class="eyebrow">Identification</span>
        <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;color:#f0ece0;margin-top:6px">Entre ton pseudo Discord</h2>
      </div>
      <div style="display:flex;gap:10px">
        <input id="login-input" type="text" placeholder="Ton pseudo exact" style="flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:11px 14px;font-size:.9rem;color:#e8e4d9;font-family:inherit;outline:none">
        <button onclick="doLogin()" style="background:linear-gradient(145deg,rgba(201,151,62,.2),rgba(201,151,62,.08));border:1px solid rgba(201,151,62,.35);border-radius:8px;padding:11px 20px;font-size:.85rem;font-weight:600;color:#e3b45a;cursor:pointer;font-family:inherit">Continuer →</button>
      </div>
      <div id="login-err" style="display:none;margin-top:10px;font-size:.82rem;color:#f87171;padding:8px 12px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:6px"></div>
    </div>

    <!-- Builder principal -->
    <div id="step-builder" style="display:none">

      <!-- Barre top -->
      <div class="builder-topbar">
        <div style="display:flex;align-items:center;gap:12px">
          <select id="char-select" class="b-select" onchange="selectChar(this.value)" style="min-width:160px"></select>
          <input id="build-name" type="text" placeholder="Nom du build..." class="b-input" style="width:200px">
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span id="builder-user" style="font-size:.78rem;color:rgba(153,147,170,.6)"></span>
          <button onclick="saveBuild()" class="b-btn-gold">💾 Sauvegarder</button>
          <button onclick="shareBuild()" class="b-btn-ghost">🔗 Partager</button>
          <button onclick="clearBuild()" class="b-btn-ghost" style="font-size:.75rem">↺ Reset</button>
        </div>
      </div>

      <div class="builder-layout">

        <!-- Panneau gauche : sélection item -->
        <div id="item-panel" class="item-panel" style="display:none">
          <div class="ip-head">
            <span id="ip-slot-label" style="font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#e3b45a"></span>
            <button onclick="closeItemPanel()" style="background:none;border:none;color:rgba(153,147,170,.6);cursor:pointer;font-size:1.1rem">✕</button>
          </div>
          <input id="ip-search" type="text" placeholder="Rechercher..." class="b-input" oninput="filterItems()" style="width:100%;margin-bottom:10px">
          <div id="ip-items" class="ip-items"></div>
        </div>

        <!-- Zone centrale -->
        <div class="builder-center">

          <!-- Toggle armor/costume -->
          <div style="display:flex;justify-content:center;gap:0;margin-bottom:16px">
            <button id="mode-armor" class="mode-btn mode-active" onclick="setMode('armor')">⚔️ Armure</button>
            <button id="mode-costume" class="mode-btn" onclick="setMode('costume')">👘 Costume</button>
          </div>

          <!-- Roue d'équipement -->
          <div class="equip-wheel">

            <!-- Colonne gauche -->
            <div class="equip-col equip-col-left">
              <div id="slot-Top"      class="equip-slot" data-slot="Top"      onclick="openSlot('Top')"     ><div class="slot-inner"><span class="slot-icon">🎽</span><span class="slot-lbl">Torse</span></div></div>
              <div id="slot-Bottom"   class="equip-slot" data-slot="Bottom"   onclick="openSlot('Bottom')"  ><div class="slot-inner"><span class="slot-icon">👖</span><span class="slot-lbl">Bas</span></div></div>
              <div id="slot-Belt"     class="equip-slot" data-slot="Belt"     onclick="openSlot('Belt')"    ><div class="slot-inner"><span class="slot-icon">🔲</span><span class="slot-lbl">Ceinture</span></div></div>
              <div id="slot-Shoes"    class="equip-slot" data-slot="Shoes"    onclick="openSlot('Shoes')"   ><div class="slot-inner"><span class="slot-icon">👢</span><span class="slot-lbl">Bottes</span></div></div>
            </div>

            <!-- Portrait central -->
            <div class="equip-portrait">
              <div class="portrait-frame">
                <img id="char-portrait" src="" alt="" style="width:100%;height:100%;object-fit:cover;object-position:top center">
                <div class="portrait-name" id="char-name-display">Sélectionne un personnage</div>
              </div>
            </div>

            <!-- Colonne droite -->
            <div class="equip-col equip-col-right">
              <div id="slot-Necklace" class="equip-slot" data-slot="Necklace" onclick="openSlot('Necklace')"><div class="slot-inner"><span class="slot-icon">📿</span><span class="slot-lbl">Collier</span></div></div>
              <div id="slot-Earring"  class="equip-slot" data-slot="Earring"  onclick="openSlot('Earring')" ><div class="slot-inner"><span class="slot-icon">💎</span><span class="slot-lbl">Boucles</span></div></div>
              <div id="slot-Ring"     class="equip-slot" data-slot="Ring"     onclick="openSlot('Ring')"    ><div class="slot-inner"><span class="slot-icon">💍</span><span class="slot-lbl">Anneau</span></div></div>
              <div id="slot-Costume"  class="equip-slot" data-slot="Costume"  onclick="openSlot('Costume')" style="display:none"><div class="slot-inner"><span class="slot-icon">👘</span><span class="slot-lbl">Costume</span></div></div>
            </div>

          </div>

          <!-- 3 Armes -->
          <div class="weapons-row">
            <div class="weapon-slot" id="weapon-0" onclick="openWeaponSlot(0)">
              <div class="ws-inner">
                <div class="ws-badge ws-active">ACTIVE</div>
                <div id="ws-img-0" class="ws-img"><span style="font-size:1.4rem">⚔️</span></div>
                <div id="ws-name-0" class="ws-name">Arme 1</div>
                <div class="ws-echelon" id="ws-ech-0">
                  <span class="ech-label">Échelon</span>
                  <div class="ech-stars" id="ech-stars-0"></div>
                </div>
              </div>
            </div>
            <div class="weapon-slot ws-inactive" id="weapon-1" onclick="openWeaponSlot(1)">
              <div class="ws-inner">
                <div class="ws-badge ws-sub">30% ATK</div>
                <div id="ws-img-1" class="ws-img"><span style="font-size:1.2rem">⚔️</span></div>
                <div id="ws-name-1" class="ws-name">Arme 2</div>
                <div class="ws-echelon" id="ws-ech-1">
                  <span class="ech-label">Échelon</span>
                  <div class="ech-stars" id="ech-stars-1"></div>
                </div>
              </div>
            </div>
            <div class="weapon-slot ws-inactive" id="weapon-2" onclick="openWeaponSlot(2)">
              <div class="ws-inner">
                <div class="ws-badge ws-sub">30% ATK</div>
                <div id="ws-img-2" class="ws-img"><span style="font-size:1.2rem">⚔️</span></div>
                <div id="ws-name-2" class="ws-name">Arme 3</div>
                <div class="ws-echelon" id="ws-ech-2">
                  <span class="ech-label">Échelon</span>
                  <div class="ech-stars" id="ech-stars-2"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Panneau droite : stats + maîtrises -->
        <div class="builder-right">

          <!-- Stats totales -->
          <div class="stats-panel">
            <div class="sp-head">Stats calculées</div>
            <div id="stats-display" class="stats-grid-display"></div>
            <div id="sets-display" class="sets-display"></div>
          </div>

          <!-- Maîtrises -->
          <div class="masteries-panel">
            <div class="sp-head">Maîtrises actives</div>
            <div id="masteries-display"></div>
          </div>

          <!-- Enchantements arme active -->
          <div class="enchant-panel">
            <div class="sp-head">Enchantements (arme active)</div>
            <div id="enchant-display"></div>
          </div>

        </div>

      </div><!-- builder-layout -->
    </div><!-- step-builder -->

  </div>
</section>

<!-- Panel weapon selector -->
<div id="weapon-panel" style="display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:20px" onclick="if(event.target===this)closeWeaponPanel()">
  <div style="background:#0d0f1a;border:1px solid rgba(201,151,62,.25);border-radius:14px;padding:24px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;position:relative">
    <button onclick="closeWeaponPanel()" style="position:absolute;top:12px;right:14px;background:none;border:none;color:rgba(153,147,170,.6);cursor:pointer;font-size:1.1rem">✕</button>
    <div id="wp-head" style="margin-bottom:16px;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.2rem;color:#f0ece0"></div>
    <input id="wp-search" type="text" placeholder="Rechercher une arme..." class="b-input" oninput="filterWeapons()" style="width:100%;margin-bottom:12px">
    <!-- Échelon selector -->
    <div style="margin-bottom:16px">
      <span style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.6)">Échelon :</span>
      <div id="wp-echelon-stars" style="display:inline-flex;gap:4px;margin-left:10px"></div>
    </div>
    <div id="wp-items" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px"></div>
  </div>
</div>

<style>
/* ── Builder card ── */
.builder-card {
  background: linear-gradient(145deg,rgba(201,151,62,.05),rgba(7,8,13,.6));
  border: 1px solid rgba(201,151,62,.18);
  border-radius: 14px;
  padding: 32px 36px;
  margin-bottom: 24px;
}

/* ── Topbar ── */
.builder-topbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
  padding: 12px 16px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 10px;
  margin-bottom: 20px;
}
.b-select, .b-input {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
  border-radius: 7px; padding: 8px 12px; font-size: .82rem; color: #e8e4d9;
  font-family: inherit; outline: none;
}
.b-btn-gold {
  background: linear-gradient(145deg,rgba(201,151,62,.2),rgba(201,151,62,.08));
  border: 1px solid rgba(201,151,62,.35); border-radius: 7px;
  padding: 8px 16px; font-size: .78rem; font-weight: 600; color: #e3b45a;
  cursor: pointer; font-family: inherit; transition: .2s;
}
.b-btn-gold:hover { background: rgba(201,151,62,.2); }
.b-btn-ghost {
  background: transparent; border: 1px solid rgba(255,255,255,.1); border-radius: 7px;
  padding: 8px 14px; font-size: .78rem; color: rgba(233,228,217,.65); cursor: pointer;
  font-family: inherit; transition: .18s;
}
.b-btn-ghost:hover { border-color: rgba(201,151,62,.35); color: #e3b45a; }

/* ── Mode buttons ── */
.mode-btn {
  padding: 7px 20px; font-size: .78rem; font-weight: 600; font-family: inherit;
  cursor: pointer; border: 1px solid rgba(255,255,255,.1); background: transparent;
  color: rgba(233,228,217,.55); transition: .18s;
}
.mode-btn:first-child { border-radius: 99px 0 0 99px; }
.mode-btn:last-child  { border-radius: 0 99px 99px 0; }
.mode-btn.mode-active { background: rgba(201,151,62,.14); border-color: rgba(201,151,62,.5); color: #e3b45a; }

/* ── Layout ── */
.builder-layout {
  display: grid;
  grid-template-columns: 280px 1fr 260px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1100px) { .builder-layout { grid-template-columns: 1fr; } }

/* ── Item panel (left) ── */
.item-panel {
  background: rgba(255,255,255,.02); border: 1px solid rgba(255,255,255,.08);
  border-radius: 12px; padding: 16px; max-height: 720px; overflow-y: auto;
}
.ip-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.ip-items { display:flex; flex-direction:column; gap:6px; }
.ip-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  background: transparent; border: 1px solid rgba(255,255,255,.07); border-radius: 8px;
  cursor: pointer; transition: .15s;
}
.ip-item:hover { border-color: rgba(201,151,62,.4); background: rgba(201,151,62,.05); }
.ip-item.selected { border-color: rgba(201,151,62,.6); background: rgba(201,151,62,.1); }
.ip-item img { width:36px;height:36px;border-radius:6px;border:1px solid rgba(255,255,255,.1);flex-shrink:0;background:rgba(255,255,255,.05); }
.ip-item-info .ip-item-name { font-size:.8rem;font-weight:600;color:#e8e4d9; }
.ip-item-info .ip-item-stat { font-size:.68rem;color:rgba(153,147,170,.7); }
.ip-item-rarity { font-size:.6rem; font-weight:700; padding:1px 5px; border-radius:3px; }
.rarity-Grade5 { background:rgba(251,191,36,.15);color:#fbbf24; }
.rarity-Grade4 { background:rgba(167,139,250,.15);color:#a78bfa; }
.rarity-Grade3 { background:rgba(156,163,175,.15);color:#9ca3af; }

/* ── Central zone ── */
.builder-center { display:flex; flex-direction:column; align-items:center; gap:16px; }

.equip-wheel {
  display: grid;
  grid-template-columns: 90px 200px 90px;
  gap: 8px;
  align-items: center;
}
.equip-col { display:flex; flex-direction:column; gap:8px; }

.equip-slot {
  width: 84px; height: 84px;
  background: linear-gradient(145deg,rgba(201,151,62,.07),rgba(7,8,13,.5));
  border: 1px solid rgba(201,151,62,.18);
  border-radius: 10px;
  cursor: pointer;
  transition: .2s;
  overflow: hidden;
  position: relative;
}
.equip-slot:hover { border-color: rgba(201,151,62,.45); background: rgba(201,151,62,.1); }
.equip-slot.has-item { border-color: rgba(201,151,62,.4); }
.equip-slot.disabled { opacity: .3; pointer-events: none; }
.slot-inner { display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:4px; }
.slot-icon { font-size:1.4rem; }
.slot-lbl { font-size:.6rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(153,147,170,.6); }
.slot-item-img { width:100%;height:100%;object-fit:contain;padding:6px; }
.slot-item-name { position:absolute;bottom:0;left:0;right:0;font-size:.55rem;font-weight:600;color:#e8e4d9;text-align:center;background:rgba(0,0,0,.6);padding:2px 4px;line-height:1.2; }

.equip-portrait {
  display: flex; flex-direction: column; align-items: center;
}
.portrait-frame {
  width: 200px; height: 320px;
  border: 1px solid rgba(201,151,62,.25);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background: rgba(255,255,255,.03);
}
.portrait-name {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 10px 12px 12px;
  background: linear-gradient(transparent, rgba(0,0,0,.75));
  font-family: 'Cormorant Garamond',Georgia,serif;
  font-size: .9rem; font-weight: 700; color: #f0ece0;
  text-align: center;
}

/* ── Weapons ── */
.weapons-row { display:flex;gap:10px;justify-content:center; }
.weapon-slot {
  width: 110px;
  background: linear-gradient(145deg,rgba(201,151,62,.07),rgba(7,8,13,.5));
  border: 1px solid rgba(201,151,62,.25);
  border-radius: 10px;
  cursor: pointer;
  transition: .2s;
  overflow: hidden;
}
.weapon-slot:hover { border-color: rgba(201,151,62,.5); }
.ws-inactive { border-color: rgba(255,255,255,.1); background: rgba(255,255,255,.02); }
.ws-inner { padding: 10px 8px; display:flex;flex-direction:column;align-items:center;gap:6px; }
.ws-badge { font-size:.58rem;font-weight:700;letter-spacing:.08em;padding:2px 7px;border-radius:99px; }
.ws-active { background:rgba(201,151,62,.2);color:#e3b45a;border:1px solid rgba(201,151,62,.4); }
.ws-sub    { background:rgba(255,255,255,.06);color:rgba(153,147,170,.7);border:1px solid rgba(255,255,255,.1); }
.ws-img { width:54px;height:54px;display:flex;align-items:center;justify-content:center; }
.ws-img img { width:100%;height:100%;object-fit:contain;border-radius:6px; }
.ws-name { font-size:.67rem;font-weight:600;color:#e8e4d9;text-align:center;line-height:1.3; }
.ws-echelon { display:flex;flex-direction:column;align-items:center;gap:3px; }
.ech-label { font-size:.55rem;color:rgba(153,147,170,.5);letter-spacing:.05em; }
.ech-stars { display:flex;gap:2px; }
.ech-star { width:11px;height:11px;cursor:pointer;opacity:.3;transition:.15s; font-size:10px; }
.ech-star.active { opacity:1; }

/* ── Right panel ── */
.builder-right { display:flex;flex-direction:column;gap:12px; }
.stats-panel, .masteries-panel, .enchant-panel {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 10px;
  padding: 14px;
}
.sp-head {
  font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: #e3b45a; margin-bottom: 10px;
}
.stats-grid-display { display:flex;flex-direction:column;gap:5px; }
.stat-row { display:flex;justify-content:space-between;align-items:center;font-size:.78rem; }
.stat-row .sn { color:rgba(153,147,170,.75); }
.stat-row .sv { font-weight:700;color:#e8e4d9; }
.sets-display { margin-top:10px;border-top:1px solid rgba(255,255,255,.06);padding-top:8px; }
.set-row { font-size:.72rem;color:#e3b45a;margin-bottom:3px; }

.mastery-row {
  display:flex;align-items:center;gap:8px;padding:5px 0;
  border-bottom:1px solid rgba(255,255,255,.04);
}
.mastery-row:last-child { border-bottom:none; }
.mastery-check { width:14px;height:14px;cursor:pointer;accent-color:#e3b45a; }
.mastery-name { font-size:.75rem;color:rgba(233,228,217,.75);flex:1; }
.mastery-level {
  font-size:.65rem;font-weight:700;color:#e3b45a;background:rgba(201,151,62,.15);
  padding:1px 6px;border-radius:99px;
}

.enchant-row { font-size:.73rem;color:rgba(233,228,217,.7);padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04); }
.enchant-row:last-child { border-bottom:none; }
.enchant-row .er-slot { font-weight:700;color:#e3b45a; }
</style>

<script>
const SHEET_ID = '1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM';
const WORKER  = 'https://purgatoire-bot.originsguild.workers.dev';

// ── DATA ─────────────────────────────────────────────────────────────────────
const SLOT_LABELS = {Top:'Torse',Bottom:'Bas',Belt:'Ceinture',Shoes:'Bottes',Earring:'Boucles',Necklace:'Collier',Ring:'Anneau',Costume:'Costume'};
const WEAPON_TYPE_LABELS = {Sword1h:'Épée longue',Sword2h:'Grande épée',SwordDual:'Épées doubles',Axe:'Hache',Lance:'Lance',Gauntlets:'Gantelets',Cudgel3c:'Gourdin',Rapier:'Rapière',Book:'Livre',Wand:'Bâton',Shield:'Bouclier',Staff:'Bâton de mage'};

// Enchantement pool (from game data — same for all weapons, element varies)
const ENCHANT_POOL = [
  {stat:'Augmentation de la défense', min:3.40, max:5.71, unit:'%'},
  {stat:'Augmentation des PV',        min:2.49, max:4.17, unit:'%'},
  {stat:'Dégâts attaque normale',     min:18.56,max:30.95,unit:''},
  {stat:'Dégâts attaque spéciale',    min:16.90,max:28.17,unit:''},
  {stat:'Dégâts compétence normale',  min:13.01,max:21.69,unit:''},
  {stat:'Dégâts compétence relève',   min:22.86,max:38.12,unit:''},
  {stat:'Dégâts attaque ultime',      min:10.19,max:16.98,unit:''},
  {stat:'Réduction recharge',         min:6.71, max:11.19,unit:'%'},
  {stat:'Efficacité recharge magie',  min:8.95, max:14.97,unit:'%'},
  {stat:'Chances critique',           min:6.05, max:10.11,unit:'%'},
  {stat:'Résistance critique',        min:6.05, max:10.11,unit:'%'},
  {stat:'Dégâts critiques',           min:10.69,max:17.83,unit:'%'},
  {stat:'Défense critique',           min:10.69,max:17.83,unit:'%'},
];

// Mastery bonuses (per weapon type, MASTER level = applies to all)
const MASTERIES = [
  {id:'sword1h',  name:'Épée longue MASTER',   stats:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288}},
  {id:'sword2h',  name:'Grande épée MASTER',   stats:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288}},
  {id:'sworddual',name:'Épées doubles MASTER', stats:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288}},
  {id:'axe',      name:'Hache MASTER',         stats:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288}},
  {id:'shield',   name:'Bouclier MASTER',      stats:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288}},
  {id:'sw_sh',    name:'Épée + Bouclier (combo)',stats:{crit_rate:1.05,crit_dmg:2.80},combo:['Sword1h','Shield']},
  {id:'axe_sh',   name:'Hache + Bouclier',      stats:{atk:80,perforation:30},combo:['Axe','Shield']},
];

// State
let state = {
  pseudo: '',
  char: null,
  mode: 'armor',   // 'armor' | 'costume'
  gear: {},         // slot → item
  weapons: [null,null,null],
  echelons: [1,1,1],
  activeWeapon: 0,
  masteries: {},    // id → bool
  enchants: [[],[],[]], // per weapon slot
  buildName: '',
};

let DB = { gear_by_slot:{}, weapons_by_type:{}, characters:[] };
let openSlotName = null;
let openWeaponIdx = null;

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load DB from embed
  try {
    const r = await fetch('https://pencilgong.github.io/Purgatoire/assets/data/builder_data.json');
    DB = await r.json();
  } catch(e) { console.warn('DB load failed', e); }

  // Check URL for shared build
  const params = new URLSearchParams(window.location.search);
  if (params.get('build')) {
    loadSharedBuild(params.get('build'));
  }
  if (params.get('pseudo')) {
    document.getElementById('login-input').value = params.get('pseudo');
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
async function parseCsv(text) {
  const rows=[]; let row=[],cell='',q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i],nx=text[i+1];
    if(ch==='"'){if(q&&nx==='"'){cell+='"';i++;}else q=!q;}
    else if(ch===','&&!q){row.push(cell);cell='';}
    else if((ch==='\n'||ch==='\r')&&!q){if(ch==='\r'&&nx==='\n')i++;if(cell||row.length){row.push(cell);rows.push(row);row=[];cell='';}}
    else cell+=ch;
  }
  if(cell||row.length){row.push(cell);rows.push(row);}
  if(!rows.length)return[];
  const headers=rows[0].map(h=>h.trim().replace(/\s+/g,'_').toLowerCase());
  return rows.slice(1).filter(r=>r.some(c=>c.trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||'').trim()])));
}

async function doLogin() {
  const input = document.getElementById('login-input');
  const err   = document.getElementById('login-err');
  const pseudo = input.value.trim();
  if (!pseudo) return;

  input.disabled = true;
  err.style.display = 'none';

  try {
    const membres = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Membres`,{cache:'no-store'}).then(r=>r.text()).then(parseCsv);
    const found = membres.find(m => m.pseudo && m.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (!found) {
      err.textContent = '❌ Pseudo introuvable. Fais /cc set sur Discord d\'abord.';
      err.style.display = 'block';
      input.disabled = false;
      return;
    }
    state.pseudo = found.pseudo;
    initBuilder();
  } catch(e) {
    err.textContent = 'Erreur de connexion.';
    err.style.display = 'block';
    input.disabled = false;
  }
}

function initBuilder() {
  document.getElementById('step-login').style.display = 'none';
  document.getElementById('step-builder').style.display = 'block';
  document.getElementById('builder-user').textContent = state.pseudo;

  // Populate character select
  const sel = document.getElementById('char-select');
  sel.innerHTML = '<option value="">— Personnage —</option>';
  DB.characters.forEach(c => {
    sel.innerHTML += `<option value="${c.slug}">${c.nom}</option>`;
  });

  // Init masteries
  renderMasteries();
  recalcStats();
}

// ── CHARACTER ─────────────────────────────────────────────────────────────────
function selectChar(slug) {
  if (!slug) return;
  const char = DB.characters.find(c => c.slug === slug);
  if (!char) return;
  state.char = char;
  document.getElementById('char-portrait').src = char.image_url || '';
  document.getElementById('char-name-display').textContent = char.nom;
  recalcStats();
}

// ── MODE ──────────────────────────────────────────────────────────────────────
function setMode(mode) {
  state.mode = mode;
  document.getElementById('mode-armor').classList.toggle('mode-active', mode==='armor');
  document.getElementById('mode-costume').classList.toggle('mode-active', mode==='costume');

  const armorSlots = ['Top','Bottom','Belt','Shoes'];
  armorSlots.forEach(s => {
    const el = document.getElementById(`slot-${s}`);
    if (el) el.classList.toggle('disabled', mode==='costume');
  });
  const costumeEl = document.getElementById('slot-Costume');
  if (costumeEl) costumeEl.style.display = mode==='costume' ? '' : 'none';

  if (mode==='costume') {
    armorSlots.forEach(s => delete state.gear[s]);
  } else {
    delete state.gear['Costume'];
  }
  recalcStats();
}

// ── GEAR SLOTS ─────────────────────────────────────────────────────────────────
function openSlot(slot) {
  if (state.mode==='armor' && slot==='Costume') return;
  if (state.mode==='costume' && ['Top','Bottom','Belt','Shoes'].includes(slot)) return;

  openSlotName = slot;
  const panel = document.getElementById('item-panel');
  panel.style.display = 'block';
  document.getElementById('ip-slot-label').textContent = SLOT_LABELS[slot] || slot;
  document.getElementById('ip-search').value = '';
  renderItemList(slot, '');
}

function closeItemPanel() {
  document.getElementById('item-panel').style.display = 'none';
  openSlotName = null;
}

function renderItemList(slot, search) {
  const items = (DB.gear_by_slot[slot] || []).filter(i =>
    !search || i.nom.toLowerCase().includes(search.toLowerCase())
  );
  const cur = state.gear[slot];
  document.getElementById('ip-items').innerHTML = items.map(item => `
    <div class="ip-item ${cur && cur.id===item.id?'selected':''}" onclick="selectItem('${slot}','${item.id}')">
      <img src="${item.image_url||''}" onerror="this.style.opacity='.2'">
      <div class="ip-item-info">
        <div class="ip-item-name">${item.nom}</div>
        <div class="ip-item-stat">${item.main_stat}: ${fmtVal(item.main_val)}</div>
        <div class="ip-item-stat" style="color:rgba(201,151,62,.7)">${item.set_name||''}</div>
      </div>
      <span class="ip-item-rarity rarity-${item.rarete}">${rarityLabel(item.rarete)}</span>
    </div>`).join('');
}

function filterItems() {
  if (openSlotName) renderItemList(openSlotName, document.getElementById('ip-search').value);
}

function selectItem(slot, id) {
  const items = DB.gear_by_slot[slot] || [];
  const item = items.find(i => i.id == id || i.id === id);
  if (!item) return;
  state.gear[slot] = item;
  updateSlotUI(slot, item);
  renderItemList(slot, document.getElementById('ip-search').value);
  recalcStats();
}

function updateSlotUI(slot, item) {
  const el = document.getElementById(`slot-${slot}`);
  if (!el) return;
  el.classList.add('has-item');
  el.innerHTML = item
    ? `<img class="slot-item-img" src="${item.image_url||''}" onerror="this.style.opacity='.2'"><div class="slot-item-name">${item.nom.length>18?item.nom.slice(0,17)+'…':item.nom}</div>`
    : `<div class="slot-inner"><span class="slot-icon">${getSlotIcon(slot)}</span><span class="slot-lbl">${SLOT_LABELS[slot]||slot}</span></div>`;
}

// ── WEAPON SLOTS ──────────────────────────────────────────────────────────────
function openWeaponSlot(idx) {
  openWeaponIdx = idx;
  const panel = document.getElementById('weapon-panel');
  panel.style.display = 'flex';
  document.getElementById('wp-head').textContent = `Arme ${idx+1} ${idx===0?'(active)':'(+30% ATK)'}`;
  document.getElementById('wp-search').value = '';
  renderEchelonStars(idx);
  filterWeapons();
}

function closeWeaponPanel() {
  document.getElementById('weapon-panel').style.display = 'none';
  openWeaponIdx = null;
}

function renderEchelonStars(idx) {
  const ech = state.echelons[idx] || 1;
  const container = document.getElementById('wp-echelon-stars');
  container.innerHTML = [1,2,3,4,5].map(i => `
    <span onclick="setEchelon(${idx},${i})" style="cursor:pointer;font-size:18px;opacity:${i<=ech?1:.3};color:#e3b45a;transition:.15s">★</span>
  `).join('');
}

function setEchelon(idx, val) {
  state.echelons[idx] = val;
  renderEchelonStars(idx);
  updateWeaponUI(idx);
  recalcStats();
}

function filterWeapons() {
  const search = document.getElementById('wp-search').value.toLowerCase();
  // Get available weapon types for current character
  const charArms = state.char ? state.char.armes.split('/').map(s=>s.trim()) : Object.keys(DB.weapons_by_type);
  const allWeapons = charArms.flatMap(arm => DB.weapons_by_type[arm] || []);
  const filtered = allWeapons.filter(w => !search || w.nom.toLowerCase().includes(search));

  const cur = state.weapons[openWeaponIdx];
  document.getElementById('wp-items').innerHTML = (filtered.length ? filtered : Object.values(DB.weapons_by_type).flat())
    .filter(w => !search || w.nom.toLowerCase().includes(search))
    .slice(0, 50)
    .map(w => {
      const ech = state.echelons[openWeaponIdx] || 1;
      const atk = (w.atk_by_echelon && w.atk_by_echelon[ech]) || w.atk_base || 0;
      return `<div class="ip-item ${cur&&cur.id===w.id?'selected':''}" onclick="selectWeapon(${openWeaponIdx},'${w.id}')" style="flex-direction:column;align-items:flex-start;padding:8px">
        <div style="display:flex;align-items:center;gap:8px;width:100%;margin-bottom:4px">
          <img src="${w.image_url||''}" style="width:32px;height:32px;object-fit:contain;border-radius:5px;border:1px solid rgba(255,255,255,.1)" onerror="this.style.opacity='.2'">
          <div style="flex:1;min-width:0">
            <div style="font-size:.75rem;font-weight:600;color:#e8e4d9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.nom}</div>
            <div style="font-size:.67rem;color:rgba(153,147,170,.65)">${WEAPON_TYPE_LABELS[w.type]||w.type} · ATK ${fmtVal(atk)}</div>
          </div>
          <span class="ip-item-rarity rarity-${w.rarete}" style="flex-shrink:0">${rarityLabel(w.rarete)}</span>
        </div>
      </div>`;
    }).join('');
}

function selectWeapon(idx, id) {
  const allWeapons = Object.values(DB.weapons_by_type).flat();
  const weapon = allWeapons.find(w => w.id == id || w.id === id);
  if (!weapon) return;
  state.weapons[idx] = weapon;
  updateWeaponUI(idx);
  filterWeapons();
  recalcStats();
}

function updateWeaponUI(idx) {
  const w = state.weapons[idx];
  const ech = state.echelons[idx] || 1;
  if (w) {
    document.getElementById(`ws-img-${idx}`).innerHTML = `<img src="${w.image_url||''}" style="width:100%;height:100%;object-fit:contain" onerror="this.style.opacity='.2'">`;
    const name = w.nom.length > 20 ? w.nom.slice(0,19)+'…' : w.nom;
    document.getElementById(`ws-name-${idx}`).textContent = name;
  }
  // Stars
  const stars = document.getElementById(`ech-stars-${idx}`);
  stars.innerHTML = [1,2,3,4,5].map(i => `<span onclick="event.stopPropagation();setEchelonDirect(${idx},${i})" class="ech-star ${i<=ech?'active':''}" style="color:#e3b45a">★</span>`).join('');
}

function setEchelonDirect(idx, val) {
  state.echelons[idx] = val;
  updateWeaponUI(idx);
  recalcStats();
}

// ── MASTERIES ─────────────────────────────────────────────────────────────────
function renderMasteries() {
  const container = document.getElementById('masteries-display');
  container.innerHTML = MASTERIES.map(m => `
    <div class="mastery-row">
      <input type="checkbox" class="mastery-check" id="m_${m.id}"
             ${state.masteries[m.id]?'checked':''} onchange="toggleMastery('${m.id}')">
      <label class="mastery-name" for="m_${m.id}">${m.name}</label>
      <span class="mastery-level">${m.combo?'Combo':'MASTER'}</span>
    </div>`).join('');
}

function toggleMastery(id) {
  state.masteries[id] = document.getElementById(`m_${id}`).checked;
  recalcStats();
}

// ── STATS CALC ────────────────────────────────────────────────────────────────
function recalcStats() {
  const totals = {atk:0, def:0, hp:0, atk_pct:0, def_pct:0, hp_pct:0,
                  crit_rate:0, crit_dmg:0, heal_pwr:0};
  const setCount = {};

  // Gear
  Object.values(state.gear).forEach(item => {
    if (!item) return;
    if (item.main_stat === 'Attaque')  totals.atk  += item.main_val || 0;
    if (item.main_stat === 'Défense')  totals.def  += item.main_val || 0;
    if (item.main_stat === 'PV max')   totals.hp   += item.main_val || 0;
    if (item.main_stat === 'Attaque %') totals.atk_pct += item.main_val/100 || 0;
    if (item.main_stat === 'Défense %') totals.def_pct += item.main_val/100 || 0;
    if (item.main_stat === 'PV max %')  totals.hp_pct  += item.main_val/100 || 0;
    // Sub stats
    (item.sub_stats||[]).forEach(s => {
      if (s.stat.includes('HP')) totals.hp += s.val || 0;
      if (s.stat.includes('Déf')) totals.def += s.val || 0;
    });
    if (item.set_name) setCount[item.set_name] = (setCount[item.set_name]||0) + 1;
  });

  // Weapons ATK
  state.weapons.forEach((w, i) => {
    if (!w) return;
    const ech = state.echelons[i] || 1;
    const atk = (w.atk_by_echelon && w.atk_by_echelon[ech]) || w.atk_base || 0;
    totals.atk += i === state.activeWeapon ? atk : Math.round(atk * 0.30);
  });

  // Masteries
  const equippedTypes = state.weapons.filter(Boolean).map(w => w.type);
  MASTERIES.forEach(m => {
    if (!state.masteries[m.id]) return;
    if (m.combo) {
      const active = m.combo.every(t => equippedTypes.includes(t));
      if (!active) return;
    }
    Object.entries(m.stats).forEach(([k,v]) => {
      if (totals[k] !== undefined) totals[k] += v;
    });
  });

  // Apply % bonuses
  const finalAtk = Math.round(totals.atk * (1 + totals.atk_pct/100));
  const finalDef = Math.round(totals.def * (1 + totals.def_pct/100));
  const finalHp  = Math.round(totals.hp  * (1 + totals.hp_pct/100));

  // Render stats
  const statsEl = document.getElementById('stats-display');
  statsEl.innerHTML = [
    ['Attaque',          finalAtk],
    ['Défense',          finalDef],
    ['PV max',           finalHp],
    ['Attaque %',        totals.atk_pct.toFixed(2)+'%'],
    ['Défense %',        totals.def_pct.toFixed(2)+'%'],
    ['PV %',             totals.hp_pct.toFixed(2)+'%'],
    ['Chance critique',  totals.crit_rate.toFixed(2)+'%'],
    ['Dégâts critiques', totals.crit_dmg.toFixed(2)+'%'],
  ].map(([n,v]) => `<div class="stat-row"><span class="sn">${n}</span><span class="sv">${fmtVal(v)}</span></div>`).join('');

  // Render sets
  const setsEl = document.getElementById('sets-display');
  const setHtml = Object.entries(setCount).filter(([,c])=>c>=2).map(([name,c])=>
    `<div class="set-row">✦ ${name} (${c} pcs)</div>`).join('');
  setsEl.innerHTML = setHtml || '<div style="font-size:.72rem;color:rgba(153,147,170,.4)">Aucun set actif</div>';

  // Enchantements arme active
  const enchEl = document.getElementById('enchant-display');
  enchEl.innerHTML = ENCHANT_POOL.slice(0,8).map(e =>
    `<div class="enchant-row"><span class="er-slot"></span>${e.stat}: <strong style="color:#e3b45a">${e.min}~${e.max}${e.unit}</strong></div>`
  ).join('');
}

// ── SAVE / SHARE ──────────────────────────────────────────────────────────────
async function saveBuild() {
  const name = document.getElementById('build-name').value.trim() || 'Build sans nom';
  const buildData = {
    v: 1, pseudo: state.pseudo, name, mode: state.mode,
    char: state.char?.slug,
    gear: Object.fromEntries(Object.entries(state.gear).map(([s,i])=>[s,i?.id])),
    weapons: state.weapons.map(w=>w?.id),
    echelons: state.echelons,
    masteries: state.masteries,
    ts: Date.now(),
  };
  const encoded = btoa(JSON.stringify(buildData));
  // Save to Sheet via worker
  try {
    await fetch(`${WORKER}/build`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({pseudo:state.pseudo, name, build_data:encoded})
    });
    alert('✅ Build sauvegardé !');
  } catch(e) {
    // Fallback: just copy URL
    shareBuild();
  }
}

function shareBuild() {
  const buildData = {
    v:1, pseudo:state.pseudo, name:document.getElementById('build-name').value.trim()||'Build',
    mode:state.mode, char:state.char?.slug,
    gear:Object.fromEntries(Object.entries(state.gear).map(([s,i])=>[s,i?.id])),
    weapons:state.weapons.map(w=>w?.id), echelons:state.echelons, masteries:state.masteries,
  };
  const url = `${window.location.origin}${window.location.pathname}?build=${btoa(JSON.stringify(buildData))}`;
  navigator.clipboard.writeText(url).then(()=>alert('🔗 Lien copié dans le presse-papier !'));
}

function loadSharedBuild(encoded) {
  try {
    const data = JSON.parse(atob(encoded));
    state.pseudo = data.pseudo || 'Visiteur';
    state.mode   = data.mode || 'armor';
    if (data.masteries) state.masteries = data.masteries;
    if (data.echelons)  state.echelons  = data.echelons;
    document.getElementById('build-name').value = data.name || '';
    document.getElementById('step-login').style.display = 'none';
    document.getElementById('step-builder').style.display = 'block';
    document.getElementById('builder-user').textContent = `👁 ${state.pseudo}`;
    initBuilder();
    // Restore char
    if (data.char) {
      document.getElementById('char-select').value = data.char;
      selectChar(data.char);
    }
    // Restore gear (after DB loaded)
    setTimeout(() => {
      if (data.gear) Object.entries(data.gear).forEach(([slot,id]) => {
        if (!id) return;
        const item = (DB.gear_by_slot[slot]||[]).find(i=>i.id==id);
        if (item) { state.gear[slot]=item; updateSlotUI(slot,item); }
      });
      if (data.weapons) data.weapons.forEach((id,i) => {
        if (!id) return;
        const w = Object.values(DB.weapons_by_type).flat().find(w=>w.id==id);
        if (w) { state.weapons[i]=w; updateWeaponUI(i); }
      });
      recalcStats();
    }, 1000);
  } catch(e) { console.warn('Failed to load shared build', e); }
}

function clearBuild() {
  state.gear = {}; state.weapons = [null,null,null]; state.echelons = [1,1,1];
  ['Top','Bottom','Belt','Shoes','Necklace','Earring','Ring','Costume'].forEach(s => {
    const el = document.getElementById(`slot-${s}`);
    if (el) {
      el.classList.remove('has-item');
      el.innerHTML = `<div class="slot-inner"><span class="slot-icon">${getSlotIcon(s)}</span><span class="slot-lbl">${SLOT_LABELS[s]||s}</span></div>`;
    }
  });
  [0,1,2].forEach(i => {
    document.getElementById(`ws-img-${i}`).innerHTML = `<span style="font-size:${i===0?1.4:1.2}rem">⚔️</span>`;
    document.getElementById(`ws-name-${i}`).textContent = `Arme ${i+1}`;
    document.getElementById(`ech-stars-${i}`).innerHTML = '';
  });
  recalcStats();
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmtVal(v) {
  if (typeof v === 'string') return v;
  if (!v) return '—';
  if (v >= 1000000) return (v/1000000).toFixed(2)+'M';
  if (v >= 1000)    return (v/1000).toFixed(1)+'K';
  return String(Math.round(v));
}
function rarityLabel(r) {
  if (r==='Grade5') return 'SSR';
  if (r==='Grade4') return 'SR';
  if (r==='Grade3') return 'R';
  return r||'?';
}
function getSlotIcon(s) {
  return {Top:'🎽',Bottom:'👖',Belt:'🔲',Shoes:'👢',Necklace:'📿',Earring:'💎',Ring:'💍',Costume:'👘'}[s]||'⬜';
}
</script>
