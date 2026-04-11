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

function potentialBar(n) {
  const val = Math.min(10, Math.max(0, Number(n)||0));
  return '█'.repeat(val) + '░'.repeat(10-val) + ` ${val}/10`;
}

async function openMemberModal(member) {
  const modal   = document.getElementById('member-modal');
  const content = document.getElementById('modal-content');
  content.innerHTML = '<div class="loading-state">Chargement</div>';
  modal.style.display = 'flex';

  const persos   = await loadPersos();
  const myPersos = persos.filter(p => p.discord_id === member.discord_id);

  content.innerHTML = `
    <div class="modal-header">
      ${member.avatar_url
        ? `<img class="modal-avatar" src="${member.avatar_url}" alt="" onerror="this.className='modal-avatar-placeholder'">`
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
    ${myPersos.length ? `
      <div class="modal-persos" style="margin-bottom:20px">
        <h3>Personnages (${myPersos.length})</h3>
        ${myPersos.map(p => `
          <div class="modal-perso-row">
            <span class="modal-perso-name">${p.personnage}</span>
            <span class="modal-perso-bar">${potentialBar(p.potentiel)}</span>
          </div>`).join('')}
      </div>` : ''}
    ${member.team_photo ? `
      <div>
        <div class="modal-stat-label" style="margin-bottom:8px">Team</div>
        <img class="modal-photo" src="${member.team_photo}" alt="" onerror="this.style.display='none'">
      </div>` : ''}
  `;
}

function closeModal(event) {
  if (event.target.id === 'member-modal') {
    document.getElementById('member-modal').style.display = 'none';
  }
}
</script>
