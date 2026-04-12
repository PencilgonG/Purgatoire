---
layout: default
title: Contrats
permalink: /pages/contrats/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild · Engagement</span>
    <h1>Contrats personnels</h1>
    <p>Chaque membre s'engage publiquement sur un objectif CC. La guilde suit sa progression.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <div id="contrats-stats" class="contrats-stats-row" style="margin-bottom:24px"></div>
    <div id="contrats-actifs"></div>
    <div id="contrats-historique" style="margin-top:40px"></div>
  </div>
</section>

<style>
.contrats-stats-row { display:flex;gap:14px;flex-wrap:wrap; }
.contrat-stat { background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:14px 20px; }
.contrat-stat strong { display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;color:#e3b45a; }
.contrat-stat span { font-size:.63rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.6); }

.contrat-card {
  background:linear-gradient(145deg,rgba(201,151,62,.06),rgba(7,8,13,.5));
  border:1px solid rgba(201,151,62,.16);border-radius:12px;padding:20px 24px;margin-bottom:14px;
  position:relative;overflow:hidden;
}
.contrat-card::before { content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,151,62,.5),transparent); }
.contrat-card-head { display:flex;align-items:center;gap:14px;margin-bottom:14px; }
.contrat-avatar { width:38px;height:38px;border-radius:50%;border:2px solid rgba(201,151,62,.3);flex-shrink:0;background:rgba(255,255,255,.05); }
.contrat-pseudo { font-weight:700;font-size:.95rem;color:#f0ece0; }
.contrat-meta { font-size:.72rem;color:rgba(153,147,170,.65);margin-top:2px; }
.contrat-progress-label { display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;font-size:.8rem; }
.contrat-progress-bar { height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden;margin-bottom:8px; }
.contrat-progress-fill { height:100%;border-radius:99px;background:linear-gradient(90deg,#c9973e,#e3b45a);transition:width .6s ease; }
.contrat-progress-fill.danger { background:linear-gradient(90deg,#c94f4f,#f87171); }
.contrat-progress-fill.done   { background:linear-gradient(90deg,#2ea87a,#4ade80); }
.contrat-chips { display:flex;gap:8px;flex-wrap:wrap;font-size:.7rem; }
.contrat-chip { background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:99px;padding:2px 10px;color:rgba(153,147,170,.7); }
.contrat-chip.gold { color:#e3b45a;border-color:rgba(201,151,62,.25); }

.contrat-section-title { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.2rem;font-weight:700;color:#f0ece0;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:8px; }

.contrat-hist-card {
  display:flex;align-items:center;gap:12px;padding:10px 16px;
  border:1px solid rgba(255,255,255,.06);border-radius:9px;margin-bottom:8px;
}
.contrat-hist-status { font-size:.75rem;font-weight:700;min-width:80px; }
.contrat-hist-status.accompli { color:#4ade80; }
.contrat-hist-status.expire   { color:#f87171; }
</style>

<script>
const SHEET_ID   = '1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM';
const WORKER_URL = 'https://purgatoire-bot.originsguild.workers.dev';

function parseCsv(text) {
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
async function fetchCsv(sheet){
  const res=await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`,{cache:'no-store'});
  return parseCsv(await res.text());
}
function fmtCC(v){const n=Number(String(v).replace(/[^\d.]/g,''));if(!n)return'—';if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1000)return(n/1000).toFixed(1)+'K';return String(n);}
function fmtDate(s){if(!s||!s.includes('-'))return s||'—';const[y,m,d]=s.split('-');return`${d}/${m}/${y}`;}

async function loadContrats() {
  try {
    const [contrats, membres] = await Promise.all([fetchCsv('Contrats'), fetchCsv('Membres')]);
    const memberMap = {};
    membres.forEach(m => memberMap[m.discord_id] = m);
    const today = new Date().toISOString().slice(0,10);

    const actifs     = contrats.filter(c => c.statut === 'actif');
    const historique = contrats.filter(c => c.statut !== 'actif').reverse();
    const accomplis  = contrats.filter(c => c.statut === 'accompli').length;

    // Stats
    document.getElementById('contrats-stats').innerHTML = `
      <div class="contrat-stat"><strong>${actifs.length}</strong><span>Contrats actifs</span></div>
      <div class="contrat-stat"><strong>${accomplis}</strong><span>Accomplis</span></div>
      <div class="contrat-stat"><strong>${contrats.length}</strong><span>Total</span></div>`;

    // Actifs
    const actifWrap = document.getElementById('contrats-actifs');
    if (!actifs.length) {
      actifWrap.innerHTML = '<p class="empty-state">Aucun contrat actif. Utilise <code>/contrat set</code> sur Discord !</p>';
    } else {
      actifWrap.innerHTML = '<div class="contrat-section-title">Contrats en cours</div>' + actifs.map(c => {
        const m = memberMap[c.discord_id];
        const ccActuelle = Number(m?.cc || 0);
        const ccDepart   = Number(c.cc_au_moment || 0);
        const objectif   = Number(c.objectif_cc || 0);
        const range = objectif - ccDepart;
        const pct   = range > 0 ? Math.min(100, Math.round((ccActuelle - ccDepart) / range * 100)) : 0;
        const expired = c.date_objectif && c.date_objectif < today;
        const fillClass = pct >= 100 ? 'done' : expired ? 'danger' : '';
        const daysLeft = c.date_objectif ? Math.ceil((new Date(c.date_objectif) - new Date()) / 86400000) : null;
        return `
          <div class="contrat-card">
            <div class="contrat-card-head">
              <img class="contrat-avatar" src="${WORKER_URL}/avatar/${c.discord_id}" onerror="this.style.opacity='.2'">
              <div>
                <div class="contrat-pseudo">${c.pseudo||'—'}</div>
                <div class="contrat-meta">Engagé le ${fmtDate(c.date_creation)} · Objectif : ${fmtDate(c.date_objectif)}</div>
              </div>
            </div>
            <div class="contrat-progress-label">
              <span style="color:rgba(153,147,170,.7)">Départ : <strong style="color:#e8e4d9">${fmtCC(ccDepart)}</strong></span>
              <span style="color:#e3b45a;font-weight:700">${pct}%</span>
              <span style="color:rgba(153,147,170,.7)">Objectif : <strong style="color:#e8e4d9">${fmtCC(objectif)}</strong></span>
            </div>
            <div class="contrat-progress-bar"><div class="contrat-progress-fill ${fillClass}" style="width:${pct}%"></div></div>
            <div class="contrat-chips">
              <span class="contrat-chip gold">CC actuelle : ${fmtCC(ccActuelle)}</span>
              <span class="contrat-chip gold">Restant : ${fmtCC(Math.max(0, objectif - ccActuelle))}</span>
              ${daysLeft !== null ? `<span class="contrat-chip ${daysLeft < 0 ? '' : daysLeft <= 7 ? 'gold' : ''}">${daysLeft < 0 ? 'Expiré' : daysLeft === 0 ? 'Dernier jour !' : `${daysLeft}j restants`}</span>` : ''}
            </div>
          </div>`;
      }).join('');
    }

    // Historique
    if (historique.length) {
      document.getElementById('contrats-historique').innerHTML = '<div class="contrat-section-title">Historique</div>' + historique.map(c => `
        <div class="contrat-hist-card">
          <img class="contrat-avatar" style="width:30px;height:30px" src="${WORKER_URL}/avatar/${c.discord_id}" onerror="this.style.opacity='.2'">
          <div style="flex:1">
            <span style="font-weight:700;font-size:.85rem;color:#e8e4d9">${c.pseudo}</span>
            <span style="font-size:.75rem;color:rgba(153,147,170,.65);margin-left:8px">${fmtCC(c.objectif_cc)} CC · ${fmtDate(c.date_objectif)}</span>
          </div>
          <span class="contrat-hist-status ${c.statut}">${c.statut === 'accompli' ? '✅ Accompli' : '⌛ Expiré'}</span>
        </div>`).join('');
    }
  } catch(e) {
    document.getElementById('contrats-actifs').innerHTML = `<p class="empty-state">Erreur de chargement.<br><small>${e.message}</small></p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadContrats);
</script>
