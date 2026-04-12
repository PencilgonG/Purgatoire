const cfg = window.PURGATOIRE_CONFIG || {};
const qs  = (s, ctx) => (ctx || document).querySelector(s);
const qsa = (s, ctx) => [...(ctx || document).querySelectorAll(s)];

const WORKER = 'https://purgatoire-bot.originsguild.workers.dev';

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
  const headers = rows[0].map(h => h.trim().replace(/\s+/g, "_").toLowerCase());
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
  const l = String(r||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (l === 'victoire') return '<span class="badge badge-green">Victoire</span>';
  if (l === 'defaite') return '<span class="badge badge-red">Défaite</span>';
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

// HOME PAGE

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

// ROSTER PAGE

function renderRosterFilters(roster, onFilter) {
  const wrap = qs('#roster-filters');
  if (!wrap) return;
  const grades = ['Tous', ...new Set(roster.map(r => r.grade).filter(Boolean))];
  wrap.innerHTML = grades.map(g =>
    `<button class="filter-btn${g==='Tous'?' active':''}" data-grade="${esc(g)}">${esc(g)}</button>`
  ).join('');
  wrap.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onFilter(btn.dataset.grade);
    });
  });
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
    function renderRows(data) {
      tbody.innerHTML = data.map((r,i) => {
        const statut  = String(r.statut||'').toLowerCase();
        const pillCls = statut === 'absent' ? 'badge-red' : statut === 'actif' ? 'badge-green' : '';
        const avatarSrc = r.discord_id ? `${WORKER}/avatar/${r.discord_id}` : '';
        const avatar  = avatarSrc
          ? `<img src="${avatarSrc}" alt="" style="width:28px;height:28px;border-radius:99px;vertical-align:middle;margin-right:8px;border:1px solid var(--border)" onerror="this.style.display='none'">`
          : '';
        return `<tr class="roster-row-clickable"
          data-id="${esc(r.discord_id||'')}"
          data-photo="${esc(r.team_photo||'')}"
          data-pseudo="${esc(r.pseudo||'')}"
          data-cc="${esc(r.cc_format||formatCC(r.cc))}"
          data-main="${esc(r.main_char||'')}"
          data-grade="${esc(r.grade||'')}"
          data-statut="${esc(r.statut||'')}">
          <td>${i < 3 ? medals[i] : (i+1)}</td>
          <td style="font-weight:600">${avatar}${esc(r.pseudo||'—')}</td>
          <td class="col-cc">${formatCC(r.cc)}</td>
          <td style="color:var(--text-secondary)">${esc(r.main_char||'—')}</td>
          <td>${gradePill(r.grade||'—')}</td>
          <td><span class="badge ${pillCls}">${esc(r.statut||'—')}</span></td>
          <td style="font-size:.9rem;text-align:center" title="Voir la fiche">📋</td>
        </tr>`;
      }).join('');

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

    renderRosterFilters(sorted, (grade) => {
      const filtered = grade === 'Tous' ? sorted : sorted.filter(r => r.grade === grade);
      renderRows(filtered);
    });

    renderRows(sorted);
  }
}

// GDG PAGE

function renderGdgPage(gdg) {
  const summary = qs('#gdg-summary');
  const list    = qs('#gdg-list');
  if (!summary && !list) return;
  if (!gdg.length) {
    if (summary) summary.innerHTML = '<p class="empty-state">Aucun GDG enregistré.</p>';
    if (list)    list.innerHTML    = '';
    return;
  }
  if (summary) {
    const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const v = gdg.filter(g => norm(g.resultat) === 'victoire').length;
    const d = gdg.filter(g => norm(g.resultat) === 'defaite').length;
    const n = gdg.length - v - d;
    summary.innerHTML = `
      <div class="gdg-summary-grid">
        <div class="gdg-stat"><span class="gdg-stat-num" style="color:var(--gold-bright)">${gdg.length}</span><span>Total</span></div>
        <div class="gdg-stat"><span class="gdg-stat-num" style="color:#4ade80">${v}</span><span>Victoires</span></div>
        <div class="gdg-stat"><span class="gdg-stat-num" style="color:#f87171">${d}</span><span>Défaites</span></div>
        <div class="gdg-stat"><span class="gdg-stat-num" style="color:var(--text-muted)">${n}</span><span>Nuls</span></div>
      </div>`;
  }
  if (list) {
    list.innerHTML = gdg.map(g => `
      <article class="card">
        <div class="card-head">
          <div>
            <span class="eyebrow">${esc(fmtDate(g.date))}</span>
            <h3 class="card-title">vs ${esc(g.ennemi||'Inconnu')}</h3>
          </div>
          ${resultBadge(g.resultat)}
        </div>
        <div class="card-body">
          ${g.notre_score || g.score_ennemi ? `
            <div class="gdg-score">
              <span>${esc(g.notre_score||'—')}</span>
              <span class="muted" style="font-size:.8rem">–</span>
              <span>${esc(g.score_ennemi||'—')}</span>
            </div>` : ''}
          ${g.nom ? `<p class="muted" style="font-size:.8rem;margin-top:6px">${esc(g.nom)}</p>` : ''}
        </div>
      </article>`).join('');
  }
}

// ANNONCES PAGE

function renderAnnoncesPage(annonces) {
  const featured = qs('#annonce-featured');
  const list     = qs('#annonces-list');
  if (!featured && !list) return;
  const visible = annonces
    .filter(a => String(a.publie||'').toLowerCase() !== 'non')
    .sort((a,b) => String(b.date||'').localeCompare(String(a.date||'')));
  if (!visible.length) {
    if (featured) featured.innerHTML = '';
    if (list)     list.innerHTML     = '<p class="empty-state">Aucune annonce publiée.</p>';
    return;
  }
  const pinned = visible.find(a => String(a.epingle||'').toLowerCase() === 'oui') || visible[0];
  const rest   = visible.filter(a => a !== pinned);
  if (featured) {
    featured.innerHTML = `
      <article class="featured-card">
        ${pinned.image ? `<img class="featured-img" src="${esc(pinned.image)}" alt="" onerror="this.style.display='none'">` : ''}
        <div class="featured-body">
          <div><span class="badge">${esc(pinned.categorie||'Annonce')}</span><span class="muted" style="font-size:.8rem;margin-left:8px">${esc(pinned.date||'')}</span></div>
          <h2 class="featured-title">${esc(pinned.titre||'Sans titre')}</h2>
          <p>${esc(pinned.resume||'')}</p>
          ${pinned.lien_notion ? `<a class="button button-ghost" href="${esc(pinned.lien_notion)}" target="_blank" rel="noopener">Voir sur Notion ↗</a>` : ''}
          ${pinned.lien_fichier ? `<a class="button button-ghost" href="${esc(pinned.lien_fichier)}" target="_blank" rel="noopener">Télécharger ↗</a>` : ''}
        </div>
      </article>`;
  }
  if (list) {
    list.innerHTML = rest.map(item => `
      <article class="card">
        ${item.image ? `<img class="card-img" src="${esc(item.image)}" alt="" onerror="this.style.display='none'">` : ''}
        <div class="card-head">
          <span class="badge">${esc(item.categorie||'Annonce')}</span>
          <span class="muted" style="font-size:.8rem">${esc(item.date||'')}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(item.titre||'Sans titre')}</h3>
          <p>${esc(item.resume||'')}</p>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            ${item.lien_notion  ? `<a class="text-link" href="${esc(item.lien_notion)}" target="_blank" rel="noopener">Notion ↗</a>` : ''}
            ${item.lien_fichier ? `<a class="text-link" href="${esc(item.lien_fichier)}" target="_blank" rel="noopener">Fichier ↗</a>` : ''}
          </div>
        </div>
      </article>`).join('');
  }
}

// ABSENCES PAGE

function renderAbsencesPage(absences) {
  const tbody = qs('#absences-table tbody');
  if (!tbody) return;
  const today = new Date().toISOString().slice(0,10);
  const active = absences
    .filter(a => String(a.active||'').toLowerCase() !== 'non')
    .filter(a => !a.fin || a.fin >= today)
    .sort((a,b) => String(a.debut||'').localeCompare(String(b.debut||'')));
  if (!active.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">Aucune absence en cours ou à venir.</td></tr>';
    return;
  }
  tbody.innerHTML = active.map(a => {
    const isOngoing = (!a.debut || a.debut <= today) && (!a.fin || a.fin >= today);
    return `<tr>
      <td style="font-weight:600">${esc(a.pseudo||'—')}</td>
      <td>${fmtDate(a.debut)}</td>
      <td>${a.fin ? fmtDate(a.fin) : '<span class="muted">Indéterminée</span>'}</td>
      <td>${esc(a.raison||'—')}${isOngoing ? ' <span class="badge badge-red" style="margin-left:6px">En cours</span>' : ''}</td>
    </tr>`;
  }).join('');
}

// TIERLIST PAGE

function renderTierlistPage(tierlist) {
  const wrap = qs('#tierlist-wrap');
  if (!wrap) return;
  if (!tierlist.length) {
    wrap.innerHTML = '<p class="empty-state">Aucune donnée tierlist.</p>';
    return;
  }
  const TIERS  = ['S','A','B','C','D'];
  const COLORS = { S:'#f0c060', A:'#80c280', B:'#6090d0', C:'#b070c0', D:'#a0a0a0' };
  const byTier = {};
  TIERS.forEach(t => byTier[t] = []);
  tierlist.forEach(p => {
    const t = String(p.tier_moyen||'D').toUpperCase();
    (byTier[TIERS.includes(t) ? t : 'D']).push(p);
  });
  TIERS.forEach(t => byTier[t].sort((a,b) => Number(b.total||0)-Number(a.total||0)));
  const maxVotes = Math.max(1, ...tierlist.map(x => Number(x.total||0)));

  wrap.innerHTML = TIERS.map(t => {
    const chars = byTier[t];
    if (!chars.length) return '';
    return `
      <div style="margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          ${tierBadge(t)}
          <span class="muted" style="font-size:.8rem">${chars.length} personnage${chars.length>1?'s':''}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${chars.map(p => {
            const pct = Math.round(Number(p.total||0)/maxVotes*100);
            return `
            <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;min-width:130px">
              <div style="font-weight:600;font-size:.85rem">${esc(p.personnage||'—')}</div>
              <div style="font-size:.75rem;color:${COLORS[t]||'var(--text-muted)'};margin-top:4px">${p.total||0} vote${Number(p.total||0)>1?'s':''}</div>
              <div style="margin-top:6px;height:4px;background:var(--border);border-radius:99px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${COLORS[t]||'var(--gold-bright)'};border-radius:99px;transition:.3s"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }).join('');
}

// INIT

document.addEventListener('DOMContentLoaded', async () => {
  markActiveNav();
  setLinks();

  const S = cfg.sheets || {};

  const isHome     = !!qs('#home-roster');
  const isRoster   = !!qs('#roster-table');
  const isGdg      = !!qs('#gdg-list');
  const isAnnonces = !!qs('#annonces-list') || !!qs('#annonce-featured');
  const isAbsences = !!qs('#absences-table');
  const isTierlist = !!qs('#tierlist-wrap');

  if (isHome) {
    const [roster, annonces, gdg] = await Promise.all([
      loadCsv(S.rosterCsvUrl),
      loadCsv(S.annoncesCsvUrl),
      loadCsv(S.gdgCsvUrl),
    ]);
    renderHomeStats(roster, annonces, gdg);
    renderHomeRoster(roster);
    renderHomeAnnonces(annonces);
  }

  if (isRoster) {
    const roster = await loadCsv(S.rosterCsvUrl);
    renderRosterPage(roster);
  }

  if (isGdg) {
    const gdg = await loadCsv(S.gdgCsvUrl);
    renderGdgPage(gdg);
  }

  if (isAnnonces) {
    const annonces = await loadCsv(S.annoncesCsvUrl);
    renderAnnoncesPage(annonces);
  }

  if (isAbsences) {
    const absences = await loadCsv(S.absencesCsvUrl);
    renderAbsencesPage(absences);
  }

  if (isTierlist) {
    const tierlist = await loadCsv(S.tierlistCsvUrl);
    renderTierlistPage(tierlist);
  }
});
