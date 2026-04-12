---
layout: default
title: Archives
permalink: /pages/archives/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild · Mémoire</span>
    <h1>Machine à remonter le temps</h1>
    <p>Découvre à quoi ressemblait le roster à chaque semaine passée.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <div id="archives-nav" class="archives-nav"></div>
    <div id="archives-content">
      <div class="loading-state">Chargement de l'historique…</div>
    </div>
  </div>
</section>

<style>
.archives-nav { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px; }
.archives-week-btn {
  padding:6px 14px;border-radius:99px;border:1px solid rgba(255,255,255,.1);
  background:transparent;color:rgba(233,228,217,.55);font-family:inherit;
  font-size:.75rem;font-weight:600;cursor:pointer;transition:.18s;
}
.archives-week-btn:hover { border-color:rgba(201,151,62,.4);color:#e8e4d9; }
.archives-week-btn.active { background:rgba(201,151,62,.14);border-color:rgba(201,151,62,.5);color:#e3b45a; }

.archives-header { margin-bottom:20px; }
.archives-title { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.5rem;font-weight:700;color:#f0ece0;margin-bottom:4px; }
.archives-subtitle { font-size:.8rem;color:rgba(153,147,170,.65); }

.archives-table { width:100%;border-collapse:collapse; }
.archives-table th { font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.55);padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,.07); }
.archives-table td { padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.04);font-size:.85rem; }
.archives-table tr:hover td { background:rgba(255,255,255,.02); }
.archives-rank { font-size:.75rem;font-weight:700;color:rgba(153,147,170,.5); }
.archives-cc { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.1rem;font-weight:700;color:#e3b45a; }
.archives-delta { font-size:.75rem;font-weight:700; }
.archives-delta.up   { color:#4ade80; }
.archives-delta.down { color:#f87171; }
.archives-stats-row { display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px; }
.archives-stat { background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 16px; }
.archives-stat strong { display:block;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.4rem;color:#e3b45a; }
.archives-stat span { font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.55); }
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
function fmtCC(v){const n=Number(String(v).replace(/[^\d.]/g,''));if(!n)return'—';if(n>=1e6)return(n/1e6).toFixed(2)+'M';if(n>=1000)return(n/1000).toFixed(1)+'K';return String(n);}

let allHistory = [];

async function loadArchives() {
  try {
    allHistory = await (async()=>{const res=await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=CC_Historique`,{cache:'no-store'});return parseCsv(await res.text());})();
    if (!allHistory.length) {
      document.getElementById('archives-content').innerHTML = '<p class="empty-state">Aucun historique disponible. Les snapshots sont enregistrés automatiquement chaque lundi.</p>';
      return;
    }

    const weeks = [...new Set(allHistory.map(r => r.semaine))].filter(Boolean).sort().reverse();

    // Build week buttons
    document.getElementById('archives-nav').innerHTML = weeks.map((w, i) => `
      <button class="archives-week-btn${i===0?' active':''}" onclick="showWeek('${w}', this)">${w}</button>`).join('');

    showWeek(weeks[0], document.querySelector('.archives-week-btn.active'));
  } catch(e) {
    document.getElementById('archives-content').innerHTML = `<p class="empty-state">Erreur : ${e.message}</p>`;
  }
}

function showWeek(week, btn) {
  document.querySelectorAll('.archives-week-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const weekData = allHistory.filter(r => r.semaine === week).sort((a,b) => Number(b.cc)-Number(a.cc));
  if (!weekData.length) return;

  // Get previous week for delta
  const allWeeks = [...new Set(allHistory.map(r => r.semaine))].filter(Boolean).sort();
  const weekIdx  = allWeeks.indexOf(week);
  const prevWeek = weekIdx > 0 ? allWeeks[weekIdx - 1] : null;
  const prevData = prevWeek ? allHistory.filter(r => r.semaine === prevWeek) : [];
  const prevMap  = {};
  prevData.forEach(r => prevMap[r.discord_id] = Number(r.cc)||0);

  const medals  = ['🥇','🥈','🥉'];
  const totalCC = weekData.reduce((s,r) => s + (Number(r.cc)||0), 0);
  const avgCC   = weekData.length ? Math.round(totalCC / weekData.length) : 0;

  document.getElementById('archives-content').innerHTML = `
    <div class="archives-header">
      <div class="archives-title">Semaine ${week}</div>
      <div class="archives-subtitle">${weekData.length} membre${weekData.length>1?'s':''} enregistrés</div>
    </div>
    <div class="archives-stats-row">
      <div class="archives-stat"><strong>${weekData.length}</strong><span>Membres</span></div>
      <div class="archives-stat"><strong>${fmtCC(weekData[0]?.cc)}</strong><span>Top CC</span></div>
      <div class="archives-stat"><strong>${fmtCC(avgCC)}</strong><span>CC moyenne</span></div>
    </div>
    <div style="overflow-x:auto">
      <table class="archives-table">
        <thead><tr>
          <th>#</th><th>Pseudo</th><th>CC</th><th>Évolution</th>
        </tr></thead>
        <tbody>
          ${weekData.map((r,i) => {
            const prev  = prevMap[r.discord_id] || 0;
            const delta = prev ? Number(r.cc) - prev : 0;
            const deltaHtml = delta > 0
              ? `<span class="archives-delta up">+${fmtCC(delta)}</span>`
              : delta < 0
              ? `<span class="archives-delta down">−${fmtCC(Math.abs(delta))}</span>`
              : prev ? '<span style="color:rgba(153,147,170,.4)">—</span>' : '<span style="color:rgba(153,147,170,.4)">Nouveau</span>';
            return `<tr>
              <td class="archives-rank">${medals[i]||`#${i+1}`}</td>
              <td style="font-weight:600;color:#e8e4d9">${r.pseudo||'—'}</td>
              <td class="archives-cc">${fmtCC(r.cc)}</td>
              <td>${deltaHtml}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

document.addEventListener('DOMContentLoaded', loadArchives);
</script>
