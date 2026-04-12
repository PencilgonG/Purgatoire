---
layout: default
title: Arbre généalogique
permalink: /pages/arbre/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild · Héritage</span>
    <h1>Arbre généalogique</h1>
    <p>Les lignées de recrutement de Purgatoire depuis la fondation.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <div id="arbre-wrap">
      <div class="loading-state">Chargement de l'arbre…</div>
    </div>
    <div id="arbre-stats" class="arbre-stats-row"></div>
  </div>
</section>

<style>
#arbre-wrap {
  overflow-x: auto;
  padding: 16px 0 32px;
}
.arbre-svg { display: block; margin: 0 auto; }
.arbre-node-group { cursor: pointer; }
.arbre-node-circle {
  fill: rgba(201,151,62,.12);
  stroke: rgba(201,151,62,.35);
  stroke-width: 1.5;
  transition: all .2s;
}
.arbre-node-group:hover .arbre-node-circle {
  fill: rgba(201,151,62,.25);
  stroke: rgba(201,151,62,.7);
}
.arbre-node-avatar { clip-path: circle(22px at center); }
.arbre-node-name { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 600; fill: #e8e4d9; text-anchor: middle; }
.arbre-node-root .arbre-node-circle { fill: rgba(201,151,62,.2); stroke: #e3b45a; stroke-width: 2.5; }
.arbre-link { fill: none; stroke: rgba(201,151,62,.2); stroke-width: 1.5; }
.arbre-stats-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; }
.arbre-stat { background: transparent; border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 12px 18px; }
.arbre-stat strong { display: block; font-family: 'Cormorant Garamond',Georgia,serif; font-size: 1.5rem; color: #e3b45a; }
.arbre-stat span { font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(153,147,170,.6); }
.arbre-empty { text-align: center; padding: 60px 20px; color: rgba(153,147,170,.6); font-size: .9rem; border: 1px dashed rgba(255,255,255,.1); border-radius: 12px; }
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

async function fetchCsv(sheet) {
  const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheet)}`;
  const res=await fetch(url,{cache:'no-store'});
  return parseCsv(await res.text());
}

async function loadArbre() {
  const wrap = document.getElementById('arbre-wrap');
  const stats = document.getElementById('arbre-stats');
  try {
    const [arbreData, membres] = await Promise.all([fetchCsv('Arbre'), fetchCsv('Membres')]);

    if (!arbreData.length) {
      wrap.innerHTML = '<div class="arbre-empty">🌱 L\'arbre est vide.<br><small>Utilise <code>/recruteur set @membre</code> sur Discord pour créer des liens.</small></div>';
      return;
    }

    // Build tree structure
    const memberMap = {};
    membres.forEach(m => { memberMap[m.discord_id] = m; });

    // Find roots (members in Membres but whose recruteur_id is not in arbreData as discord_id)
    const recrues = new Set(arbreData.map(r => r.discord_id));
    const recruteurs = new Set(arbreData.map(r => r.recruteur_id));

    // Build adjacency
    const children = {};
    const nodeIds = new Set();
    arbreData.forEach(r => {
      if (!children[r.recruteur_id]) children[r.recruteur_id] = [];
      children[r.recruteur_id].push(r.discord_id);
      nodeIds.add(r.discord_id);
      nodeIds.add(r.recruteur_id);
    });

    // Roots = recruteurs who are not recrues themselves
    const roots = [...recruteurs].filter(id => !recrues.has(id));

    // Layout: BFS level by level
    const NODE_W = 110, NODE_H = 100, H_GAP = 20, V_GAP = 30;
    const positions = {};
    const levels = {};

    function layoutNode(id, depth, xStart) {
      const kids = children[id] || [];
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(id);
      if (!kids.length) {
        positions[id] = { x: xStart, y: depth * (NODE_H + V_GAP) };
        return NODE_W;
      }
      let totalW = 0;
      let childX = xStart;
      kids.forEach(kid => {
        const w = layoutNode(kid, depth + 1, childX);
        childX += w + H_GAP;
        totalW += w + H_GAP;
      });
      totalW -= H_GAP;
      const firstKid = kids[0], lastKid = kids[kids.length - 1];
      positions[id] = {
        x: (positions[firstKid].x + positions[lastKid].x) / 2,
        y: depth * (NODE_H + V_GAP)
      };
      return Math.max(NODE_W, totalW);
    }

    let xCursor = 0;
    roots.forEach(root => {
      const w = layoutNode(root, 0, xCursor);
      xCursor += w + H_GAP * 3;
    });

    // Isolated (in arbre but no recruteur in guild)
    arbreData.forEach(r => {
      if (!positions[r.discord_id]) layoutNode(r.discord_id, 1, xCursor);
    });

    const allIds = Object.keys(positions);
    const maxX = Math.max(...allIds.map(id => positions[id].x)) + NODE_W;
    const maxY = Math.max(...allIds.map(id => positions[id].y)) + NODE_H;
    const SVG_W = Math.max(800, maxX + 60);
    const SVG_H = maxY + 60;

    const PADX = 40, PADY = 40;
    let svgContent = `<svg class="arbre-svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg">`;

    // Edges
    arbreData.forEach(r => {
      const parent = positions[r.recruteur_id];
      const child  = positions[r.discord_id];
      if (!parent || !child) return;
      const px = parent.x + NODE_W/2 + PADX;
      const py = parent.y + NODE_H/2 + PADY;
      const cx = child.x + NODE_W/2 + PADX;
      const cy = child.y + NODE_H/2 + PADY;
      const midY = (py + cy) / 2;
      svgContent += `<path class="arbre-link" d="M${px},${py} C${px},${midY} ${cx},${midY} ${cx},${cy}"/>`;
    });

    // Nodes
    allIds.forEach(id => {
      const pos = positions[id];
      const m = memberMap[id];
      const pseudo = m?.pseudo || arbreData.find(r=>r.discord_id===id)?.pseudo || arbreData.find(r=>r.recruteur_id===id)?.recruteur_pseudo || id.slice(-4);
      const isRoot = roots.includes(id);
      const cx = pos.x + NODE_W/2 + PADX;
      const cy = pos.y + NODE_H/2 + PADY;
      const nbRecrues = (children[id]||[]).length;

      svgContent += `<g class="arbre-node-group${isRoot?' arbre-node-root':''}">
        <circle class="arbre-node-circle" cx="${cx}" cy="${cy-8}" r="26"/>
        <image href="${WORKER_URL}/avatar/${id}" x="${cx-22}" y="${cy-30}" width="44" height="44" clip-path="circle(22px at 22px 22px)" preserveAspectRatio="xMidYMid slice" onerror="this.style.display='none'"/>
        <text class="arbre-node-name" x="${cx}" y="${cy+26}" font-size="10">${pseudo.length>14?pseudo.slice(0,13)+'…':pseudo}</text>
        ${nbRecrues ? `<text x="${cx}" y="${cy-30}" text-anchor="middle" font-size="9" fill="#e3b45a" font-weight="700">${nbRecrues} recrue${nbRecrues>1?'s':''}</text>` : ''}
      </g>`;
    });

    svgContent += '</svg>';
    wrap.innerHTML = svgContent;

    // Stats
    const totalLiens = arbreData.length;
    const topRecruteur = [...recruteurs].map(id => ({
      id, pseudo: arbreData.find(r=>r.recruteur_id===id)?.recruteur_pseudo||'', count: (children[id]||[]).length
    })).sort((a,b)=>b.count-a.count)[0];

    stats.innerHTML = `
      <div class="arbre-stat"><strong>${allIds.length}</strong><span>Membres dans l'arbre</span></div>
      <div class="arbre-stat"><strong>${totalLiens}</strong><span>Liens de recrutement</span></div>
      ${topRecruteur ? `<div class="arbre-stat"><strong>${topRecruteur.pseudo}</strong><span>Top recruteur · ${topRecruteur.count} recrue${topRecruteur.count>1?'s':''}</span></div>` : ''}`;

  } catch(e) {
    wrap.innerHTML = `<div class="arbre-empty">Erreur de chargement.<br><small>${e.message}</small></div>`;
  }
}

document.addEventListener('DOMContentLoaded', loadArbre);
</script>
