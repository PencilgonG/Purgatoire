const cfg = window.PURGATOIRE_CONFIG || {};

function qs(sel) { return document.querySelector(sel); }

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      if (cell.length || row.length) {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }
    } else {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  if (!rows.length) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).filter(r => r.some(c => String(c).trim() !== "")).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = (r[i] || "").trim());
    return obj;
  });
}

async function loadCsv(url) {
  if (!url) return [];
  const res = await fetch(url);
  if (!res.ok) throw new Error("Impossible de charger " + url);
  return parseCsv(await res.text());
}

function formatCC(value) {
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  if (!n) return "--";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function average(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function setLinks() {
  const discordLink = cfg.discordInvite || "#";
  const formUrl = cfg.googleFormUrl || "#";

  const discordFooter = qs("#discord-footer-link");
  const discordBtn = qs("#discord-button");
  const formBtn = qs("#form-button");

  if (discordFooter) discordFooter.href = discordLink;
  if (discordBtn) discordBtn.href = discordLink;
  if (formBtn) formBtn.href = formUrl;

  const formWrap = qs("#form-embed-wrap");
  if (formWrap && cfg.googleFormEmbedUrl) {
    formWrap.innerHTML = '<iframe src="' + escapeHtml(cfg.googleFormEmbedUrl) + '" loading="lazy"></iframe>';
  }

  const calWrap = qs("#calendar-embed-wrap");
  if (calWrap && cfg.calendarEmbedUrl) {
    calWrap.innerHTML = '<iframe src="' + escapeHtml(cfg.calendarEmbedUrl) + '" loading="lazy"></iframe>';
  }
}

function renderHomeStats(roster, annonces, gdg) {
  const members = roster.length;
  const avg = average(roster.map(r => Number(String(r.cc || "").replace(/[^\d.]/g, ""))).filter(Boolean));
  const last = gdg[0];

  if (qs("#stat-members")) qs("#stat-members").textContent = members || "--";
  if (qs("#stat-average-cc")) qs("#stat-average-cc").textContent = avg ? formatCC(Math.round(avg)) : "--";
  if (qs("#stat-annonces")) qs("#stat-annonces").textContent = annonces.length || "--";
  if (qs("#stat-last-gdg")) qs("#stat-last-gdg").textContent = last ? (last.resultat || last.ennemi || "--") : "--";
}

function renderHomeRoster(roster) {
  const wrap = qs("#home-roster");
  if (!wrap) return;
  if (!roster.length) {
    wrap.innerHTML = '<p class="empty-state">Aucune donnée roster publiée.</p>';
    return;
  }

  const sorted = [...roster]
    .sort((a, b) => Number((b.cc || "0").replace(/[^\d.]/g, "")) - Number((a.cc || "0").replace(/[^\d.]/g, "")))
    .slice(0, 5);

  wrap.innerHTML = sorted.map((row, idx) => `
    <article class="list-card premium-hover">
      <div>
        <span class="list-rank">#${idx + 1}</span>
        <h3>${escapeHtml(row.pseudo || "Inconnu")}</h3>
        <p>${escapeHtml(row.main_char || "—")} · ${escapeHtml(row.grade || "—")}</p>
      </div>
      <strong>${formatCC(row.cc)}</strong>
    </article>
  `).join("");
}

function renderHomeAnnonces(annonces) {
  const wrap = qs("#home-annonces");
  if (!wrap) return;
  const visible = annonces
    .filter(a => (a.publie || "").toLowerCase() !== "non")
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 3);

  if (!visible.length) {
    wrap.innerHTML = '<p class="empty-state">Aucune annonce publiée.</p>';
    return;
  }

  wrap.innerHTML = visible.map(item => `
    <article class="list-card premium-hover">
      <div>
        <span class="badge">${escapeHtml(item.categorie || "Annonce")}</span>
        <h3>${escapeHtml(item.titre || "Sans titre")}</h3>
        <p>${escapeHtml(item.resume || "")}</p>
      </div>
      <span class="muted">${escapeHtml(item.date || "")}</span>
    </article>
  `).join("");
}

function renderRosterPage(roster) {
  const tbody = qs("#roster-table tbody");
  const podium = qs("#roster-podium");

  if (!tbody) return;

  if (!roster.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Aucune donnée roster publiée.</td></tr>';
    if (podium) podium.innerHTML = '<p class="empty-state">Aucune donnée roster publiée.</p>';
    return;
  }

  const sorted = [...roster].sort((a, b) => Number((b.cc || "0").replace(/[^\d.]/g, "")) - Number((a.cc || "0").replace(/[^\d.]/g, "")));

  if (podium) {
    const top3 = sorted.slice(0, 3);
    podium.innerHTML = top3.map((row, i) => `
      <article class="podium-card premium-hover podium-${i + 1}">
        <span class="podium-rank">#${i + 1}</span>
        <h3>${escapeHtml(row.pseudo || "—")}</h3>
        <strong>${formatCC(row.cc)}</strong>
        <p>${escapeHtml(row.main_char || "—")}</p>
        <span class="status-pill">${escapeHtml(row.grade || "—")}</span>
      </article>
    `).join("");
  }

  tbody.innerHTML = sorted.map((row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(row.pseudo || "—")}</td>
      <td>${formatCC(row.cc)}</td>
      <td>${escapeHtml(row.main_char || "—")}</td>
      <td>${escapeHtml(row.grade || "—")}</td>
      <td><span class="status-pill">${escapeHtml(row.statut || "—")}</span></td>
      <td>${escapeHtml(row.updated_at || "—")}</td>
    </tr>
  `).join("");
}

function renderGDGPage(rows) {
  const wrap = qs("#gdg-list");
  if (!wrap) return;
  if (!rows.length) {
    wrap.innerHTML = '<p class="empty-state">Aucune guerre publiée.</p>';
    return;
  }

  wrap.innerHTML = rows.map(item => `
    <article class="card premium-hover">
      <div class="card-body">
        <span class="badge">${escapeHtml(item.resultat || "GDG")}</span>
        <h3>${escapeHtml(item.ennemi || "Adversaire")}</h3>
        <p class="muted">${escapeHtml(item.date || "")}</p>
        <div class="score-line">
          <strong>${escapeHtml(item.notre_score || "--")}</strong>
          <span>vs</span>
          <strong>${escapeHtml(item.score_ennemi || "--")}</strong>
        </div>
        <p>${escapeHtml(item.notes || "")}</p>
      </div>
    </article>
  `).join("");
}

function renderAnnoncesPage(rows) {
  const wrap = qs("#annonces-list");
  const featuredWrap = qs("#annonce-featured");
  if (!wrap) return;

  const visible = rows
    .filter(a => (a.publie || "").toLowerCase() !== "non")
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  if (!visible.length) {
    wrap.innerHTML = '<p class="empty-state">Aucune annonce publiée.</p>';
    if (featuredWrap) featuredWrap.innerHTML = '';
    return;
  }

  const featured = visible.find(a => (a.epingle || "").toLowerCase() === "oui") || visible[0];
  const rest = visible.filter(a => a !== featured);

  if (featuredWrap) {
    featuredWrap.innerHTML = `
      <article class="featured-annonce premium-hover">
        ${featured.image ? `<img class="featured-annonce-image" src="${escapeHtml(featured.image)}" alt="${escapeHtml(featured.titre || "Annonce")}">` : ""}
        <div class="featured-annonce-body">
          <div class="card-topline">
            <span class="badge">${escapeHtml(featured.categorie || "Annonce")}</span>
            ${(featured.epingle || "").toLowerCase() === "oui" ? '<span class="badge badge-gold">Épinglée</span>' : ''}
          </div>
          <h2>${escapeHtml(featured.titre || "Sans titre")}</h2>
          <p class="muted">${escapeHtml(featured.date || "")}</p>
          <p>${escapeHtml(featured.resume || "")}</p>
          <div class="card-actions">
            ${featured.lien_notion ? `<a class="button button-ghost small" href="${escapeHtml(featured.lien_notion)}" target="_blank" rel="noopener">Ouvrir Notion</a>` : ""}
            ${featured.lien_fichier ? `<a class="button button-gold small" href="${escapeHtml(featured.lien_fichier)}" target="_blank" rel="noopener">Ouvrir le fichier</a>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  wrap.innerHTML = rest.map(item => `
    <article class="card annonce-card premium-hover">
      ${item.image ? `<img class="annonce-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.titre || "Annonce")}">` : ""}
      <div class="card-body">
        <div class="card-topline">
          <span class="badge">${escapeHtml(item.categorie || "Annonce")}</span>
        </div>
        <h3>${escapeHtml(item.titre || "Sans titre")}</h3>
        <p class="muted">${escapeHtml(item.date || "")}</p>
        <p>${escapeHtml(item.resume || "")}</p>
        <div class="card-actions">
          ${item.lien_notion ? `<a class="button button-ghost small" href="${escapeHtml(item.lien_notion)}" target="_blank" rel="noopener">Ouvrir Notion</a>` : ""}
          ${item.lien_fichier ? `<a class="button button-gold small" href="${escapeHtml(item.lien_fichier)}" target="_blank" rel="noopener">Ouvrir le fichier</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");
}

async function boot() {
  setLinks();

  let roster = [], gdg = [], annonces = [];
  try { roster = await loadCsv(cfg.sheets?.rosterCsvUrl); } catch (e) {}
  try { gdg = await loadCsv(cfg.sheets?.gdgCsvUrl); } catch (e) {}
  try { annonces = await loadCsv(cfg.sheets?.annoncesCsvUrl); } catch (e) {}

  renderHomeStats(roster, annonces, gdg);
  renderHomeRoster(roster);
  renderHomeAnnonces(annonces);
  renderRosterPage(roster);
  renderGDGPage(gdg);
  renderAnnoncesPage(annonces);
  renderAbsences();
  renderTierlist();
}

document.addEventListener("DOMContentLoaded", boot);

async function renderAbsences() {
  if (!window.PURGATOIRE_CONFIG?.sheets?.absencesCsvUrl) return;

  let rows = [];
  try {
    rows = await loadCsv(window.PURGATOIRE_CONFIG.sheets.absencesCsvUrl);
  } catch (e) { return; }

  const tbody = document.querySelector("#absences-table tbody");
  if (!tbody) return;

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4">Aucune absence</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${escapeHtml(r.pseudo || "—")}</td>
      <td>${escapeHtml(r.debut || r.start || "—")}</td>
      <td>${escapeHtml(r.fin || r.end || "—")}</td>
      <td>${escapeHtml(r.raison || "—")}</td>
    </tr>
  `).join("");
}

async function renderTierlist() {
  if (!window.PURGATOIRE_CONFIG?.sheets?.tierlistCsvUrl) return;

  let rows = [];
  try {
    rows = await loadCsv(window.PURGATOIRE_CONFIG.sheets.tierlistCsvUrl);
  } catch (e) { return; }

  const wrap = document.querySelector("#tierlist-wrap");
  if (!wrap) return;

  if (!rows.length) {
    wrap.innerHTML = '<p>Aucune donnée</p>';
    return;
  }

  const groups = {};
  rows.forEach(r => {
    const tier = (r.tier || "Autre").toUpperCase();
    if (!groups[tier]) groups[tier] = [];
    groups[tier].push(r.personnage || r.name || "—");
  });

  const order = ["S","A","B","C","D","AUTRE"];

  wrap.innerHTML = order
    .filter(t => groups[t] && groups[t].length)
    .map(t => `
      <div class="tier-row">
        <strong>${t}</strong>
        <div>${groups[t].map(p => `<span>${escapeHtml(p)}</span>`).join("")}</div>
      </div>
    `).join("");
}
