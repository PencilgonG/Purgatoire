---
layout: default
title: Personnalité
permalink: /pages/personnalite/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild · Membres</span>
    <h1>Quel personnage es-tu ?</h1>
    <p>24 questions pour découvrir ton alter ego dans l'univers Seven Deadly Sins & Four Knights of the Apocalypse.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container">

    <div id="quiz-wrap">
      <!-- Étape 1 : pseudo -->
      <div id="step-pseudo" class="quiz-card">
        <div class="quiz-card-head">
          <span class="eyebrow">Identification</span>
          <h2>Entre ton pseudo Discord</h2>
          <p style="color:rgba(153,147,170,.8);font-size:.85rem;margin-top:6px">Le quiz est réservé aux membres de la guilde.</p>
        </div>
        <div class="quiz-pseudo-form">
          <input id="pseudo-input" type="text" placeholder="Ton pseudo exact" autocomplete="off">
          <button id="pseudo-btn" onclick="checkPseudo()">Continuer →</button>
        </div>
        <div id="pseudo-error" class="quiz-error" style="display:none"></div>
      </div>

      <!-- Étape 2 : questions -->
      <div id="step-quiz" style="display:none">
        <div class="quiz-progress-wrap">
          <div class="quiz-progress-bar"><div id="quiz-progress-fill"></div></div>
          <span id="quiz-progress-label" class="quiz-progress-label">Question 1 / 24</span>
        </div>
        <div id="quiz-question-card" class="quiz-card">
          <div class="quiz-q-number" id="quiz-q-num">Q1</div>
          <div class="quiz-q-label" id="quiz-q-label"></div>
          <div class="quiz-answers" id="quiz-answers"></div>
        </div>
      </div>

      <!-- Étape 3 : ex-aequo -->
      <div id="step-exaequo" style="display:none">
        <div class="quiz-card" style="text-align:center">
          <span class="eyebrow">Ex-aequo !</span>
          <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;color:#f0ece0;margin:10px 0 6px">Deux personnages à égalité</h2>
          <p id="exaequo-desc" style="font-size:.85rem;color:rgba(153,147,170,.8);margin-bottom:28px"></p>
          <div id="exaequo-choices" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:480px;margin:0 auto"></div>
        </div>
      </div>

      <!-- Étape 4 : résultat -->
      <div id="step-result" style="display:none">
        <div class="quiz-card quiz-result-card">
          <div class="quiz-result-header">
            <span class="eyebrow">Ton personnage</span>
            <div id="result-portrait" style="margin:10px auto 8px;width:110px;height:110px;border-radius:var(--radius-lg);overflow:hidden;border:2px solid rgba(201,151,62,.35);background:rgba(0,0,0,.2);display:none"><img id="result-portrait-img" alt="" style="width:100%;height:100%;object-fit:cover;object-position:top"></div>
            <h2 id="result-name" class="result-name"></h2>
            <div id="result-match" class="result-match"></div>
          </div>
          <p id="result-desc" class="result-desc"></p>
          <div id="result-top5" class="result-top5"></div>
          <div id="result-axes" class="result-axes"></div>
          <button class="quiz-btn-secondary" onclick="resetQuiz()">Recommencer</button>
        </div>
      </div>
    </div>

    <!-- Cards membres -->
    <div class="perso-section">
      <div class="perso-section-head">
        <h2>Personnages des membres</h2>
        <span id="perso-count" class="muted" style="font-size:.8rem"></span>
      </div>
      <div id="perso-cards" class="perso-grid">
        <div class="loading-state">Chargement…</div>
      </div>
    </div>

  </div>
</section>

<!-- Modal top5 -->
<div id="perso-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.78);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:24px" onclick="if(event.target===this)this.style.display='none'">
  <div style="background:#0d0f1a;border:1px solid rgba(201,151,62,.3);border-radius:14px;padding:28px 32px;max-width:400px;width:100%;position:relative">
    <button onclick="document.getElementById('perso-modal').style.display='none'" style="position:absolute;top:14px;right:16px;background:none;border:none;color:rgba(153,147,170,.6);font-size:1.1rem;cursor:pointer">✕</button>
    <div id="modal-inner"></div>
  </div>
</div>

<style>
.quiz-card {
  background: linear-gradient(145deg,rgba(201,151,62,.05),rgba(7,8,13,.6));
  border: 1px solid rgba(201,151,62,.18);
  border-radius: 14px;
  padding: 36px 40px;
  max-width: 680px;
  margin: 0 auto 32px;
}
.quiz-card-head { margin-bottom: 28px; }
.quiz-card-head h2 { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.7rem;font-weight:700;color:#f0ece0;margin-top:6px; }
.quiz-pseudo-form { display:flex;gap:12px;flex-wrap:wrap; }
.quiz-pseudo-form input {
  flex:1;min-width:220px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;
  padding:12px 16px;font-size:.9rem;color:#e8e4d9;font-family:inherit;outline:none;transition:border-color .2s;
}
.quiz-pseudo-form input:focus { border-color:rgba(201,151,62,.5); }
.quiz-pseudo-form input::placeholder { color:rgba(153,147,170,.5); }
.quiz-pseudo-form button, .quiz-btn-secondary {
  background:linear-gradient(145deg,rgba(201,151,62,.2),rgba(201,151,62,.08));
  border:1px solid rgba(201,151,62,.35);border-radius:8px;padding:12px 24px;
  font-size:.85rem;font-weight:600;color:#e3b45a;cursor:pointer;font-family:inherit;transition:.2s;
}
.quiz-pseudo-form button:hover,.quiz-btn-secondary:hover { background:linear-gradient(145deg,rgba(201,151,62,.3),rgba(201,151,62,.12));border-color:rgba(201,151,62,.6); }
.quiz-error { margin-top:12px;font-size:.82rem;color:#f87171;padding:10px 14px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);border-radius:7px; }
.quiz-progress-wrap { display:flex;align-items:center;gap:14px;max-width:680px;margin:0 auto 16px; }
.quiz-progress-bar { flex:1;height:4px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden; }
#quiz-progress-fill { height:100%;background:linear-gradient(90deg,#c9973e,#e3b45a);border-radius:99px;transition:width .4s ease;width:0%; }
.quiz-progress-label { font-size:.72rem;font-weight:700;color:rgba(153,147,170,.65);white-space:nowrap; }
.quiz-q-number { font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#e3b45a;margin-bottom:10px; }
.quiz-q-label { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.5rem;font-weight:700;color:#f0ece0;margin-bottom:24px;line-height:1.2; }
.quiz-answers { display:flex;flex-direction:column;gap:10px; }
.quiz-answer-btn {
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:9px;
  padding:14px 18px;text-align:left;font-size:.85rem;color:rgba(233,228,217,.8);
  cursor:pointer;font-family:inherit;transition:.18s;display:flex;gap:12px;align-items:flex-start;
}
.quiz-answer-btn:hover { background:rgba(201,151,62,.08);border-color:rgba(201,151,62,.35);color:#f0ece0; }
.quiz-answer-btn.selected { background:rgba(201,151,62,.14);border-color:rgba(201,151,62,.55);color:#e3b45a; }
.quiz-answer-key { font-weight:700;color:#e3b45a;flex-shrink:0;min-width:18px; }
.quiz-exaequo-btn {
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;
  padding:16px;cursor:pointer;font-family:inherit;text-align:center;transition:.2s;color:#e8e4d9;
}
.quiz-exaequo-btn:hover { border-color:rgba(201,151,62,.45);background:rgba(201,151,62,.07); }
.quiz-exaequo-btn strong { display:block;font-size:.95rem;color:#f0ece0;margin-bottom:6px; }
.quiz-exaequo-btn p { font-size:.74rem;color:rgba(153,147,170,.75);margin:0;line-height:1.5; }
.quiz-result-card { text-align:center; }
#result-portrait {
  box-shadow: 0 4px 24px rgba(0,0,0,.5), 0 0 0 1px rgba(201,151,62,.2);
  transition: transform .3s ease;
}
#result-portrait:hover { transform: scale(1.03); }
.result-name { font-family:'Cormorant Garamond',Georgia,serif;font-size:2.6rem;font-weight:700;color:#f0ece0;margin:6px 0 8px; }
.result-match { font-size:.8rem;font-weight:700;color:#e3b45a;letter-spacing:.06em; }
.result-desc { font-size:.87rem;color:rgba(153,147,170,.85);line-height:1.72;max-width:500px;margin:0 auto 24px; }
.result-top5 { display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:24px; }
.result-top5-item { font-size:.72rem;color:rgba(153,147,170,.7);background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:99px;padding:3px 10px; }
.result-top5-item.first { color:#e3b45a;border-color:rgba(201,151,62,.3); }
.result-axes { display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:24px;text-align:left; }
.result-axis { background:rgba(255,255,255,.04);border-radius:7px;padding:8px 10px; }
.result-axis-label { font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(153,147,170,.6);margin-bottom:4px; }
.result-axis-bar { height:3px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-bottom:3px; }
.result-axis-fill { height:100%;background:linear-gradient(90deg,#c9973e,#e3b45a);border-radius:99px; }
.result-axis-val { font-size:.68rem;font-weight:700;color:#e3b45a; }
.perso-section { margin-top:56px; }
.perso-section-head { display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px; }
.perso-section-head h2 { font-family:'Cormorant Garamond',Georgia,serif;font-size:1.4rem;font-weight:700;color:#f0ece0; }
.perso-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px; }
.perso-card {
  background:linear-gradient(145deg,rgba(201,151,62,.06),rgba(7,8,13,.5));
  border:1px solid rgba(201,151,62,.14);border-radius:11px;padding:18px 16px;
  text-align:center;transition:.2s;position:relative;overflow:hidden;cursor:pointer;
}
.perso-card::before { content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,151,62,.5),transparent); }
.perso-card:hover { border-color:rgba(201,151,62,.3);background:linear-gradient(145deg,rgba(201,151,62,.1),rgba(7,8,13,.45)); }
.perso-avatar { width:52px;height:52px;border-radius:50%;border:2px solid rgba(201,151,62,.3);margin:0 auto 10px;display:block;background:rgba(255,255,255,.05);object-fit:cover; }
.perso-pseudo { font-size:.78rem;font-weight:700;color:#e8e4d9;margin-bottom:4px; }
.perso-char { font-size:.7rem;color:#e3b45a;font-weight:600; }
.perso-hint { font-size:.62rem;color:rgba(201,151,62,.5);margin-top:5px;transition:.18s; }
.perso-card:hover .perso-hint { color:rgba(201,151,62,.9); }
</style>

<script>
const SHEET_ID   = '1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM';
const WORKER_URL = 'https://purgatoire-bot.originsguild.workers.dev';
const AXES = ['impulsivite','empathie','loyaute','ambition','humour','agressivite','discipline','strategie','idealisme','dominance'];
const AXIS_LABELS = {impulsivite:'Impuls.',empathie:'Empathie',loyaute:'Loyauté',ambition:'Ambition',humour:'Humour',agressivite:'Agressiv.',discipline:'Discip.',strategie:'Stratégie',idealisme:'Idéalism.',dominance:'Dominance'};
const AXIS_WEIGHTS = {impulsivite:1,empathie:1.1,loyaute:1.1,ambition:1,humour:0.9,agressivite:1,discipline:1,strategie:1.1,idealisme:1,dominance:1};
const SECONDARY_INFLUENCE = 0.28;

let state = { pseudo:'', questions:[], characters:[], answers:{}, currentQ:0, finalProfile:null, finalTop5:null };

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

// ── Étape 1 : vérif pseudo ──────────────────────────────
async function checkPseudo() {
  const input=document.getElementById('pseudo-input');
  const err=document.getElementById('pseudo-error');
  const btn=document.getElementById('pseudo-btn');
  const pseudo=input.value.trim();
  if(!pseudo){showErr(err,'Entre ton pseudo.');return;}
  btn.textContent='Vérification…';btn.disabled=true;err.style.display='none';
  try {
    const membres=await fetchCsv('Membres');
    const found=membres.find(m=>m.pseudo&&m.pseudo.toLowerCase()===pseudo.toLowerCase());
    if(!found){showErr(err,'❌ Pseudo introuvable. Fais /cc set sur Discord d\'abord.');btn.textContent='Continuer →';btn.disabled=false;return;}
    const results=await fetchCsv('Personnalite');
    const already=results.find(r=>r.pseudo&&r.pseudo.toLowerCase()===pseudo.toLowerCase());
    if(already){showErr(err,`Tu as déjà passé le quiz ! Ton personnage : ${already.personnage} (${already.match_pct}%)`);btn.textContent='Continuer →';btn.disabled=false;return;}
    state.pseudo=found.pseudo;
    await startQuiz();
  } catch(e){showErr(err,'Erreur de connexion. Réessaie.');btn.textContent='Continuer →';btn.disabled=false;}
}

function showErr(el,msg){el.textContent=msg;el.style.display='block';}

// ── Étape 2 : quiz ──────────────────────────────────────
async function startQuiz() {
  const [mapRows,charRows]=await Promise.all([fetchCsv('questions_map'),fetchCsv('characters')]);
  const qMap={};
  mapRows.forEach(r=>{
    if(!qMap[r.question_id])qMap[r.question_id]={id:r.question_id,label:r.question_label,answers:{}};
    if(!qMap[r.question_id].answers[r.answer_key])qMap[r.question_id].answers[r.answer_key]={key:r.answer_key,label:r.answer_label,deltas:[]};
    qMap[r.question_id].answers[r.answer_key].deltas.push({axis:r.axis,delta:Number(r.delta)});
  });
  state.questions=Object.values(qMap).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  state.characters=charRows;
  state.answers={};state.currentQ=0;
  document.getElementById('step-pseudo').style.display='none';
  document.getElementById('step-quiz').style.display='block';
  renderQuestion();
}

function renderQuestion() {
  const q=state.questions[state.currentQ],tot=state.questions.length;
  document.getElementById('quiz-progress-fill').style.width=((state.currentQ/tot)*100)+'%';
  document.getElementById('quiz-progress-label').textContent=`Question ${state.currentQ+1} / ${tot}`;
  document.getElementById('quiz-q-num').textContent=q.id;
  document.getElementById('quiz-q-label').textContent=q.label;
  document.getElementById('quiz-answers').innerHTML=Object.values(q.answers).map(a=>`
    <button class="quiz-answer-btn" onclick="selectAnswer('${a.key}')">
      <span class="quiz-answer-key">${a.key}</span><span>${a.label}</span>
    </button>`).join('');
}

function selectAnswer(key) {
  const q=state.questions[state.currentQ];
  state.answers[q.id]=key;
  document.querySelectorAll('.quiz-answer-btn').forEach(b=>{if(b.querySelector('.quiz-answer-key').textContent===key)b.classList.add('selected');});
  setTimeout(()=>{
    state.currentQ++;
    if(state.currentQ>=state.questions.length)computeResult();
    else renderQuestion();
  },320);
}

// ── Calcul ──────────────────────────────────────────────
function computeResult() {
  document.getElementById('step-quiz').style.display='none';
  const raw=Object.fromEntries(AXES.map(a=>[a,0]));
  state.questions.forEach(q=>{
    const key=state.answers[q.id];
    if(!key||!q.answers[key])return;
    q.answers[key].deltas.forEach(({axis,delta})=>{if(raw[axis]!==undefined)raw[axis]+=delta;});
  });
  const profile=Object.fromEntries(AXES.map(a=>[a,Math.max(0,Math.min(100,50+raw[a]))]));
  const scored=scoreChars(profile);
  const top5=scored.slice(0,5);
  const weights=softmax(top5);
  const composite=buildComposite(top5,weights);
  const adjusted=blend(profile,composite,SECONDARY_INFLUENCE);
  const final=scoreChars(adjusted);
  const top5f=final.slice(0,5);
  state.finalProfile=adjusted;
  state.finalTop5=top5f;

  // Ex-aequo ?
  if(top5f.length>=2&&Math.abs(top5f[0].matchPct-top5f[1].matchPct)<0.8){
    showExAequo(top5f[0],top5f[1],top5f,adjusted);
  } else {
    showResult(top5f[0],top5f,adjusted);
    saveResult(top5f[0],top5f);
  }
}

function scoreChars(profile) {
  return state.characters.map(c=>{
    let dist=0,maxD=0;
    AXES.forEach(a=>{const w=AXIS_WEIGHTS[a]||1;dist+=Math.abs(profile[a]-Number(c[a]||0))*w;maxD+=100*w;});
    return {...c,matchPct:Math.max(0,Math.min(100,(1-dist/maxD)*100))};
  }).sort((a,b)=>b.matchPct-a.matchPct);
}

function softmax(top){const T=8,exps=top.map(c=>Math.exp(c.matchPct/T)),sum=exps.reduce((a,b)=>a+b,0);return exps.map(v=>v/sum);}
function buildComposite(top,weights){const c=Object.fromEntries(AXES.map(a=>[a,0]));top.forEach((ch,i)=>AXES.forEach(a=>c[a]+=Number(ch[a]||0)*weights[i]));return c;}
function blend(p,comp,inf){return Object.fromEntries(AXES.map(a=>[a,p[a]*(1-inf)+comp[a]*inf]));}

// ── Ex-aequo ────────────────────────────────────────────
function showExAequo(cA,cB,top5,profile) {
  document.getElementById('exaequo-desc').innerHTML=`<strong style="color:#e3b45a">${cA.nom}</strong> et <strong style="color:#e3b45a">${cB.nom}</strong> ont tous les deux <strong style="color:#e3b45a">${Math.round(cA.matchPct)}%</strong> de compatibilité.<br>Lequel te correspond le mieux ?`;
  document.getElementById('exaequo-choices').innerHTML=[cA,cB].map(c=>{
    const _img = (typeof heroPortrait==='function') ? heroPortrait(c.nom,'slot') : '';
    return `<button class="quiz-exaequo-btn" onclick="chooseChar('${c.slug}')" style="position:relative;overflow:hidden;text-align:left">
      ${_img ? `<img src="${_img}" alt="" style="position:absolute;right:-10px;top:0;bottom:0;width:80px;height:100%;object-fit:cover;object-position:top;opacity:.22;pointer-events:none" onerror="this.remove()">` : ''}
      <div style="position:relative;z-index:1"><strong>${c.nom}</strong><p>${(c.description||'').slice(0,90)}…</p></div>
    </button>`;
  }).join('');
  document.getElementById('step-exaequo').style.display='block';
}

function chooseChar(slug) {
  document.getElementById('step-exaequo').style.display='none';
  const top5=state.finalTop5;
  const winner=top5.find(c=>c.slug===slug)||top5[0];
  const reordered=[winner,...top5.filter(c=>c.slug!==slug)];
  showResult(winner,reordered,state.finalProfile);
  saveResult(winner,reordered);
}

// ── Résultat ────────────────────────────────────────────
function showResult(winner,top5,profile) {
  document.getElementById('result-name').textContent=winner.nom;
  document.getElementById('result-match').textContent=`Compatibilité : ${Math.round(winner.matchPct)}%`;
  const _rPortrait = document.getElementById('result-portrait');
  const _rPortraitImg = document.getElementById('result-portrait-img');
  if (_rPortrait && _rPortraitImg && typeof heroPortrait === 'function') {
    const _url = heroPortrait(winner.nom, 'big');
    if (_url) { _rPortraitImg.src = _url; _rPortrait.style.display = 'block'; }
  }
  document.getElementById('result-desc').textContent=winner.description||'';
  document.getElementById('result-top5').innerHTML=top5.map((c,i)=>`<span class="result-top5-item${i===0?' first':''}">${c.nom} — ${Math.round(c.matchPct)}%</span>`).join('');
  document.getElementById('result-axes').innerHTML=AXES.map(a=>`
    <div class="result-axis">
      <div class="result-axis-label">${AXIS_LABELS[a]}</div>
      <div class="result-axis-bar"><div class="result-axis-fill" style="width:${Math.round(profile[a]||0)}%"></div></div>
      <div class="result-axis-val">${Math.round(profile[a]||0)}</div>
    </div>`).join('');
  document.getElementById('step-result').style.display='block';
}

async function saveResult(winner,top5) {
  try {
    const res=await fetch(`${WORKER_URL}/personnalite`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        pseudo:state.pseudo,
        personnage:winner.nom,
        match_pct:Math.round(winner.matchPct),
        top5:JSON.stringify(top5.map(c=>c.nom)),
        profil:JSON.stringify(state.finalProfile)
      })
    });
    const data=await res.json();
    if(data.ok)loadPersoCards();
    else console.warn('Save error:',data);
  } catch(e){console.warn('Save failed',e);}
}

function resetQuiz() {
  ['step-pseudo','step-quiz','step-exaequo','step-result'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.style.display=id==='step-pseudo'?'block':'none';
  });
  document.getElementById('pseudo-input').value='';
  document.getElementById('pseudo-error').style.display='none';
  document.getElementById('pseudo-btn').textContent='Continuer →';
  document.getElementById('pseudo-btn').disabled=false;
}

// ── Cards membres ────────────────────────────────────────
async function loadPersoCards() {
  const wrap=document.getElementById('perso-cards');
  const count=document.getElementById('perso-count');
  try {
    const results=await fetchCsv('Personnalite');
    if(!results.length){wrap.innerHTML='<p class="empty-state">Aucun membre n\'a encore passé le quiz.</p>';return;}
    if(count)count.textContent=`${results.length} membre${results.length>1?'s':''}`;
    wrap.innerHTML=results.sort((a,b)=>String(a.pseudo||'').localeCompare(String(b.pseudo||''))).map(r=>{
      const top5raw=r.top5||r.top_5||'[]';
      let top5=[];
      try{top5=JSON.parse(top5raw);}catch(e){}
      let profil={};
      try{profil=JSON.parse(r.profil_json||r.profil||'{}');}catch(e){}
      const dataStr=encodeURIComponent(JSON.stringify({pseudo:r.pseudo,personnage:r.personnage,match_pct:r.match_pct,top5,discord_id:r.discord_id,profil}));
      const _charImg = (typeof heroPortrait==='function') ? heroPortrait(r.personnage||'','slot') : '';
      return `<div class="perso-card" onclick="openModal('${dataStr}')" style="position:relative;overflow:hidden">
        ${_charImg ? `<div style="position:absolute;inset:0;z-index:0;pointer-events:none"><img src="${_charImg}" alt="" style="width:100%;height:100%;object-fit:cover;object-position:top;opacity:.15;filter:saturate(.6)" onerror="this.parentElement.remove()"></div>` : ''}
        <div style="position:relative;z-index:1">
          <img class="perso-avatar" src="${WORKER_URL}/avatar/${r.discord_id||''}" alt="" onerror="this.style.opacity='.2'">
          <div class="perso-pseudo">${r.pseudo||'—'}</div>
          <div class="perso-char">${r.personnage||'—'}</div>
          <div class="perso-hint">Voir le top 5 →</div>
        </div>
      </div>`;
    }).join('');
  } catch(e){wrap.innerHTML='<p class="empty-state">Erreur de chargement.</p>';}
}

function openModal(encoded) {
  const d=JSON.parse(decodeURIComponent(encoded));
  const top5=d.top5||[];
  document.getElementById('modal-inner').innerHTML=`
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <img src="${WORKER_URL}/avatar/${d.discord_id||''}" style="width:48px;height:48px;border-radius:50%;border:2px solid rgba(201,151,62,.3)" onerror="this.style.opacity='.2'">
      <div>
        <div style="font-weight:700;font-size:.95rem;color:#f0ece0">${d.pseudo||'—'}</div>
        <div style="font-size:.75rem;color:#e3b45a;font-weight:600">${d.personnage||'—'} · ${d.match_pct||'?'}%</div>
      </div>
    </div>
    <div style="font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.6);margin-bottom:10px">Top 5 personnages</div>
    ${top5.map((nom,i)=>{
      const _hud = (typeof heroPortrait==='function') ? heroPortrait(nom,'hud') : '';
      return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06)">
        <span style="font-size:.7rem;font-weight:700;color:${i===0?'#e3b45a':'rgba(153,147,170,.5)'};min-width:18px">#${i+1}</span>
        ${_hud ? `<img src="${_hud}" alt="" style="width:24px;height:24px;border-radius:50%;object-fit:cover;border:1px solid rgba(201,151,62,${i===0?.4:.15});background:rgba(0,0,0,.2);flex-shrink:0" onerror="this.style.display='none'">` : ''}
        <span style="font-size:.85rem;font-weight:${i===0?700:400};color:${i===0?'#f0ece0':'rgba(233,228,217,.7)'}">${nom}</span>
      </div>`;
    }).join('')}
    ${Object.keys(d.profil||{}).length ? `
      <div style="font-size:.65rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(153,147,170,.6);margin:16px 0 10px">Profil de personnalité</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${AXES.map(a=>{
          const val=Math.round(d.profil[a]||0);
          return `<div style="background:rgba(255,255,255,.04);border-radius:7px;padding:7px 10px">
            <div style="font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(153,147,170,.55);margin-bottom:3px">${AXIS_LABELS[a]}</div>
            <div style="height:3px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-bottom:3px">
              <div style="height:100%;width:${val}%;background:linear-gradient(90deg,#c9973e,#e3b45a);border-radius:99px"></div>
            </div>
            <div style="font-size:.68rem;font-weight:700;color:#e3b45a">${val}</div>
          </div>`;
        }).join('')}
      </div>` : ''}`;
  document.getElementById('perso-modal').style.display='flex';
}

document.addEventListener('DOMContentLoaded', loadPersoCards);
</script>
