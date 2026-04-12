---
layout: default
title: Builder
permalink: /pages/builder/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild · Outils</span>
    <h1>Builder d'équipement</h1>
    <p>Planifie ton build, calcule tes stats et partage-le avec la guilde.</p>
  </div>
</section>

<div class="container" style="padding-bottom:60px">

  <!-- TOPBAR -->
  <div class="bd-topbar">
    <div class="bd-topbar-left">
      <div class="bd-char-pick" id="char-picker">
        <div class="bd-char-selected" id="char-selected-display" onclick="toggleCharPicker()">
          <img id="char-thumb" src="" style="display:none;width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid rgba(201,151,62,.4)">
          <span id="char-selected-name" style="font-size:.82rem;color:rgba(153,147,170,.7)">— Personnage —</span>
          <span style="color:rgba(153,147,170,.5);margin-left:4px">▾</span>
        </div>
        <div class="bd-char-dropdown" id="char-dropdown" style="display:none"></div>
      </div>
      <div style="display:flex;gap:0;border:1px solid rgba(255,255,255,.1);border-radius:7px;overflow:hidden">
        <button id="mode-armor"   class="mode-btn mode-active" onclick="setMode('armor')">⚔ Armure</button>
        <button id="mode-costume" class="mode-btn"             onclick="setMode('costume')">👘 Costume</button>
      </div>
    </div>
    <div class="bd-topbar-right">
      <input id="build-name" type="text" placeholder="Nom du build..." class="bd-input" style="width:180px">
      <button onclick="saveBuild()" class="bd-btn-gold">💾 Sauvegarder</button>
      <button onclick="shareBuild()" class="bd-btn-ghost">🔗 Partager</button>
      <button onclick="clearBuild()" class="bd-btn-ghost" title="Reset">↺</button>
    </div>
  </div>

  <!-- MAIN LAYOUT -->
  <div class="bd-layout">

    <!-- LEFT: équipement -->
    <div class="bd-left">

      <!-- Armure wheel -->
      <div class="bd-armor-section" id="armor-section">
        <div class="bd-slots-grid">
          <div class="bd-slot" id="slot-Top"     data-slot="Top"     onclick="openGearPanel('Top')">    <div class="bds-inner"><span class="bds-icon">🎽</span><div class="bds-lbl">Torse</div></div></div>
          <div class="bd-slot" id="slot-Bottom"  data-slot="Bottom"  onclick="openGearPanel('Bottom')"> <div class="bds-inner"><span class="bds-icon">👖</span><div class="bds-lbl">Bas</div></div></div>
          <div class="bd-slot" id="slot-Belt"    data-slot="Belt"    onclick="openGearPanel('Belt')">   <div class="bds-inner"><span class="bds-icon">🟫</span><div class="bds-lbl">Ceinture</div></div></div>
          <div class="bd-slot" id="slot-Shoes"   data-slot="Shoes"   onclick="openGearPanel('Shoes')">  <div class="bds-inner"><span class="bds-icon">👢</span><div class="bds-lbl">Bottes</div></div></div>
          <div class="bd-slot" id="slot-Necklace"data-slot="Necklace"onclick="openGearPanel('Necklace')"><div class="bds-inner"><span class="bds-icon">📿</span><div class="bds-lbl">Collier</div></div></div>
          <div class="bd-slot" id="slot-Earring" data-slot="Earring" onclick="openGearPanel('Earring')"><div class="bds-inner"><span class="bds-icon">💎</span><div class="bds-lbl">Boucles</div></div></div>
          <div class="bd-slot" id="slot-Ring"    data-slot="Ring"    onclick="openGearPanel('Ring')">   <div class="bds-inner"><span class="bds-icon">💍</span><div class="bds-lbl">Anneau</div></div></div>
        </div>
        <!-- Portrait central -->
        <div class="bd-portrait">
          <div class="bd-portrait-frame" onclick="toggleCharPicker()">
            <img id="char-portrait" src="" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:none">
            <div id="portrait-placeholder" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(153,147,170,.4);font-size:.78rem;gap:6px">
              <span style="font-size:2rem">👤</span>Choisir un personnage
            </div>
            <div class="portrait-name" id="portrait-name" style="display:none"></div>
          </div>
        </div>
      </div>

      <!-- Costume section -->
      <div class="bd-costume-section" id="costume-section" style="display:none">
        <div class="bd-slot bd-slot-costume" id="slot-Costume" onclick="openGearPanel('Costume')">
          <div class="bds-inner"><span class="bds-icon" style="font-size:2rem">👘</span><div class="bds-lbl">Costume</div><div class="bds-sublbl">Remplace l'armure</div></div>
        </div>
        <div class="bd-portrait">
          <div class="bd-portrait-frame" onclick="toggleCharPicker()">
            <img id="char-portrait-c" src="" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center top;display:none">
            <div id="portrait-placeholder-c" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:rgba(153,147,170,.4);font-size:.78rem;gap:6px">
              <span style="font-size:2rem">👤</span>Choisir un personnage
            </div>
            <div class="portrait-name" id="portrait-name-c" style="display:none"></div>
          </div>
        </div>
        <!-- Accessories in costume mode -->
        <div class="bd-slots-grid bd-slots-acc">
          <div class="bd-slot" id="slot-Necklace-c"data-slot="Necklace"onclick="openGearPanel('Necklace')"><div class="bds-inner"><span class="bds-icon">📿</span><div class="bds-lbl">Collier</div></div></div>
          <div class="bd-slot" id="slot-Earring-c" data-slot="Earring" onclick="openGearPanel('Earring')"><div class="bds-inner"><span class="bds-icon">💎</span><div class="bds-lbl">Boucles</div></div></div>
          <div class="bd-slot" id="slot-Ring-c"    data-slot="Ring"    onclick="openGearPanel('Ring')">   <div class="bds-inner"><span class="bds-icon">💍</span><div class="bds-lbl">Anneau</div></div></div>
        </div>
      </div>

      <!-- 3 armes -->
      <div class="bd-weapons">
        <div class="bd-weapon-card active" id="wcard-0" onclick="openWeaponPanel(0)">
          <div class="wc-badge wc-active">ACTIVE · 100% ATK</div>
          <img id="wimg-0" src="" style="display:none;width:48px;height:48px;object-fit:contain;border-radius:7px;margin:4px auto">
          <div class="wc-empty-icon" id="wempty-0">⚔️</div>
          <div id="wname-0" class="wc-name">Arme active</div>
          <div id="wtype-0" class="wc-type"></div>
          <div class="wc-echelon" id="wechelon-0">
            <span class="we-lbl">Échelon</span>
            <div id="westars-0" class="we-stars"></div>
          </div>
        </div>
        <div class="bd-weapon-card" id="wcard-1" onclick="openWeaponPanel(1)">
          <div class="wc-badge wc-sub">30% ATK</div>
          <img id="wimg-1" src="" style="display:none;width:40px;height:40px;object-fit:contain;border-radius:6px;margin:4px auto">
          <div class="wc-empty-icon" id="wempty-1" style="font-size:1.1rem">⚔️</div>
          <div id="wname-1" class="wc-name">Arme 2</div>
          <div id="wtype-1" class="wc-type"></div>
          <div class="wc-echelon" id="wechelon-1">
            <span class="we-lbl">Échelon</span>
            <div id="westars-1" class="we-stars"></div>
          </div>
        </div>
        <div class="bd-weapon-card" id="wcard-2" onclick="openWeaponPanel(2)">
          <div class="wc-badge wc-sub">30% ATK</div>
          <img id="wimg-2" src="" style="display:none;width:40px;height:40px;object-fit:contain;border-radius:6px;margin:4px auto">
          <div class="wc-empty-icon" id="wempty-2" style="font-size:1.1rem">⚔️</div>
          <div id="wname-2" class="wc-name">Arme 3</div>
          <div id="wtype-2" class="wc-type"></div>
          <div class="wc-echelon" id="wechelon-2">
            <span class="we-lbl">Échelon</span>
            <div id="westars-2" class="we-stars"></div>
          </div>
        </div>
      </div>

    </div><!-- bd-left -->

    <!-- RIGHT: stats, maîtrises, enchantements -->
    <div class="bd-right">

      <!-- Stats -->
      <div class="bd-panel">
        <div class="bd-panel-head">
          Stats calculées
          <button onclick="toggleAdvanced()" id="btn-advanced" class="bd-btn-tiny">+ Avancées</button>
        </div>
        <div id="stats-basic" class="stats-section"></div>
        <div id="stats-advanced" style="display:none" class="stats-section"></div>
        <div id="sets-display" class="sets-section"></div>
      </div>

      <!-- Maîtrises -->
      <div class="bd-panel">
        <div class="bd-panel-head">Maîtrises armes</div>
        <p style="font-size:.72rem;color:rgba(153,147,170,.5);margin-bottom:10px;line-height:1.5">Le niveau MASTER donne ATK+3%/DEF+3%/HP+3% à <strong style="color:rgba(233,228,217,.7)">toutes les armes</strong>. Les combos s'activent si les deux types sont équipés.</p>
        <div id="mastery-panel"></div>
      </div>

      <!-- Enchantements arme active -->
      <div class="bd-panel">
        <div class="bd-panel-head">Enchantements <span id="enchant-weapon-name" style="color:rgba(153,147,170,.6);font-weight:400"></span></div>
        <p style="font-size:.72rem;color:rgba(153,147,170,.5);margin-bottom:10px;line-height:1.5">Slots 1-3 : 100% · Slot 4 : 20%<br>Choisis un stat par slot, entre la valeur obtenue.</p>
        <div id="enchant-panel"></div>
      </div>

    </div><!-- bd-right -->

  </div><!-- bd-layout -->

  <!-- GEAR PANEL (overlay gauche) -->
  <div id="gear-overlay" style="display:none;position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.7);backdrop-filter:blur(4px)" onclick="if(event.target===this)closeGearPanel()">
    <div class="gear-panel-drawer">
      <div class="gear-panel-head">
        <span id="gp-title" style="font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#e3b45a"></span>
        <button onclick="closeGearPanel()" style="background:none;border:none;color:rgba(153,147,170,.5);cursor:pointer;font-size:1.1rem">✕</button>
      </div>
      <input id="gp-search" type="text" placeholder="Rechercher..." class="bd-input" oninput="renderGearList()" style="width:100%;margin-bottom:10px">
      <div id="gp-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:5px"></div>
    </div>
  </div>

  <!-- WEAPON PANEL -->
  <div id="weapon-overlay" style="display:none;position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.7);backdrop-filter:blur(4px)" onclick="if(event.target===this)closeWeaponPanel()">
    <div class="gear-panel-drawer">
      <div class="gear-panel-head">
        <span id="wp-title" style="font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#e3b45a"></span>
        <button onclick="closeWeaponPanel()" style="background:none;border:none;color:rgba(153,147,170,.5);cursor:pointer;font-size:1.1rem">✕</button>
      </div>
      <!-- Type selector -->
      <div id="wp-type-bar" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"></div>
      <!-- Echelon -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <span style="font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(153,147,170,.55)">Échelon :</span>
        <div id="wp-echelon-stars" style="display:flex;gap:3px"></div>
      </div>
      <input id="wp-search" type="text" placeholder="Rechercher une arme..." class="bd-input" oninput="renderWeaponList()" style="width:100%;margin-bottom:10px">
      <div id="wp-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:5px"></div>
    </div>
  </div>

</div><!-- container -->

<style>
/* ── Topbar ── */
.bd-topbar {
  display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;
  background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);
  border-radius:10px;padding:10px 16px;margin-bottom:18px;
}
.bd-topbar-left,.bd-topbar-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bd-input{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:7px 12px;font-size:.82rem;color:#e8e4d9;font-family:inherit;outline:none}
.bd-input:focus{border-color:rgba(201,151,62,.4)}
.bd-btn-gold{background:linear-gradient(145deg,rgba(201,151,62,.2),rgba(201,151,62,.07));border:1px solid rgba(201,151,62,.35);border-radius:7px;padding:7px 14px;font-size:.78rem;font-weight:600;color:#e3b45a;cursor:pointer;font-family:inherit;white-space:nowrap}
.bd-btn-ghost{background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:7px 12px;font-size:.78rem;color:rgba(233,228,217,.6);cursor:pointer;font-family:inherit;white-space:nowrap}
.bd-btn-tiny{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:5px;padding:2px 8px;font-size:.65rem;color:rgba(153,147,170,.7);cursor:pointer;font-family:inherit;margin-left:auto}
.mode-btn{padding:6px 14px;font-size:.75rem;font-weight:600;font-family:inherit;cursor:pointer;border:none;background:transparent;color:rgba(233,228,217,.45);transition:.15s}
.mode-btn.mode-active{background:rgba(201,151,62,.14);color:#e3b45a}

/* ── Char picker ── */
.bd-char-pick{position:relative}
.bd-char-selected{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:7px 12px;cursor:pointer;min-width:160px;white-space:nowrap}
.bd-char-dropdown{position:absolute;top:calc(100% + 4px);left:0;z-index:200;background:#0d0f1a;border:1px solid rgba(201,151,62,.2);border-radius:8px;min-width:200px;max-height:320px;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.6)}
.bd-char-opt{display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;font-size:.83rem;transition:.12s;border-bottom:1px solid rgba(255,255,255,.04)}
.bd-char-opt:hover{background:rgba(201,151,62,.08);color:#e3b45a}
.bd-char-opt:last-child{border-bottom:none}
.bd-char-opt img{width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,.1)}

/* ── Layout ── */
.bd-layout{display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start}
@media(max-width:1000px){.bd-layout{grid-template-columns:1fr}}

/* ── Left ── */
.bd-left{display:flex;flex-direction:column;gap:14px}

/* ── Armor section ── */
.bd-armor-section{display:grid;grid-template-columns:1fr 160px;gap:10px;align-items:start}
.bd-slots-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.bd-slots-acc{grid-template-columns:1fr 1fr 1fr;margin-top:10px}

/* ── Slots ── */
.bd-slot{
  background:linear-gradient(145deg,rgba(201,151,62,.07),rgba(7,8,13,.5));
  border:1px solid rgba(201,151,62,.18);border-radius:9px;
  cursor:pointer;transition:.18s;overflow:hidden;min-height:72px;position:relative;
}
.bd-slot:hover{border-color:rgba(201,151,62,.45);background:rgba(201,151,62,.1)}
.bd-slot.has-item{border-color:rgba(201,151,62,.4)}
.bds-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;height:100%;min-height:72px;gap:3px;text-align:center}
.bds-icon{font-size:1.3rem}
.bds-lbl{font-size:.6rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(153,147,170,.55)}
.bds-sublbl{font-size:.58rem;color:rgba(153,147,170,.4)}
.slot-item-img{width:100%;height:100%;object-fit:contain;padding:6px;position:absolute;inset:0}
.slot-item-name{position:absolute;bottom:0;left:0;right:0;font-size:.55rem;font-weight:600;color:#e8e4d9;text-align:center;background:rgba(0,0,0,.65);padding:2px 4px;line-height:1.2}
.bd-slot-costume{min-height:120px;grid-column:1}

/* ── Costume section ── */
.bd-costume-section{display:grid;grid-template-columns:120px 160px 1fr;gap:10px;align-items:start}

/* ── Portrait ── */
.bd-portrait{width:160px;flex-shrink:0}
.bd-portrait-frame{
  width:160px;height:260px;
  border:1px solid rgba(201,151,62,.25);border-radius:10px;
  overflow:hidden;position:relative;background:rgba(255,255,255,.03);cursor:pointer;
  transition:.18s;
}
.bd-portrait-frame:hover{border-color:rgba(201,151,62,.45)}
.portrait-name{
  position:absolute;bottom:0;left:0;right:0;
  padding:8px;background:linear-gradient(transparent,rgba(0,0,0,.8));
  font-family:'Cormorant Garamond',Georgia,serif;font-size:.9rem;font-weight:700;color:#f0ece0;text-align:center;
}

/* ── Weapons ── */
.bd-weapons{display:flex;gap:10px}
.bd-weapon-card{
  flex:1;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);
  border-radius:10px;cursor:pointer;padding:10px 8px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:5px;transition:.18s;
}
.bd-weapon-card.active{background:rgba(201,151,62,.07);border-color:rgba(201,151,62,.25)}
.bd-weapon-card:hover{border-color:rgba(201,151,62,.4)}
.wc-badge{font-size:.58rem;font-weight:700;letter-spacing:.07em;padding:2px 8px;border-radius:99px}
.wc-active{background:rgba(201,151,62,.2);color:#e3b45a;border:1px solid rgba(201,151,62,.4)}
.wc-sub{background:rgba(255,255,255,.07);color:rgba(153,147,170,.7);border:1px solid rgba(255,255,255,.1)}
.wc-empty-icon{font-size:1.4rem;opacity:.3}
.wc-name{font-size:.68rem;font-weight:600;color:#e8e4d9;line-height:1.25}
.wc-type{font-size:.6rem;color:#e3b45a;letter-spacing:.04em}
.wc-echelon{display:flex;flex-direction:column;align-items:center;gap:2px}
.we-lbl{font-size:.55rem;color:rgba(153,147,170,.45);letter-spacing:.06em}
.we-stars{display:flex;gap:2px}
.we-star{font-size:11px;color:#e3b45a;opacity:.25;cursor:pointer;transition:.1s}
.we-star.on{opacity:1}

/* ── Right panels ── */
.bd-right{display:flex;flex-direction:column;gap:12px}
.bd-panel{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px}
.bd-panel-head{font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#e3b45a;margin-bottom:10px;display:flex;align-items:center}
.stats-section{display:flex;flex-direction:column;gap:4px}
.sr{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:.78rem}
.sr .sn{color:rgba(153,147,170,.75)}
.sr .sv{font-weight:700;color:#e8e4d9}
.sr .sv.zero{color:rgba(153,147,170,.35)}
.stats-divider{height:1px;background:rgba(255,255,255,.06);margin:6px 0}
.sets-section{margin-top:8px;border-top:1px solid rgba(255,255,255,.05);padding-top:8px}
.set-tag{font-size:.7rem;color:#e3b45a;background:rgba(201,151,62,.1);border:1px solid rgba(201,151,62,.2);border-radius:4px;padding:2px 8px;display:inline-block;margin:2px}

/* ── Mastery ── */
.mastery-item{padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:center;gap:8px}
.mastery-item:last-child{border-bottom:none}
.mastery-name{flex:1;font-size:.75rem;color:rgba(233,228,217,.8)}
.mastery-combo{font-size:.6rem;color:#a78bfa;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);padding:1px 6px;border-radius:3px}
.mastery-level-select{display:flex;gap:2px}
.mlv{padding:2px 6px;font-size:.6rem;font-weight:700;border:1px solid rgba(255,255,255,.1);border-radius:3px;cursor:pointer;background:transparent;color:rgba(153,147,170,.5);font-family:inherit;transition:.12s}
.mlv.active{background:rgba(201,151,62,.15);border-color:rgba(201,151,62,.4);color:#e3b45a}

/* ── Enchantements ── */
.enchant-slot{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.enchant-slot:last-child{border-bottom:none}
.ench-slot-num{font-size:.65rem;font-weight:700;color:#e3b45a;min-width:18px}
.ench-slot-chance{font-size:.58rem;color:rgba(153,147,170,.4)}
.ench-stat-select{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:5px;padding:4px 8px;font-size:.72rem;color:#e8e4d9;font-family:inherit;outline:none;flex:1;min-width:130px}
.ench-val{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:5px;padding:4px 8px;font-size:.72rem;color:#e3b45a;font-family:inherit;outline:none;width:70px}

/* ── Gear / Weapon panels ── */
.gear-panel-drawer{
  position:fixed;left:0;top:0;bottom:0;width:320px;
  background:#0b0d17;border-right:1px solid rgba(201,151,62,.15);
  padding:20px 16px;display:flex;flex-direction:column;
  box-shadow:4px 0 32px rgba(0,0,0,.6);
}
.gear-panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.gp-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid rgba(255,255,255,.07);border-radius:8px;cursor:pointer;transition:.14s}
.gp-item:hover{border-color:rgba(201,151,62,.4);background:rgba(201,151,62,.06)}
.gp-item.sel{border-color:rgba(201,151,62,.55);background:rgba(201,151,62,.1)}
.gp-item img{width:38px;height:38px;border-radius:6px;border:1px solid rgba(255,255,255,.1);flex-shrink:0;background:rgba(255,255,255,.04);object-fit:contain}
.gp-item-info .gpi-name{font-size:.78rem;font-weight:600;color:#e8e4d9}
.gp-item-info .gpi-stat{font-size:.67rem;color:rgba(153,147,170,.65)}
.gp-item-info .gpi-set{font-size:.62rem;color:rgba(201,151,62,.7)}
.rarity-Grade5,.rarity-SSR{background:rgba(251,191,36,.12);color:#fbbf24;font-size:.58rem;font-weight:700;padding:1px 5px;border-radius:3px}
.rarity-Grade4,.rarity-SR{background:rgba(167,139,250,.12);color:#a78bfa;font-size:.58rem;font-weight:700;padding:1px 5px;border-radius:3px}
.wp-type-btn{padding:4px 10px;font-size:.7rem;font-weight:600;border:1px solid rgba(255,255,255,.1);border-radius:5px;cursor:pointer;background:transparent;color:rgba(233,228,217,.55);font-family:inherit;transition:.15s}
.wp-type-btn.active{background:rgba(201,151,62,.15);border-color:rgba(201,151,62,.45);color:#e3b45a}
</style>

<script>
// ── DATA ────────────────────────────────────────────────────────────────────
const WORKER  = 'https://purgatoire-bot.originsguild.workers.dev';
const SHEET   = '1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM';

const TYPE_MAP = {
  'Shield':'Shield','Book':'Book','Wand':'Wand','Axe':'Axe',
  'Gauntlets':'Gauntlets','Cudgel':'Cudgel3c','Lance':'Lance',
  'Rapier':'Rapier','Greatsword':'Sword2h','Longsword':'Sword1h',
  'Staff':'END_WEAPON','Dual Swords':'SwordDual',
};
const TYPE_LABELS = {
  Shield:'Bouclier',Book:'Grimoire',Wand:'Baguette',Axe:'Hache',
  Gauntlets:'Gantelets',Cudgel3c:'Nunchaku',Lance:'Lance',Rapier:'Rapière',
  Sword2h:'Grande épée',Sword1h:'Épée longue',END_WEAPON:'Bâton',SwordDual:'Épées doubles',
};

const SLOT_ICONS = {Top:'🎽',Bottom:'👖',Belt:'🟫',Shoes:'👢',Necklace:'📿',Earring:'💎',Ring:'💍',Costume:'👘'};
const SLOT_LABELS = {Top:'Torse',Bottom:'Bas',Belt:'Ceinture',Shoes:'Bottes',Necklace:'Collier',Earring:'Boucles',Ring:'Anneau',Costume:'Costume'};

// Enchantement pool — même pool pour toutes armes (éléments varient)
const ENCH_POOL = [
  {key:'def_pct',   label:'Augm. Défense %',            min:3.40, max:5.71,  unit:'%'},
  {key:'hp_pct',    label:'Augm. PV %',                  min:2.49, max:4.17,  unit:'%'},
  {key:'atk_norm',  label:'Dégâts attaque normale',       min:18.56,max:30.95, unit:''},
  {key:'atk_spe',   label:'Dégâts attaque spéciale',      min:16.90,max:28.17, unit:''},
  {key:'skill_norm',label:'Dégâts compétence normale',    min:13.01,max:21.69, unit:''},
  {key:'skill_rev', label:'Dégâts compétence relève',     min:22.86,max:38.12, unit:''},
  {key:'atk_ult',   label:'Dégâts attaque ultime',        min:10.19,max:16.98, unit:''},
  {key:'cd_reduc',  label:'Réduction de recharge',        min:6.71, max:11.19, unit:'%'},
  {key:'mana_eff',  label:'Efficacité recharge magie',    min:8.95, max:14.97, unit:'%'},
  {key:'crit_rate', label:'Chances critique',             min:6.05, max:10.11, unit:'%'},
  {key:'crit_res',  label:'Résistance critique',          min:6.05, max:10.11, unit:'%'},
  {key:'crit_dmg',  label:'Dégâts critiques',             min:10.69,max:17.83, unit:'%'},
  {key:'crit_def',  label:'Défense critique',             min:10.69,max:17.83, unit:'%'},
  {key:'atk_pct',   label:'Augm. Attaque %',              min:4.23, max:7.10,  unit:'%'},
  {key:'elem_atk',  label:'Attaque élémentaire %',        min:26.26,max:43.76, unit:'%'},
  {key:'elem_dmg',  label:'Dégâts élémentaires %',        min:11.35,max:18.98, unit:'%'},
  {key:'buff_dur',  label:'Durée des buffs',              min:11.19,max:18.68, unit:'%'},
];

// Maîtrises — MASTER level stats (s'appliquent à toutes les armes)
const MASTERIES_DEF = [
  {id:'Sword1h',  name:'Épée longue',   global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Sword2h',  name:'Grande épée',   global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'SwordDual',name:'Épées doubles', global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Axe',      name:'Hache',         global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Lance',    name:'Lance',         global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Gauntlets',name:'Gantelets',     global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Cudgel3c', name:'Nunchaku',      global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Rapier',   name:'Rapière',       global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Shield',   name:'Bouclier',      global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Book',     name:'Grimoire',      global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'Wand',     name:'Baguette',      global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  {id:'END_WEAPON',name:'Bâton',        global:{atk_pct:3,def_pct:3,hp_pct:3,atk:225,def:102,hp:288,perfo:16,persev:11}},
  // Combos
  {id:'sw1h_sh',  name:'Épée + Bouclier', combo:['Sword1h','Shield'], global:{crit_rate:1.05,crit_dmg:2.80}},
  {id:'axe_sh',   name:'Hache + Bouclier',combo:['Axe','Shield'],     global:{atk:80,perfo:30}},
  {id:'2h_sh',    name:'Grande épée + Bouclier',combo:['Sword2h','Shield'],global:{atk_pct:2,def_pct:2}},
];

// State
const state = {
  mode:'armor', char:null,
  gear:{}, weapons:[null,null,null],
  echelons:[1,1,1],
  weaponTypes:[null,null,null], // selected type per weapon slot
  masteries:{},  // typeId → level (0=none,1=I,2=II,3=III,4=IV,5=MASTER)
  enchants:[[null,null,null,null],[null,null,null,null],[null,null,null,null]], // per weapon, 4 slots each {key,val}
  advancedStats:false,
};
let DB = {gear_by_slot:{},weapons_by_type:{},characters:[]};
let openGearSlot = null;
let openWeaponIdx = null;
let selectedWpType = null;

// ── LOAD DB ──────────────────────────────────────────────────────────────────
async function loadDB() {
  try {
    const r = await fetch('/Purgatoire/assets/data/builder_data.json',{cache:'no-store'});
    DB = await r.json();
    buildCharDropdown();
  } catch(e) { console.warn('DB load error',e); }
}

// ── CHARACTER ─────────────────────────────────────────────────────────────────
function buildCharDropdown() {
  const dd = document.getElementById('char-dropdown');
  dd.innerHTML = DB.characters.map(c => `
    <div class="bd-char-opt" onclick="selectChar('${c.slug}')">
      <img src="${c.image_url||''}" onerror="this.style.display='none'">
      <span>${c.nom}</span>
    </div>`).join('');
}

function toggleCharPicker() {
  const dd = document.getElementById('char-dropdown');
  dd.style.display = dd.style.display==='none' ? 'block' : 'none';
}

function selectChar(slug) {
  const c = DB.characters.find(x=>x.slug===slug);
  if (!c) return;
  state.char = c;
  // Update displays
  document.getElementById('char-dropdown').style.display='none';
  document.getElementById('char-thumb').src = c.image_url||'';
  document.getElementById('char-thumb').style.display = 'block';
  document.getElementById('char-selected-name').textContent = c.nom;
  const portrait = document.getElementById('char-portrait');
  portrait.src = c.image_url||'';
  portrait.style.display = 'block';
  document.getElementById('portrait-placeholder').style.display='none';
  document.getElementById('portrait-name').textContent = c.nom;
  document.getElementById('portrait-name').style.display='block';
  // Same for costume portrait
  const pc = document.getElementById('char-portrait-c');
  if(pc){pc.src=c.image_url||'';pc.style.display='block';}
  const ppc = document.getElementById('portrait-placeholder-c');
  if(ppc) ppc.style.display='none';
  const pnc = document.getElementById('portrait-name-c');
  if(pnc){pnc.textContent=c.nom;pnc.style.display='block';}
  // Reset weapons to match char's types
  state.weaponTypes=[null,null,null];
  state.weapons=[null,null,null];
  renderMasteryPanel();
  recalc();
}

// ── MODE ─────────────────────────────────────────────────────────────────────
function setMode(m) {
  state.mode = m;
  document.getElementById('mode-armor').classList.toggle('mode-active',m==='armor');
  document.getElementById('mode-costume').classList.toggle('mode-active',m==='costume');
  document.getElementById('armor-section').style.display=m==='armor'?'grid':'none';
  document.getElementById('costume-section').style.display=m==='costume'?'grid':'none';
  recalc();
}

// ── GEAR ─────────────────────────────────────────────────────────────────────
function openGearPanel(slot) {
  openGearSlot = slot;
  document.getElementById('gp-title').textContent = SLOT_LABELS[slot]||slot;
  document.getElementById('gp-search').value='';
  document.getElementById('gear-overlay').style.display='block';
  renderGearList();
}
function closeGearPanel() {
  document.getElementById('gear-overlay').style.display='none';
  openGearSlot=null;
}
function renderGearList() {
  const slot = openGearSlot;
  if (!slot) return;
  const search = document.getElementById('gp-search').value.toLowerCase();
  const items = (DB.gear_by_slot[slot]||[]).filter(i=>!search||i.nom.toLowerCase().includes(search));
  const cur = state.gear[slot];
  document.getElementById('gp-list').innerHTML = items.map(item=>`
    <div class="gp-item ${cur&&cur.id===item.id?'sel':''}" onclick="selectGear('${slot}','${item.id}')">
      <img src="${item.image_url||''}" onerror="this.style.display='none'">
      <div class="gp-item-info">
        <div class="gpi-name">${item.nom}</div>
        <div class="gpi-stat">${item.main_stat}: ${fmtVal(item.main_val)}</div>
        <div class="gpi-set">${item.set_name||''}</div>
      </div>
      <span class="rarity-${item.rarete}">${rarityLbl(item.rarete)}</span>
    </div>`).join('');
}
function selectGear(slot, id) {
  const item = (DB.gear_by_slot[slot]||[]).find(i=>i.id==id);
  if (!item) return;
  state.gear[slot] = item;
  // Update slot UI — handle both costume mode and armor mode
  for (const sfx of ['', '-c']) {
    const el = document.getElementById(`slot-${slot}${sfx}`);
    if (!el) continue;
    el.classList.add('has-item');
    el.innerHTML = `<img class="slot-item-img" src="${item.image_url||''}" onerror="this.style.display='none'"><div class="slot-item-name">${item.nom.length>20?item.nom.slice(0,19)+'…':item.nom}</div>`;
  }
  renderGearList();
  recalc();
}

// ── WEAPONS ──────────────────────────────────────────────────────────────────
function openWeaponPanel(idx) {
  openWeaponIdx = idx;
  document.getElementById('wp-title').textContent = `Arme ${idx+1} ${idx===0?'(active, 100% ATK)':'(inactive, 30% ATK)'}`;
  document.getElementById('weapon-overlay').style.display='block';
  selectedWpType = state.weaponTypes[idx] || null;
  renderTypeBar();
  renderWeaponEchelon(idx);
  renderWeaponList();
}
function closeWeaponPanel() {
  document.getElementById('weapon-overlay').style.display='none';
  openWeaponIdx=null;
}
function renderTypeBar() {
  const charArms = state.char ? state.char.armes.split('/').map(a=>TYPE_MAP[a.trim()]||a.trim()).filter(Boolean) : Object.keys(DB.weapons_by_type);
  const bar = document.getElementById('wp-type-bar');
  bar.innerHTML = charArms.map(t=>`
    <button class="wp-type-btn ${selectedWpType===t?'active':''}" onclick="selectWpType('${t}')">${TYPE_LABELS[t]||t}</button>
  `).join('');
}
function selectWpType(t) {
  selectedWpType = t;
  state.weaponTypes[openWeaponIdx] = t;
  renderTypeBar();
  renderWeaponList();
  renderMasteryPanel();
  recalc();
}
function renderWeaponEchelon(idx) {
  const ech = state.echelons[idx]||1;
  const container = document.getElementById('wp-echelon-stars');
  container.innerHTML = [1,2,3,4,5].map(i=>`
    <span onclick="setWpEchelon(${openWeaponIdx},${i})" style="cursor:pointer;font-size:18px;color:#e3b45a;opacity:${i<=ech?1:.25};transition:.1s">★</span>
  `).join('');
}
function setWpEchelon(idx, val) {
  state.echelons[idx]=val;
  renderWeaponEchelon(idx);
  updateWeaponCardUI(idx);
  recalc();
}
function renderWeaponList() {
  if (!selectedWpType) {
    document.getElementById('wp-list').innerHTML = '<div style="color:rgba(153,147,170,.5);font-size:.8rem;padding:10px">Sélectionne d\'abord un type d\'arme.</div>';
    return;
  }
  const search = document.getElementById('wp-search').value.toLowerCase();
  const weapons = (DB.weapons_by_type[selectedWpType]||[]).filter(w=>!search||w.nom.toLowerCase().includes(search));
  const cur = state.weapons[openWeaponIdx];
  const ech = state.echelons[openWeaponIdx]||1;
  document.getElementById('wp-list').innerHTML = weapons.map(w=>{
    const atk = getAtk(w,ech);
    return `<div class="gp-item ${cur&&cur.id===w.id?'sel':''}" onclick="selectWeapon(${openWeaponIdx},'${w.id}')">
      <img src="${w.image_url||''}" onerror="this.style.display='none'" style="width:38px;height:38px;object-fit:contain;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04)">
      <div class="gp-item-info">
        <div class="gpi-name">${w.nom}</div>
        <div class="gpi-stat">ATK éch.${ech}: ${fmtVal(atk)}</div>
      </div>
      <span class="rarity-${w.rarete}">${rarityLbl(w.rarete)}</span>
    </div>`;
  }).join('') || '<div style="color:rgba(153,147,170,.4);font-size:.8rem;padding:10px">Aucune arme trouvée.</div>';
}
function selectWeapon(idx, id) {
  const w = Object.values(DB.weapons_by_type).flat().find(x=>x.id==id);
  if (!w) return;
  state.weapons[idx]=w;
  updateWeaponCardUI(idx);
  renderWeaponList();
  renderEnchantPanel();
  recalc();
}
function updateWeaponCardUI(idx) {
  const w = state.weapons[idx];
  const ech = state.echelons[idx]||1;
  const img = document.getElementById(`wimg-${idx}`);
  const empty = document.getElementById(`wempty-${idx}`);
  if (w && img) {
    img.src=w.image_url||'';
    img.style.display='block';
    if(empty) empty.style.display='none';
  }
  const nm = document.getElementById(`wname-${idx}`);
  if(nm) nm.textContent = w ? (w.nom.length>22?w.nom.slice(0,21)+'…':w.nom) : `Arme ${idx+1}`;
  const tp = document.getElementById(`wtype-${idx}`);
  if(tp) tp.textContent = state.weaponTypes[idx] ? (TYPE_LABELS[state.weaponTypes[idx]]||state.weaponTypes[idx]) : '';
  const stars = document.getElementById(`westars-${idx}`);
  if(stars) stars.innerHTML = [1,2,3,4,5].map(i=>`
    <span class="we-star ${i<=ech?'on':''}" onclick="event.stopPropagation();setEchelonDirect(${idx},${i})">★</span>
  `).join('');
}
function setEchelonDirect(idx, val) {
  state.echelons[idx]=val;
  updateWeaponCardUI(idx);
  if(openWeaponIdx===idx) renderWeaponEchelon(idx);
  recalc();
}

// ── MASTERIES ─────────────────────────────────────────────────────────────────
function renderMasteryPanel() {
  const equippedTypes = state.weaponTypes.filter(Boolean);
  const relevantMasteries = MASTERIES_DEF.filter(m => {
    if (m.combo) return m.combo.every(t=>equippedTypes.includes(t));
    return equippedTypes.includes(m.id) || !state.char;
  });
  // Show all individual masteries that are relevant + combos
  const allMasteries = MASTERIES_DEF.filter(m => !m.combo && (!state.char || equippedTypes.includes(m.id)));
  const comboMasteries = MASTERIES_DEF.filter(m => m.combo);

  const toShow = [...allMasteries, ...comboMasteries];
  if (!toShow.length) {
    document.getElementById('mastery-panel').innerHTML = '<div style="font-size:.75rem;color:rgba(153,147,170,.4)">Sélectionne des armes pour voir les maîtrises disponibles.</div>';
    return;
  }

  document.getElementById('mastery-panel').innerHTML = toShow.map(m => {
    const lvl = state.masteries[m.id] || 0;
    const levels = m.combo ? ['—','✓'] : ['—','I','II','III','IV','MASTER'];
    const isComboActive = m.combo && m.combo.every(t=>equippedTypes.includes(t));
    return `<div class="mastery-item">
      <span class="mastery-name">${m.name}${m.combo?` <span class="mastery-combo">${isComboActive?'✓ Actif':'Inactif'}</span>`:''}</span>
      <div class="mastery-level-select">
        ${levels.map((l,i)=>`<button class="mlv ${lvl===i?'active':''}" onclick="setMastery('${m.id}',${i})">${l}</button>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function setMastery(id, lvl) {
  state.masteries[id] = lvl;
  renderMasteryPanel();
  recalc();
}

// ── ENCHANTEMENTS ─────────────────────────────────────────────────────────────
function renderEnchantPanel() {
  const w = state.weapons[0];
  document.getElementById('enchant-weapon-name').textContent = w ? `(${w.nom.length>20?w.nom.slice(0,19)+'…':w.nom})` : '';
  const panel = document.getElementById('enchant-panel');
  const slots = [
    {num:1,chance:'100%'},{num:2,chance:'100%'},{num:3,chance:'100%'},{num:4,chance:'20%'}
  ];
  const optionsHtml = '<option value="">— Stat —</option>' + ENCH_POOL.map(e=>`<option value="${e.key}">${e.label} (${e.min}~${e.max}${e.unit})</option>`).join('');

  panel.innerHTML = slots.map((s,i)=>{
    const cur = state.enchants[0][i] || {};
    return `<div class="enchant-slot">
      <span class="ench-slot-num">Slot ${s.num}</span>
      <span class="ench-slot-chance">${s.chance}</span>
      <select class="ench-stat-select" onchange="setEnchant(0,${i},this.value,document.getElementById('ev_0_${i}').value)">
        ${ENCH_POOL.map(e=>`<option value="${e.key}" ${cur.key===e.key?'selected':''}>${e.label}</option>`).join('')}
        <option value="" ${!cur.key?'selected':''}>— Vide —</option>
      </select>
      <input id="ev_0_${i}" type="number" class="ench-val" placeholder="val" step="0.01"
             value="${cur.val||''}" oninput="setEnchant(0,${i},this.previousElementSibling.value,this.value)">
    </div>`;
  }).join('');
}
function setEnchant(wIdx, slotIdx, key, val) {
  state.enchants[wIdx][slotIdx] = key ? {key, val:parseFloat(val)||0} : null;
  recalc();
}

// ── STATS CALC ─────────────────────────────────────────────────────────────────
function recalc() {
  const t = {atk:0,def:0,hp:0,atk_pct:0,def_pct:0,hp_pct:0,
             crit_rate:0,crit_dmg:0,crit_res:0,crit_def:0,
             perfo:0,persev:0,heal_pwr:0};

  // Gear stats
  const setCount = {};
  Object.values(state.gear).forEach(item=>{
    if (!item) return;
    const mv = item.main_val||0;
    const ms = item.main_stat||'';
    if (ms==='PV max')    t.hp  += mv;
    if (ms==='Défense')   t.def += mv;
    if (ms==='Attaque')   t.atk += mv;
    if (ms.includes('%')) {
      if (ms.includes('PV'))    t.hp_pct  += mv/100;
      if (ms.includes('Déf'))   t.def_pct += mv/100;
      if (ms.includes('Atta'))  t.atk_pct += mv/100;
    }
    (item.sub_stats||[]).forEach(s=>{
      if (s.stat.includes('PV')) t.hp += s.val||0;
      if (s.stat.includes('Déf')) t.def += s.val||0;
      if (s.stat.includes('Puissance')) t.heal_pwr += s.val||0;
    });
    if (item.set_name) setCount[item.set_name] = (setCount[item.set_name]||0)+1;
  });

  // Weapon ATK
  state.weapons.forEach((w,i)=>{
    if (!w) return;
    const atk = getAtk(w, state.echelons[i]||1);
    t.atk += i===0 ? atk : Math.round(atk*0.3);
  });

  // Masteries — MASTER level
  const equippedTypes = state.weaponTypes.filter(Boolean);
  MASTERIES_DEF.forEach(m=>{
    const lvl = state.masteries[m.id]||0;
    if (!lvl) return;
    if (m.combo) {
      if (!m.combo.every(t2=>equippedTypes.includes(t2))) return;
    } else if (!equippedTypes.includes(m.id) && state.char) return;
    const maxLvl = m.combo ? 1 : 5;
    if (lvl >= maxLvl) { // MASTER or combo active
      const g = m.global;
      if (g.atk_pct)   t.atk_pct  += g.atk_pct;
      if (g.def_pct)   t.def_pct  += g.def_pct;
      if (g.hp_pct)    t.hp_pct   += g.hp_pct;
      if (g.atk)       t.atk      += g.atk;
      if (g.def)       t.def      += g.def;
      if (g.hp)        t.hp       += g.hp;
      if (g.perfo)     t.perfo    += g.perfo;
      if (g.persev)    t.persev   += g.persev;
      if (g.crit_rate) t.crit_rate += g.crit_rate;
      if (g.crit_dmg)  t.crit_dmg  += g.crit_dmg;
    }
  });

  // Enchantements arme active
  state.enchants[0].forEach(e=>{
    if (!e||!e.key||!e.val) return;
    const pool = ENCH_POOL.find(p=>p.key===e.key);
    if (!pool) return;
    const v = e.val;
    if (e.key==='atk_pct')   t.atk_pct  += v;
    if (e.key==='def_pct')   t.def_pct  += v;
    if (e.key==='hp_pct')    t.hp_pct   += v;
    if (e.key==='crit_rate') t.crit_rate += v;
    if (e.key==='crit_dmg')  t.crit_dmg  += v;
    if (e.key==='crit_res')  t.crit_res  += v;
    if (e.key==='crit_def')  t.crit_def  += v;
  });

  const fAtk = Math.round(t.atk*(1+t.atk_pct/100));
  const fDef = Math.round(t.def*(1+t.def_pct/100));
  const fHp  = Math.round(t.hp*(1+t.hp_pct/100));

  // Render basic stats
  const basic = [
    ['Attaque',        fAtk],
    ['Défense',        fDef],
    ['PV max',         fHp],
    ['Attaque %',      t.atk_pct.toFixed(2)+'%'],
    ['Défense %',      t.def_pct.toFixed(2)+'%'],
    ['PV %',           t.hp_pct.toFixed(2)+'%'],
    ['Chance critique',t.crit_rate.toFixed(2)+'%'],
    ['Dégâts critiques',t.crit_dmg.toFixed(2)+'%'],
  ];
  document.getElementById('stats-basic').innerHTML = basic.map(([n,v])=>`
    <div class="sr"><span class="sn">${n}</span><span class="sv ${v==0||v==='0'||v==='0.00%'?'zero':''}">${fmtVal(v)}</span></div>`).join('');

  // Render advanced stats
  const adv = [
    ['Résistance crit.',t.crit_res.toFixed(2)+'%'],
    ['Défense crit.',   t.crit_def.toFixed(2)+'%'],
    ['Perforation',     t.perfo],
    ['Persévérance',    t.persev],
    ['Puissance soin',  t.heal_pwr],
    // Enchantements non-stats
    ...state.enchants[0].filter(e=>e&&e.key&&e.val).filter(e=>!['atk_pct','def_pct','hp_pct','crit_rate','crit_dmg','crit_res','crit_def'].includes(e.key))
      .map(e=>{const p=ENCH_POOL.find(x=>x.key===e.key);return [p?p.label:e.key, e.val+(p?p.unit:'')];}),
  ];
  document.getElementById('stats-advanced').innerHTML = adv.map(([n,v])=>`
    <div class="sr"><span class="sn">${n}</span><span class="sv ${!v||v==0||v==='0.00%'?'zero':''}">${fmtVal(v)}</span></div>`).join('');

  // Sets
  const setsHtml = Object.entries(setCount).filter(([,c])=>c>=2)
    .map(([n,c])=>`<span class="set-tag">${n} (${c} pcs)</span>`).join('');
  document.getElementById('sets-display').innerHTML = setsHtml
    ? `<div style="font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.5);margin-bottom:6px">Sets actifs</div>${setsHtml}`
    : '<div style="font-size:.7rem;color:rgba(153,147,170,.35)">Aucun set actif</div>';
}

// ── TOGGLE ADVANCED ──────────────────────────────────────────────────────────
function toggleAdvanced() {
  state.advancedStats = !state.advancedStats;
  document.getElementById('stats-advanced').style.display = state.advancedStats ? 'flex' : 'none';
  document.getElementById('btn-advanced').textContent = state.advancedStats ? '- Avancées' : '+ Avancées';
}

// ── SAVE / SHARE ──────────────────────────────────────────────────────────────
async function saveBuild() {
  const name = document.getElementById('build-name').value.trim()||'Build';
  const bd = buildExport();
  try {
    const pseudo = bd.char || 'anonyme';
    await fetch(`${WORKER}/build`,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({pseudo,name,build_data:btoa(JSON.stringify(bd))})});
    alert('✅ Build sauvegardé !');
  } catch(e) { shareBuild(); }
}
function shareBuild() {
  const url = `${location.origin}${location.pathname}?build=${btoa(JSON.stringify(buildExport()))}`;
  navigator.clipboard.writeText(url).then(()=>alert('🔗 Lien copié !')).catch(()=>prompt('Lien de partage :',url));
}
function buildExport() {
  return {
    v:2, char:state.char?.slug, mode:state.mode,
    name:document.getElementById('build-name').value.trim(),
    gear:Object.fromEntries(Object.entries(state.gear).map(([s,i])=>[s,i?.id])),
    weapons:state.weapons.map(w=>w?.id),
    weaponTypes:state.weaponTypes, echelons:state.echelons,
    masteries:state.masteries, enchants:state.enchants,
  };
}
function clearBuild() {
  state.gear={}; state.weapons=[null,null,null]; state.echelons=[1,1,1];
  state.weaponTypes=[null,null,null]; state.masteries={}; state.enchants=[[null,null,null,null],[null,null,null,null],[null,null,null,null]];
  ['Top','Bottom','Belt','Shoes','Necklace','Earring','Ring','Costume'].forEach(s=>{
    for(const sfx of ['','-c']){
      const el=document.getElementById(`slot-${s}${sfx}`);
      if(el){el.classList.remove('has-item');el.innerHTML=`<div class="bds-inner"><span class="bds-icon">${SLOT_ICONS[s]}</span><div class="bds-lbl">${SLOT_LABELS[s]}</div></div>`;}
    }
  });
  [0,1,2].forEach(i=>updateWeaponCardUI(i));
  renderMasteryPanel(); renderEnchantPanel(); recalc();
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function getAtk(w, ech) {
  const stages = w.atk_by_echelon||{};
  return stages[ech] || stages[String(ech)] || w.atk_base || 0;
}
function fmtVal(v) {
  if (typeof v==='string') return v||'—';
  if (!v && v!==0) return '—';
  if (v>=1000000) return (v/1000000).toFixed(2)+'M';
  if (v>=1000)    return (v/1000).toFixed(1)+'K';
  return Math.round(v)||'—';
}
function rarityLbl(r){return{Grade5:'SSR',Grade4:'SR',Grade3:'R'}[r]||r||'?'}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async ()=>{
  await loadDB();
  renderMasteryPanel();
  renderEnchantPanel();
  recalc();
  // Load shared build from URL
  const build = new URLSearchParams(location.search).get('build');
  if (build) {
    try {
      const d = JSON.parse(atob(build));
      if(d.char) { selectChar(d.char); }
      if(d.mode) setMode(d.mode);
      if(d.name) document.getElementById('build-name').value=d.name;
      if(d.masteries) Object.assign(state.masteries,d.masteries);
      if(d.echelons) state.echelons=d.echelons;
      if(d.weaponTypes) state.weaponTypes=d.weaponTypes;
      if(d.enchants) state.enchants=d.enchants;
      setTimeout(()=>{
        if(d.gear) Object.entries(d.gear).forEach(([slot,id])=>{
          if(!id) return;
          const item=(DB.gear_by_slot[slot]||[]).find(i=>i.id==id);
          if(item) selectGear(slot,id);
        });
        if(d.weapons) d.weapons.forEach((id,i)=>{
          if(!id) return;
          const w=Object.values(DB.weapons_by_type).flat().find(x=>x.id==id);
          if(w){state.weapons[i]=w;updateWeaponCardUI(i);}
        });
        renderMasteryPanel(); renderEnchantPanel(); recalc();
      }, 800);
    } catch(e){console.warn('Shared build load error',e);}
  }
  // Close char dropdown on outside click
  document.addEventListener('click',e=>{
    if(!document.getElementById('char-picker').contains(e.target))
      document.getElementById('char-dropdown').style.display='none';
  });
});
</script>
