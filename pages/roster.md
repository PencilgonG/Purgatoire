---
layout: default
title: Roster
permalink: /pages/roster/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Roster</span>
    <h1>Classement Combat Class</h1>
    <p>Clique sur un membre pour voir sa fiche complète.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <div id="roster-podium" class="podium-grid"></div>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <div id="roster-filters" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"></div>
    <div class="table-shell table-shell-roster">
      <table class="data-table roster-table" id="roster-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Pseudo</th>
            <th>CC</th>
            <th>Perso principal</th>
            <th>Grade</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</section>

<!-- Modal fiche membre -->
<div id="member-modal" class="modal-overlay" style="display:none" onclick="closeModal(event)">
  <div class="modal-box">
    <button class="modal-close" onclick="document.getElementById('member-modal').style.display='none'">✕</button>
    <div id="modal-content"></div>
  </div>
</div>

<style>
.filter-btn {
  padding: 5px 14px;
  border-radius: 99px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: .18s;
}
.filter-btn:hover { border-color: var(--border-gold); color: var(--text-primary); }
.filter-btn.active { background: var(--gold-dim); border-color: var(--border-gold); color: var(--gold-bright); }

.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,.75); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.modal-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-gold);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 560px; width: 100%;
  position: relative;
  max-height: 85vh; overflow-y: auto;
}
.modal-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: var(--text-muted);
  font-size: 1.1rem; cursor: pointer;
}
.modal-close:hover { color: var(--text-primary); }
.modal-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.modal-avatar { width: 64px; height: 64px; border-radius: 99px; border: 2px solid var(--border-gold); flex-shrink: 0; }
.modal-avatar-placeholder { width: 64px; height: 64px; border-radius: 99px; background: var(--bg-elevated); border: 2px solid var(--border); flex-shrink: 0; }
.modal-name { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; color: #f0ece0; }
.modal-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.modal-stat { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 16px; }
.modal-stat-label { font-size: .7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
.modal-stat-value { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--gold-bright); }
.modal-persos h3 { font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
.modal-perso-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
.modal-perso-row:last-child { border-bottom: none; }
.modal-perso-name { font-weight: 600; font-size: .9rem; }
.modal-perso-bar { font-size: .8rem; color: var(--gold-bright); font-family: monospace; }
.modal-photo { width: 100%; border-radius: var(--radius); margin-top: 16px; }
.roster-row-clickable { cursor: pointer; }
.roster-row-clickable:hover td { background: rgba(201,151,62,.06) !important; }
</style>

<script>
const SHEET_ID_ROSTER = "1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM";

async function loadPersos() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID_ROSTER}/gviz/tq?tqx=out:csv&sheet=Persos`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    const rows = text.split('\n').filter(r => r.trim());
    if (!rows.length) return [];
    const headers = rows[0].split(',').map(h => h.replace(/"/g,'').trim());
    return rows.slice(1).map(row => {
      const cells = row.match(/(".*?"|[^,]+)/g) || [];
      return Object.fromEntries(headers.map((h,i) => [h, (cells[i]||'').replace(/"/g,'').trim()]));
    });
  } catch { return []; }
}

function drawRadarChart(canvasId, persos) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 36;
  const N = persos.length;
  if (N < 2) {
    // Single perso: draw a simple bar instead
    ctx.clearRect(0, 0, W, H);
    return;
  }

  const gold   = '#c9973e';
  const goldDim = 'rgba(201,151,62,0.15)';
  const gridCol = 'rgba(255,255,255,0.08)';
  const textCol = '#a09070';
  const levels = 5;

  ctx.clearRect(0, 0, W, H);

  // Grid rings
  for (let l = 1; l <= levels; l++) {
    const r = (R * l) / levels;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = gridCol;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axes
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
    ctx.strokeStyle = gridCol;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  persos.forEach((p, i) => {
    const val = Math.min(10, Math.max(0, Number(p.potentiel) || 0));
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = (val / 10) * R;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = goldDim;
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots
  persos.forEach((p, i) => {
    const val = Math.min(10, Math.max(0, Number(p.potentiel) || 0));
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const r = (val / 10) * R;
    ctx.beginPath();
    ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 4, 0, Math.PI * 2);
    ctx.fillStyle = gold;
    ctx.fill();
  });

  // Labels
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  persos.forEach((p, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const labelR = R + 22;
    const lx = cx + labelR * Math.cos(a);
    const ly = cy + labelR * Math.sin(a);
    ctx.fillStyle = textCol;
    // Truncate long names
    const name = (p.personnage || '').length > 10 ? p.personnage.slice(0, 9) + '…' : p.personnage;
    ctx.fillText(name, lx, ly);
  });
}

async function loadCCHistory() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID_ROSTER}/gviz/tq?tqx=out:csv&sheet=CC_Historique`;
  try {
    const res  = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    const rows = text.split('\n').filter(r => r.trim());
    if (!rows.length) return [];
    const headers = rows[0].split(',').map(h => h.replace(/"/g,'').trim());
    return rows.slice(1).map(row => {
      const cells = row.match(/(".*?"|[^,]+)/g) || [];
      return Object.fromEntries(headers.map((h,i) => [h, (cells[i]||'').replace(/"/g,'').trim()]));
    });
  } catch { return []; }
}

function formatCCShort(v) {
  const n = Number(String(v).replace(/[^\d.]/g,''));
  if (!n) return '—';
  if (n >= 1_000_000) return (n/1_000_000).toFixed(2)+'M';
  if (n >= 1_000)     return (n/1_000).toFixed(1)+'K';
  return String(n);
}

function drawLineChart(canvasId, history) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || history.length < 2) return;
  const ctx  = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PAD = { top: 16, right: 16, bottom: 28, left: 48 };
  const iW  = W - PAD.left - PAD.right;
  const iH  = H - PAD.top  - PAD.bottom;

  const gold     = '#c9973e';
  const goldDim  = 'rgba(201,151,62,0.12)';
  const gridCol  = 'rgba(255,255,255,0.06)';
  const textCol  = '#6b5a3e';
  const labelCol = '#a09070';

  const vals   = history.map(h => Number(h.cc) || 0);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range  = maxVal - minVal || 1;

  const toX = i => PAD.left + (i / (history.length - 1)) * iW;
  const toY = v => PAD.top  + iH - ((v - minVal) / range) * iH;

  ctx.clearRect(0, 0, W, H);

  // Grid lines (4 horizontal)
  for (let l = 0; l <= 4; l++) {
    const y = PAD.top + (l / 4) * iH;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(W - PAD.right, y);
    ctx.strokeStyle = gridCol;
    ctx.lineWidth = 1;
    ctx.stroke();
    // Y label
    const val = maxVal - (l / 4) * range;
    ctx.font = '9px system-ui, sans-serif';
    ctx.fillStyle = labelCol;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(formatCCShort(val), PAD.left - 6, y);
  }

  // Area fill under line
  ctx.beginPath();
  history.forEach((h, i) => {
    const x = toX(i), y = toY(Number(h.cc)||0);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(toX(history.length - 1), PAD.top + iH);
  ctx.lineTo(toX(0), PAD.top + iH);
  ctx.closePath();
  ctx.fillStyle = goldDim;
  ctx.fill();

  // Line
  ctx.beginPath();
  history.forEach((h, i) => {
    const x = toX(i), y = toY(Number(h.cc)||0);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Dots + X labels (semaine ou date)
  history.forEach((h, i) => {
    const x = toX(i), y = toY(Number(h.cc)||0);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = gold;
    ctx.fill();

    // Label only for first, last, and every ~3rd point
    if (i === 0 || i === history.length - 1 || i % Math.ceil(history.length / 5) === 0) {
      const label = h.semaine || (h.date ? h.date.slice(5) : ''); // "W12" ou "04-11"
      ctx.font = '8px system-ui, sans-serif';
      ctx.fillStyle = labelCol;
      ctx.textAlign = i === 0 ? 'left' : i === history.length - 1 ? 'right' : 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x, PAD.top + iH + 6);
    }
  });
}

async function openMemberModal(member) {
  const modal   = document.getElementById('member-modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = '<div class="loading-state">Chargement…</div>';
  modal.style.display = 'flex';

  // Chargement parallèle
  const [persos, allHistory] = await Promise.all([loadPersos(), loadCCHistory()]);
  const myPersos  = persos.filter(p => p.discord_id === member.discord_id);
  const myHistory = allHistory
    .filter(h => h.discord_id === member.discord_id)
    .sort((a,b) => String(a.date||a.semaine||'').localeCompare(String(b.date||b.semaine||'')));

  const WORKER_URL = 'https://purgatoire-bot.originsguild.workers.dev';
  const avatarUrl = member.discord_id ? `${WORKER_URL}/avatar/${member.discord_id}` : '';
  // Élément du perso principal
  const _elem  = member._element || await (typeof getCharElement === 'function' ? getCharElement(member.main_char) : Promise.resolve('Default'));
  const _elemM = (typeof ELEM_META !== 'undefined' ? ELEM_META[_elem] : null) || { color:'#888', label:'', icon:'' };
  const showRadar   = myPersos.length >= 2;
  const showList    = myPersos.length >= 1;
  const showHistory = myHistory.length >= 2;

  // Calcul progression
  let progHtml = '';
  if (showHistory) {
    const first = Number(myHistory[0].cc) || 0;
    const last  = Number(myHistory[myHistory.length - 1].cc) || 0;
    const diff  = last - first;
    const sign  = diff >= 0 ? '+' : '';
    const col   = diff >= 0 ? '#4ade80' : '#f87171';
    progHtml = `<span style="font-size:.8rem;color:${col};margin-left:8px">${sign}${formatCCShort(diff)}</span>`;
  }

  content.innerHTML = `
    <div class="modal-header">
      ${avatarUrl
        ? `<img class="modal-avatar" src="${avatarUrl}" alt="" onerror="this.className='modal-avatar-placeholder'">`
        : `<div class="modal-avatar-placeholder"></div>`}
      <div>
        <div class="modal-name">${member.pseudo||'—'}</div>
        <div style="color:var(--text-secondary);font-size:.85rem;display:flex;align-items:center;gap:6px">
          ${member.grade||'—'}
          ${_elem && _elem !== 'Default' ? `<span style="display:inline-flex;align-items:center;gap:3px;font-size:.68rem;font-weight:700;color:${_elemM.color};background:${_elemM.color}18;border:1px solid ${_elemM.color}44;border-radius:99px;padding:1px 7px">${_elemM.icon ? `<img src="${_elemM.icon}" style="width:13px;height:13px;object-fit:contain;vertical-align:middle">` : ''} ${_elemM.label}</span>` : ''}
        </div>
      </div>
    </div>

    <div class="modal-stats">
      <div class="modal-stat"><div class="modal-stat-label">Combat Class</div><div class="modal-stat-value">${member.cc_format||'—'}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Statut</div><div class="modal-stat-value" style="font-size:1rem;color:var(--text-primary)">${member.statut||'—'}</div></div>
      <div class="modal-stat" style="${(typeof heroPortrait==='function' && heroPortrait(member.main_char,'combine')) ? 'grid-column:1/-1;display:flex;align-items:center;gap:14px;padding:12px 16px' : ''}">
        ${(typeof heroPortrait==='function' && heroPortrait(member.main_char,'combine')) ? `
          <img src="${heroPortrait(member.main_char,'combine')}" alt="${member.main_char||''}" style="width:72px;height:72px;border-radius:var(--radius);object-fit:cover;object-position:top;border:1px solid rgba(201,151,62,.3);flex-shrink:0" onerror="this.style.display='none'">
          <div><div class="modal-stat-label">Perso principal</div><div class="modal-stat-value" style="font-size:1rem;color:var(--text-primary)">${member.main_char||'—'}</div></div>
        ` : `<div class="modal-stat-label">Perso principal</div><div class="modal-stat-value" style="font-size:1rem;color:var(--text-primary)">${member.main_char||'—'}</div>`}
      </div>
    </div>

    ${showHistory ? `
      <div style="margin-bottom:20px">
        <div class="modal-stat-label" style="margin-bottom:8px;display:flex;align-items:center">
          Évolution CC ${progHtml}
        </div>
        <canvas id="cc-history-canvas" width="460" height="130"
          style="display:block;width:100%;height:auto;border-radius:var(--radius);background:var(--bg-elevated)"></canvas>
      </div>` : ''}

    ${showList ? `
      <div class="modal-persos" style="margin-bottom:${showRadar ? 0 : 20}px">
        <h3>Personnages (${myPersos.length})</h3>
        ${showRadar ? `
          <div style="display:flex;justify-content:center;margin:12px 0 4px">
            <canvas id="radar-canvas" width="260" height="260" style="display:block"></canvas>
          </div>` : ''}
        ${myPersos.map(p => {
          const val = Math.min(10, Math.max(0, Number(p.potentiel)||0));
          const pct = val * 10;
          return `
          <div class="modal-perso-row">
            <span class="modal-perso-name" style="display:flex;align-items:center;gap:7px">
              ${(typeof heroPortrait==='function' && heroPortrait(p.personnage,'hud')) ? `<img src="${heroPortrait(p.personnage,'hud')}" alt="" style="width:22px;height:22px;border-radius:50%;object-fit:cover;border:1px solid rgba(201,151,62,.25);background:rgba(0,0,0,.2)" onerror="this.style.display='none'">` : ''}
              ${p.personnage}
            </span>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:80px;height:4px;background:var(--border);border-radius:99px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:var(--gold-bright);border-radius:99px"></div>
              </div>
              <span style="font-size:.75rem;color:var(--gold-bright);font-family:monospace;min-width:28px">${val}/10</span>
            </div>
          </div>`;
        }).join('')}
      </div>` : ''}

    ${member.team_photo ? `
      <div style="margin-top:16px">
        <div class="modal-stat-label" style="margin-bottom:8px">Team</div>
        <img class="modal-photo" src="${member.team_photo}" alt="" onerror="this.style.display='none'">
      </div>` : ''}
  `;

  requestAnimationFrame(() => {
    if (showHistory) drawLineChart('cc-history-canvas', myHistory);
    if (showRadar)   drawRadarChart('radar-canvas', myPersos);
  });
}

function closeModal(event) {
  if (event.target.id === 'member-modal') {
    document.getElementById('member-modal').style.display = 'none';
  }
}
</script>
