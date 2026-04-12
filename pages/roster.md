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

async function openMemberModal(member) {
  const modal   = document.getElementById('member-modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = '<div class="loading-state">Chargement…</div>';
  modal.style.display = 'flex';

  const persos   = await loadPersos();
  const myPersos = persos.filter(p => p.discord_id === member.discord_id);

  const WORKER_URL = 'https://purgatoire-bot.originsguild.workers.dev';
  const avatarUrl = member.discord_id ? `${WORKER_URL}/avatar/${member.discord_id}` : '';
  const showRadar = myPersos.length >= 2;
  const showList  = myPersos.length >= 1;

  content.innerHTML = `
    <div class="modal-header">
      ${avatarUrl
        ? `<img class="modal-avatar" src="${avatarUrl}" alt="" onerror="this.className='modal-avatar-placeholder'">`
        : `<div class="modal-avatar-placeholder"></div>`}
      <div>
        <div class="modal-name">${member.pseudo||'—'}</div>
        <div style="color:var(--text-secondary);font-size:.85rem">${member.grade||'—'}</div>
      </div>
    </div>
    <div class="modal-stats">
      <div class="modal-stat"><div class="modal-stat-label">Combat Class</div><div class="modal-stat-value">${member.cc_format||'—'}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Statut</div><div class="modal-stat-value" style="font-size:1rem;color:var(--text-primary)">${member.statut||'—'}</div></div>
      <div class="modal-stat"><div class="modal-stat-label">Perso principal</div><div class="modal-stat-value" style="font-size:1rem;color:var(--text-primary)">${member.main_char||'—'}</div></div>
    </div>
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
            <span class="modal-perso-name">${p.personnage}</span>
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

  if (showRadar) {
    requestAnimationFrame(() => drawRadarChart('radar-canvas', myPersos));
  }
}

function closeModal(event) {
  if (event.target.id === 'member-modal') {
    document.getElementById('member-modal').style.display = 'none';
  }
}
</script>
