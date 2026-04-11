const cfg = window.PURGATOIRE_CONFIG || {};
const qs  = (s, ctx) => (ctx || document).querySelector(s);
const qsa = (s, ctx) => [...(ctx || document).querySelectorAll(s)];

function esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function setHTML(sel, html) { const el = qs(sel); if (el) el.innerHTML = html; }
function setText(sel, text) { const el = qs(sel); if (el) el.textContent = text; }

function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i+1];
    if (ch === '"') { if (q && nx === '"') { cell += '"'; i++; } else q = !q; }
    else if (ch === ',' && !q) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !q) {
      if (ch === '\r' && nx === '\n') i++;
      if (cell || row.length) { row.push(cell); rows.push(row); row = []; cell = ''; }
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.some(c => c.trim())).map(r => Object.fromEntries(headers.map((h,i) => [h, (r[i]||'').trim()])));
}

async function loadCsv(url) {
  if (!url) return [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return parseCsv(await res.text());
  } catch(e) { console.warn('loadCsv failed:', url, e); return []; }
}

function formatCC(v) {
  const n = Number(String(v).replace(/[^\d.]/g,''));
  if (!n) return '—';
  if (n >= 1_000_000) return (n/1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n/1_000).toFixed(1) + 'K';
  return String(n);
}
function ccNum(v) { return Number(String(v||0).replace(/[^\d.]/g,''))||0; }
function fmtDate(s) {
  if (!s) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) { const [y,m,d] = s.split('-'); return `${d}/${m}/${y}`; }
  return s;
}
function resultBadge(r) {
  const l = String(r||'').toLowerCase();
  if (l === 'victoire') return '<span class="badge badge-green">Victoire</span>';
  if (l === 'defaite' || l === 'défaite') return '<span class="badge badge-red">Défaite</span>';
  return '<span class="badge">Nul</span>';
}
function gradePill(g) { return `<span class="status-pill">${esc(g)}</span>`; }
function tierBadge(t) { return `<span class="tier-badge tier-${esc(t)}">${esc(t)}</span>`; }

function markActiveNav() {
  const path = window.location.pathname.replace(/\/+$/,'') || '/';
  qsa('.nav a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/+$/,'') || '/';
    a.classList.toggle('active', path === href || (href !== '/' && path.startsWith(href)));
  });
}

function setLinks() {
  const dis = cfg.discordInvite || '#';
  qsa('#discord-footer-link, #discord-button').forEach(el => { if(el) el.href = dis; });
  const formBtn = qs('#form-button');
  if (formBtn) formBtn.href = cfg.googleFormUrl || '#';
  const formWrap = qs('#form-embed-wrap');
  if (formWrap && cfg.googleFormEmbedUrl) formWrap.innerHTML = `<iframe src="${esc(cfg.googleFormEmbedUrl)}" loading="lazy"></iframe>`;
  const calWrap = qs('#calendar-embed-wrap');
  if (calWrap && cfg.calendarEmbedUrl) calWrap.innerHTML = `<iframe src="${esc(cfg.calendarEmbedUrl)}" loading="lazy"></iframe>`;
}

function renderHomeStats(roster, annonces, gdg) {
  const actifs = roster.filter(r => r.discord_id);
  const ccVals = actifs.map(r => ccNum(r.cc)).filter(Boolean);
  const avg    = ccVals.length ? Math.round(ccVals.reduce((a,b)=>a+b,0)/ccVals.length) : 0;
  const lastGdg = gdg[0];
  setText('#stat-members',    actifs.length || '—');
  setText('#stat-average-cc', avg ? formatCC(avg) : '—');
  setText('#stat-annonces',   annonces.length || '—');
  setText('#stat-last-gdg',   lastGdg ? (lastGdg.resultat || lastGdg.ennemi || '—') : '—');
}

function renderHomeRoster(roster) {
  const wrap = qs('#home-roster');
  if (!wrap) return;
  const top5 = [...roster].sort((a,b) => ccNum(b.cc)-ccNum(a.cc)).slice(0,5);
  if (!top5.length) { wrap.innerHTML = '<p class="empty-state">Aucune donnée.</p>'; return; }
  wrap.innerHTML = top5.map((r,i) => `
    <article class="list-card">
      <div><span class="list-rank">#${i+1}</span><h3>${esc(r.pseudo||'Inconnu')}</h3><p>${esc(r.main_char||'—')} · ${esc(r.grade||'—')}</p></div>
      <strong style="color:var(--gold-bright);font-family:var(--font-display);font-size:1.1rem">${formatCC(r.cc)}</strong>
    </article>`).join('');
}

function renderHomeAnnonces(annonces) {
  const wrap = qs('#home-annonces');
  if (!wrap) return;
  const visible = annonces.filter(a => String(a.publie||'').toLowerCase() !== 'non')
    .sort((a,b) => String(b.date||'').localeCompare(String(a.date||''))).slice(0,3);
  if (!visible.length) { wrap.innerHTML = '<p class="empty-state">Aucune annonce.</p>'; return; }
  wrap.innerHTML = visible.map(item => `
    <article class="list-card">
      <div><span class="badge">${esc(item.categorie||'Annonce')}</span><h3>${esc(item.titre||'Sans titre')}</h3><p>${esc(item.resume||'')}</p></div>
      <span class="muted" style="white-space:nowrap;font-size:.8rem">${esc(item.date||'')}</span>
    </article>`).join('');
}

function renderRosterPage(roster) {
  const podium = qs('#roster-podium');
  const tbody  = qs('#roster-table tbody');
  if (!tbody && !podium) return;
  if (!roster.length) {
    if (podium) podium.innerHTML = '<p class="empty-state">Aucune donnée roster.</p>';
    if (tbody)  tbody.innerHTML  = '<tr><td colspan="7" class="empty-cell">Aucune donnée.</td></tr>';
    return;
  }
  const sorted = [...roster].sort((a,b) => ccNum(b.cc)-ccNum(a.cc));
  const medals = ['🥇','🥈','🥉'];
  if (podium) {
    podium.innerHTML = sorted.slice(0,3).map((r,i) => `
      <article class="podium-card podium-${i+1}">
        <span class="podium-rank">${medals[i]}</span>
        <h3>${esc(r.pseudo||'—')}</h3>
        <strong>${formatCC(r.cc)}</strong>
        <p>${esc(r.main_char||'—')}</p>
        <span class="status-pill" style="margin-top:6px;display:inline-block">${esc(r.grade||'—')}</span>
      </article>`).join('');
  }
  if (tbody) {
    tbody.innerHTML = sorted.map((r,i) => {
      const statut = String(r.statut||'').toLowerCase();
      const pillCls = statut === 'absent' ? 'badge-red' : statut === 'actif' ? 'badge-green' : '';
      return `<tr class="roster-row-clickable" data-id="${esc(r.discord_id||'')}" data-photo="${esc(r.team_photo||'')}" data-pseudo="${esc(r.pseudo||'')}" data-cc="${esc(r.cc_format||formatCC(r.cc))}" data-main="${esc(r.main_char||'')}" data-grade="${esc(r.grade||'')}" data-statut="${esc(r.statut||'')}">
        <td>${i < 3 ? medals[i] : (i+1)}</td>
        <td style="font-weight:600">${esc(r.pseudo||'—')}</td>
        <td class="col-cc">${formatCC(r.cc)}</td>
        <td style="color:var(--text-secondary)">${esc(r.main_char||'—')}</td>
        <td>${gradePill(r.grade||'—')}</td>
        <td><span class="badge ${pillCls}">${esc(r.statut||'—')}</span></td>
        <td style="font-size:.8rem;color:var(--gold);cursor:pointer" title="Voir la fiche">📋</td>
      </tr>`;
    }).join('');

    // Attache les clics directement
    tbody.querySelectorAll('.roster-row-clickable').forEach(tr => {
      tr.addEventListener('click', () => {
        if (typeof openMemberModal === 'function') {
          openMemberModal({
            discord_id: tr.dataset.id,
            pseudo:     tr.dataset.pseudo,
            cc_format:  tr.dataset.cc,
            main_char:  tr.dataset.main,
            grade:      tr.dataset.grade,
            statut:     tr.dataset.statut,
            team_photo: tr.dataset.photo,
          });
        }
      });
    });
  }
}

function renderGDGPage(rows) {
  const wrap = qs('#gdg-list');
  if (!wrap) return;
  if (!rows.length) { wrap.innerHTML = '<p class="empty-state">Aucune guerre enregistrée.</p>'; return; }
  const v = rows.filter(r => String(r.resultat||'').toLowerCase() === 'victoire').length;
  const d = rows.filter(r => ['defaite','défaite'].includes(String(r.resultat||'').toLowerCase())).length;
  const summaryEl = qs('#gdg-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="gdg-summary-item"><span style="color:var(--green)">${v}</span><small>Victoires</small></div>
      <div class="gdg-summary-item"><span style="color:var(--red)">${d}</span><small>Défaites</small></div>
      <div class="gdg-summary-item"><span>${rows.length-v-d}</span><small>Nuls</small></div>
      <div class="gdg-summary-item"><span style="color:var(--gold-bright)">${rows.length}</span><small>Total</small></div>`;
  }
  wrap.innerHTML = [...rows].reverse().map(item => `
    <article class="card">
      <div class="card-body">
        <div class="gdg-card-header">${resultBadge(item.resultat)}<span style="color:var(--text-muted);font-size:.8rem">${esc(fmtDate(item.date))}</span></div>
        <h3 style="font-size:1.05rem;margin-bottom:4px">vs ${esc(item.ennemi||'Adversaire')}</h3>
        <div class="score-line">
          <strong style="color:var(--gold-bright)">${esc(item.notre_score||'—')}</strong>
          <span>vs</span>
          <strong style="color:var(--text-secondary)">${esc(item.score_ennemi||'—')}</strong>
        </div>
        ${item.notes?`<p style="font-size:.83rem;color:var(--text-muted);margin-top:8px">${esc(item.notes)}</p>`:''}
      </div>
    </article>`).join('');
}

function renderAnnoncesPage(rows) {
  const wrap = qs('#annonces-list'), featured = qs('#annonce-featured');
  if (!wrap) return;
  const visible = rows.filter(a => String(a.publie||'').toLowerCase() !== 'non')
    .sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')));
  if (!visible.length) { wrap.innerHTML = '<p class="empty-state">Aucune annonce.</p>'; if(featured) featured.innerHTML=''; return; }
  const pin  = visible.find(a => String(a.epingle||'').toLowerCase() === 'oui') || visible[0];
  const rest = visible.filter(a => a !== pin);
  if (featured) {
    featured.innerHTML = `<article class="featured-annonce">
      ${pin.image?`<img class="featured-annonce-image" src="${esc(pin.image)}" alt="">`:''}
      <div class="featured-annonce-body">
        <div class="card-topline"><span class="badge">${esc(pin.categorie||'Annonce')}</span>${String(pin.epingle||'').toLowerCase()==='oui'?'<span class="badge badge-gold">Épinglée</span>':''}</div>
        <h2 style="font-family:var(--font-display);font-size:1.6rem;margin:8px 0 4px">${esc(pin.titre||'Sans titre')}</h2>
        <p style="color:var(--text-muted);font-size:.8rem;margin-bottom:10px">${esc(pin.date||'')}</p>
        <p style="color:var(--text-secondary)">${esc(pin.resume||'')}</p>
      </div></article>`;
  }
  wrap.innerHTML = rest.map(item => `
    <article class="card annonce-card">
      ${item.image?`<img class="annonce-image" src="${esc(item.image)}" alt="">`:''}
      <div class="card-body">
        <div class="card-topline"><span class="badge">${esc(item.categorie||'Annonce')}</span></div>
        <h3>${esc(item.titre||'Sans titre')}</h3>
        <p class="muted" style="margin:4px 0 6px;font-size:.8rem">${esc(item.date||'')}</p>
        <p style="color:var(--text-secondary);font-size:.875rem">${esc(item.resume||'')}</p>
      </div>
    </article>`).join('');
}

async function renderAbsences() {
  const tbody = qs('#absences-table tbody');
  if (!tbody) return;
  const url = cfg.sheets?.absencesCsvUrl;
  if (!url) { tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">absencesCsvUrl non configurée.</td></tr>'; return; }
  tbody.innerHTML = '<tr><td colspan="4" class="loading-state">Chargement</td></tr>';
  const rows  = await loadCsv(url);
  const today = new Date().toISOString().slice(0,10);
  const active = rows.filter(r => { const fin = r.fin||r.end||''; return !fin || fin >= today; });
  if (!active.length) { tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">Aucune absence en cours.</td></tr>'; return; }
  tbody.innerHTML = active.map(r => {
    const fin = r.fin||r.end||'', now = r.debut||r.start||'', curr = now && now <= today;
    return `<tr>
      <td style="font-weight:600">${esc(r.pseudo||'—')}</td>
      <td>${esc(fmtDate(now))}</td><td>${esc(fmtDate(fin))}</td>
      <td><span class="${curr?'absence-tag-active':'absence-tag-upcoming'}">${curr?'En cours':'À venir'}</span>
      ${r.raison?`<span style="color:var(--text-secondary);font-size:.83rem;margin-left:8px">${esc(r.raison)}</span>`:''}</td>
    </tr>`;
  }).join('');
}

async function renderTierlist() {
  const wrap = qs('#tierlist-wrap');
  if (!wrap) return;
  const url = cfg.sheets?.tierlistCsvUrl;
  if (!url) { wrap.innerHTML = '<p class="empty-state">tierlistCsvUrl non configurée.</p>'; return; }
  wrap.innerHTML = '<div class="loading-state">Chargement</div>';
  const rows = await loadCsv(url);
  if (!rows.length) { wrap.innerHTML = '<p class="empty-state">Aucun vote. Utilise <code>/tierlist voter</code> sur Discord.</p>'; return; }
  const groups = {};
  rows.forEach(r => { const t = String(r.tier_moyen||r.tier||'B').toUpperCase(); if(!groups[t]) groups[t]=[]; groups[t].push(r.personnage||r.name||'—'); });
  wrap.innerHTML = ['S','A','B','C','D'].filter(t => groups[t]?.length).map(t => `
    <div class="tier-section">
      <div class="tier-label">${tierBadge(t)}<span style="font-size:.75rem;color:var(--text-muted);font-weight:600;letter-spacing:.06em;text-transform:uppercase">${groups[t].length} personnage${groups[t].length>1?'s':''}</span></div>
      <div class="tier-chars">${groups[t].map(p=>`<span class="tier-char-tag">${esc(p)}</span>`).join('')}</div>
    </div>`).join('');
}

function renderCalendrier() {
  const wrap = qs('#reset-cards');
  if (!wrap) return;
  const now = new Date();
  const nextD = new Date(now);
  if (now.getUTCHours() >= 7) nextD.setUTCDate(nextD.getUTCDate()+1);
  nextD.setUTCHours(7,0,0,0);
  const day = now.getUTCDay(), toMon = day===1&&now.getUTCHours()<7?0:((8-day)%7||7);
  const nextW = new Date(now); nextW.setUTCDate(now.getUTCDate()+toMon); nextW.setUTCHours(7,0,0,0);
  const nextM = new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1,7));
  const paris = 7+(isDST(now)?2:1);
  const cards = [
    { icon:'🌅', label:'Reset Quotidien', target:nextD, id:'cd-daily', items:['Missions journalières','Boss de terrain','Tentatives PVP Arena','Boutique quotidienne','Énergie / Stamina'] },
    { icon:'📆', label:'Reset Hebdomadaire — Lundi', target:nextW, id:'cd-weekly', items:['⚔️ GDG — Guerre de Guilde','Donjon de guilde','Classements PVP','Boutique hebdomadaire','Boss de raid'] },
    { icon:'📅', label:'Reset Mensuel — 1er du mois', target:nextM, id:'cd-monthly', items:['Saison PVP','Classement de guilde','Boutique mensuelle'] },
  ];
  wrap.innerHTML = `
    <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:20px">Heure officielle : <strong style="color:var(--text-secondary)">07:00 UTC</strong> = <strong style="color:var(--gold-bright)">${paris}h00 Paris</strong></p>
    <div class="reset-grid">${cards.map(c=>`
      <div class="reset-card">
        <span class="reset-card-icon">${c.icon}</span>
        <div class="reset-card-label">${c.label}</div>
        <div class="countdown" id="${c.id}" data-target="${c.target.getTime()}">—</div>
        <ul class="reset-content-list">${c.items.map(i=>`<li>${i}</li>`).join('')}</ul>
      </div>`).join('')}</div>`;
  function tick() {
    qsa('[data-target]').forEach(el => {
      const diff = parseInt(el.dataset.target)-Date.now();
      if (diff<=0){el.textContent='En cours';return;}
      const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      el.textContent=d>0?`${d}j ${h}h ${m}min`:h>0?`${h}h ${m}min ${s}s`:`${m}min ${s}s`;
    });
  }
  setInterval(tick,1000); tick();
}

function isDST(d) {
  const j=new Date(d.getFullYear(),0,1).getTimezoneOffset(),t=new Date(d.getFullYear(),6,1).getTimezoneOffset();
  return d.getTimezoneOffset()<Math.max(j,t);
}

async function boot() {
  markActiveNav(); setLinks(); renderCalendrier();
  const [roster,gdg,annonces] = await Promise.all([
    loadCsv(cfg.sheets?.rosterCsvUrl),
    loadCsv(cfg.sheets?.gdgCsvUrl),
    loadCsv(cfg.sheets?.annoncesCsvUrl),
  ]);
  renderHomeStats(roster,annonces,gdg);
  renderHomeRoster(roster);
  renderHomeAnnonces(annonces);
  renderRosterPage(roster);
  renderGDGPage(gdg);
  renderAnnoncesPage(annonces);
  await renderAbsences();
  await renderTierlist();
}

document.addEventListener('DOMContentLoaded', boot);
