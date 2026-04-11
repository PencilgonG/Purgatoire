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
    const WORKER = 'https://purgatoire-bot.originsguild.workers.dev';

    function renderRows(data) {
      tbody.innerHTML = data.map((r,i) => {
        const statut  = String(r.statut||'').toLowerCase();
        const pillCls = statut === 'absent' ? 'badge-red' : statut === 'actif' ? 'badge-green' : '';
        const avatarSrc = r.discord_id ? `${WORKER}/avatar/${r.discord_id}` : '';
        const avatar  = `<img src="${avatarSrc}" alt="" style="width:28px;height:28px;border-radius:99px;vertical-align:middle;margin-right:8px;border:1px solid var(--border)" onerror="this.style.display='none'">`;
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
