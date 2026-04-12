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

    <!-- QUIZ -->
    <div id="quiz-wrap">

      <!-- Étape 1 : Vérification pseudo -->
      <div id="step-pseudo" class="quiz-card">
        <div class="quiz-card-head">
          <span class="eyebrow">Identification</span>
          <h2>Entre ton pseudo Discord</h2>
          <p style="color:rgba(153,147,170,.8);font-size:.85rem;margin-top:6px">Le quiz est réservé aux membres de la guilde.</p>
        </div>
        <div class="quiz-pseudo-form">
          <input id="pseudo-input" type="text" placeholder="Ton pseudo exact (ex: Pencilgon chevalier des restes)" autocomplete="off">
          <button id="pseudo-btn" onclick="checkPseudo()">Continuer →</button>
        </div>
        <div id="pseudo-error" class="quiz-error" style="display:none"></div>
      </div>

      <!-- Étape 2 : Questions -->
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

      <!-- Étape 3 : Résultat -->
      <div id="step-result" style="display:none">
        <div class="quiz-card quiz-result-card">
          <div class="quiz-result-header">
            <span class="eyebrow">Ton personnage</span>
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

    <!-- CARDS MEMBRES -->
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

<style>
/* ── Quiz card ── */
.quiz-card {
  background: linear-gradient(145deg, rgba(201,151,62,.05), rgba(7,8,13,.6));
  border: 1px solid rgba(201,151,62,.18);
  border-radius: 14px;
  padding: 36px 40px;
  max-width: 680px;
  margin: 0 auto 32px;
}
.quiz-card-head { margin-bottom: 28px; }
.quiz-card-head h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.7rem;
  font-weight: 700;
  color: #f0ece0;
  margin-top: 6px;
}

/* Pseudo form */
.quiz-pseudo-form { display: flex; gap: 12px; flex-wrap: wrap; }
.quiz-pseudo-form input {
  flex: 1;
  min-width: 220px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: .9rem;
  color: #e8e4d9;
  font-family: inherit;
  outline: none;
  transition: border-color .2s;
}
.quiz-pseudo-form input:focus { border-color: rgba(201,151,62,.5); }
.quiz-pseudo-form input::placeholder { color: rgba(153,147,170,.5); }
.quiz-pseudo-form button,
.quiz-btn-secondary {
  background: linear-gradient(145deg, rgba(201,151,62,.2), rgba(201,151,62,.08));
  border: 1px solid rgba(201,151,62,.35);
  border-radius: 8px;
  padding: 12px 24px;
  font-size: .85rem;
  font-weight: 600;
  color: #e3b45a;
  cursor: pointer;
  font-family: inherit;
  transition: background .2s, border-color .2s;
}
.quiz-pseudo-form button:hover,
.quiz-btn-secondary:hover {
  background: linear-gradient(145deg, rgba(201,151,62,.3), rgba(201,151,62,.12));
  border-color: rgba(201,151,62,.6);
}
.quiz-error {
  margin-top: 12px;
  font-size: .82rem;
  color: #f87171;
  padding: 10px 14px;
  background: rgba(248,113,113,.08);
  border: 1px solid rgba(248,113,113,.2);
  border-radius: 7px;
}

/* Progress */
.quiz-progress-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  max-width: 680px;
  margin-inline: auto;
  margin-bottom: 16px;
}
.quiz-progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,.08);
  border-radius: 99px;
  overflow: hidden;
}
#quiz-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9973e, #e3b45a);
  border-radius: 99px;
  transition: width .4s ease;
  width: 0%;
}
.quiz-progress-label { font-size: .72rem; font-weight: 700; color: rgba(153,147,170,.65); white-space: nowrap; }

/* Question */
.quiz-q-number {
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #e3b45a;
  margin-bottom: 10px;
}
.quiz-q-label {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0ece0;
  margin-bottom: 24px;
  line-height: 1.2;
}
.quiz-answers { display: flex; flex-direction: column; gap: 10px; }
.quiz-answer-btn {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 9px;
  padding: 14px 18px;
  text-align: left;
  font-size: .85rem;
  color: rgba(233,228,217,.8);
  cursor: pointer;
  font-family: inherit;
  transition: background .18s, border-color .18s, color .18s;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.quiz-answer-btn:hover {
  background: rgba(201,151,62,.08);
  border-color: rgba(201,151,62,.35);
  color: #f0ece0;
}
.quiz-answer-btn.selected {
  background: rgba(201,151,62,.14);
  border-color: rgba(201,151,62,.55);
  color: #e3b45a;
}
.quiz-answer-key {
  font-weight: 700;
  color: #e3b45a;
  flex-shrink: 0;
  min-width: 18px;
}

/* Résultat */
.quiz-result-card { text-align: center; }
.quiz-result-header { margin-bottom: 16px; }
.result-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.6rem;
  font-weight: 700;
  color: #f0ece0;
  margin: 6px 0 8px;
}
.result-match {
  font-size: .8rem;
  font-weight: 700;
  color: #e3b45a;
  letter-spacing: .06em;
}
.result-desc {
  font-size: .87rem;
  color: rgba(153,147,170,.85);
  line-height: 1.72;
  max-width: 500px;
  margin: 0 auto 24px;
}
.result-top5 {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.result-top5-item {
  font-size: .72rem;
  color: rgba(153,147,170,.7);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 99px;
  padding: 3px 10px;
}
.result-top5-item.first { color: #e3b45a; border-color: rgba(201,151,62,.3); }
.result-axes {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 24px;
  text-align: left;
}
.result-axis {
  background: rgba(255,255,255,.04);
  border-radius: 7px;
  padding: 8px 10px;
}
.result-axis-label { font-size: .6rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: rgba(153,147,170,.6); margin-bottom: 4px; }
.result-axis-bar { height: 3px; background: rgba(255,255,255,.06); border-radius: 99px; overflow: hidden; margin-bottom: 3px; }
.result-axis-fill { height: 100%; background: linear-gradient(90deg,#c9973e,#e3b45a); border-radius: 99px; }
.result-axis-val { font-size: .68rem; font-weight: 700; color: #e3b45a; }

/* Cards membres */
.perso-section { margin-top: 56px; }
.perso-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px; }
.perso-section-head h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #f0ece0;
}
.perso-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}
.perso-card {
  background: linear-gradient(145deg, rgba(201,151,62,.06), rgba(7,8,13,.5));
  border: 1px solid rgba(201,151,62,.14);
  border-radius: 11px;
  padding: 18px 16px;
  text-align: center;
  transition: border-color .2s, background .2s;
  position: relative;
  overflow: hidden;
}
.perso-card::before {
  content: '';
  position: absolute;
  top: 0; left: 10%; right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,151,62,.5), transparent);
}
.perso-card:hover { border-color: rgba(201,151,62,.3); background: linear-gradient(145deg,rgba(201,151,62,.1),rgba(7,8,13,.45)); }
.perso-avatar {
  width: 52px; height: 52px;
  border-radius: 50%;
  border: 2px solid rgba(201,151,62,.3);
  margin: 0 auto 10px;
  display: block;
  background: rgba(255,255,255,.05);
  object-fit: cover;
}
.perso-pseudo { font-size: .78rem; font-weight: 700; color: #e8e4d9; margin-bottom: 4px; }
.perso-char { font-size: .7rem; color: #e3b45a; font-weight: 600; }
.perso-match { font-size: .62rem; color: rgba(153,147,170,.6); margin-top: 2px; }
</style>

<script>
const SHEET_ID   = '1npBpU9jQXFOW_mrDiycpB1ptJzXdcZE2iJ8-r8RP8oM';
const WORKER_URL = 'https://purgatoire-bot.originsguild.workers.dev';
const AXES = ['impulsivite','empathie','loyaute','ambition','humour','agressivite','discipline','strategie','idealisme','dominance'];
const AXIS_WEIGHTS = {impulsivite:1,empathie:1.1,loyaute:1.1,ambition:1,humour:0.9,agressivite:1,discipline:1,strategie:1.1,idealisme:1,dominance:1};
const SECONDARY_INFLUENCE = 0.28;

let state = { pseudo: '', questions: [], characters: [], answers: {}, currentQ: 0 };

// ── Chargement CSV ───────────────────────────────────────
function parseGvizCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i+1];
    if (ch==='"') { if (q&&nx==='"'){cell+='"';i++;}else q=!q; }
    else if (ch===','&&!q){ row.push(cell);cell=''; }
    else if ((ch==='\n'||ch==='\r')&&!q){ if(ch==='\r'&&nx==='\n')i++; if(cell||row.length){row.push(cell);rows.push(row);row=[];cell='';} }
    else cell+=ch;
  }
  if(cell||row.length){row.push(cell);rows.push(row);}
  if(!rows.length)return[];
  const headers=rows[0].map(h=>h.trim().replace(/\s+/g,'_').toLowerCase());
  return rows.slice(1).filter(r=>r.some(c=>c.trim())).map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||'').trim()])));
}

async function fetchCsv(sheet) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheet}`;
  const res = await fetch(url, { cache: 'no-store' });
  return parseGvizCsv(await res.text());
}

// ── Vérif pseudo ─────────────────────────────────────────
async function checkPseudo() {
  const input = document.getElementById('pseudo-input');
  const err   = document.getElementById('pseudo-error');
  const btn   = document.getElementById('pseudo-btn');
  const pseudo = input.value.trim();
  if (!pseudo) { showError(err, 'Entre ton pseudo.'); return; }

  btn.textContent = 'Vérification…';
  btn.disabled = true;
  err.style.display = 'none';

  try {
    const membres = await fetchCsv('Membres');
    const found = membres.find(m => m.pseudo && m.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (!found) { showError(err, '❌ Pseudo introuvable. Vérifie l\'orthographe ou fais /cc set sur Discord d\'abord.'); btn.textContent='Continuer →';btn.disabled=false;return; }

    // Vérifie si déjà fait
    const results = await fetchCsv('Personnalite');
    const already = results.find(r => r.pseudo && r.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (already) { showError(err, `Tu as déjà passé le quiz ! Ton personnage : ${already.personnage} (${already.match_pct}%)`); btn.textContent='Continuer →';btn.disabled=false;return; }

    state.pseudo = found.pseudo;
    await startQuiz();
  } catch(e) {
    showError(err, 'Erreur de connexion. Réessaie.');
    btn.textContent='Continuer →'; btn.disabled=false;
  }
}

function showError(el, msg) { el.textContent = msg; el.style.display = 'block'; }

// ── Démarrage quiz ───────────────────────────────────────
async function startQuiz() {
  const [mapRows, charRows] = await Promise.all([fetchCsv('questions_map'), fetchCsv('characters')]);

  // Construire questions groupées
  const qMap = {};
  mapRows.forEach(r => {
    if (!qMap[r.question_id]) qMap[r.question_id] = { id: r.question_id, label: r.question_label, answers: {} };
    if (!qMap[r.question_id].answers[r.answer_key]) qMap[r.question_id].answers[r.answer_key] = { key: r.answer_key, label: r.answer_label, deltas: [] };
    qMap[r.question_id].answers[r.answer_key].deltas.push({ axis: r.axis, delta: Number(r.delta) });
  });
  state.questions = Object.values(qMap).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
  state.characters = charRows;
  state.answers = {};
  state.currentQ = 0;

  document.getElementById('step-pseudo').style.display = 'none';
  document.getElementById('step-quiz').style.display = 'block';
  renderQuestion();
}

// ── Rendu question ───────────────────────────────────────
function renderQuestion() {
  const q   = state.questions[state.currentQ];
  const tot = state.questions.length;
  const pct = ((state.currentQ) / tot * 100).toFixed(1);
  document.getElementById('quiz-progress-fill').style.width = pct + '%';
  document.getElementById('quiz-progress-label').textContent = `Question ${state.currentQ+1} / ${tot}`;
  document.getElementById('quiz-q-num').textContent = q.id;
  document.getElementById('quiz-q-label').textContent = q.label;

  const answersEl = document.getElementById('quiz-answers');
  answersEl.innerHTML = Object.values(q.answers).map(a => `
    <button class="quiz-answer-btn" onclick="selectAnswer('${a.key}')">
      <span class="quiz-answer-key">${a.key}</span>
      <span>${a.label}</span>
    </button>`).join('');
}

function selectAnswer(key) {
  const q = state.questions[state.currentQ];
  state.answers[q.id] = key;

  // Animation
  document.querySelectorAll('.quiz-answer-btn').forEach(btn => {
    if (btn.querySelector('.quiz-answer-key').textContent === key) btn.classList.add('selected');
  });

  setTimeout(() => {
    state.currentQ++;
    if (state.currentQ >= state.questions.length) { computeResult(); }
    else { renderQuestion(); }
  }, 320);
}

// ── Calcul résultat ──────────────────────────────────────
async function computeResult() {
  document.getElementById('step-quiz').style.display = 'none';

  // Profil brut
  const raw = Object.fromEntries(AXES.map(a=>[a,0]));
  state.questions.forEach(q => {
    const key = state.answers[q.id];
    if (!key || !q.answers[key]) return;
    q.answers[key].deltas.forEach(({axis,delta}) => { if(raw[axis]!==undefined) raw[axis]+=delta; });
  });

  // Normalisation 0-100
  const profile = Object.fromEntries(AXES.map(a=>[a, Math.max(0,Math.min(100,50+raw[a]))]));

  // Score personnages
  const scored = scoreCharacters(profile, state.characters);
  const top5   = scored.slice(0,5);

  // Profil composite secondaire
  const weights   = softmaxWeights(top5);
  const composite = buildComposite(top5, weights);
  const adjusted  = blendProfiles(profile, composite, SECONDARY_INFLUENCE);

  // 2ème passe
  const final = scoreCharacters(adjusted, state.characters);
  const winner = final[0];
  const top5f  = final.slice(0,5);

  // Affiche résultat
  showResult(winner, top5f, adjusted);

  // Sauvegarde
  try {
    await fetch(`${WORKER_URL}/personnalite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo: state.pseudo, personnage: winner.nom, match_pct: Math.round(winner.matchPct), top5: JSON.stringify(top5f.map(c=>c.nom)) })
    });
  } catch(e) { console.warn('Save failed', e); }

  loadPersoCards();
}

function scoreCharacters(profile, characters) {
  return characters.map(c => {
    let dist = 0, maxDist = 0;
    AXES.forEach(a => {
      const w = AXIS_WEIGHTS[a]||1;
      dist    += Math.abs(profile[a] - Number(c[a]||0)) * w;
      maxDist += 100 * w;
    });
    return { ...c, matchPct: Math.max(0,Math.min(100,(1-dist/maxDist)*100)) };
  }).sort((a,b)=>b.matchPct-a.matchPct);
}

function softmaxWeights(top) {
  const T=8, exps=top.map(c=>Math.exp(c.matchPct/T)), sum=exps.reduce((a,b)=>a+b,0);
  return exps.map(v=>v/sum);
}

function buildComposite(top, weights) {
  const comp = Object.fromEntries(AXES.map(a=>[a,0]));
  top.forEach((c,i)=>AXES.forEach(a=>comp[a]+=Number(c[a]||0)*weights[i]));
  return comp;
}

function blendProfiles(p, comp, inf) {
  return Object.fromEntries(AXES.map(a=>[a, p[a]*(1-inf)+comp[a]*inf]));
}

function showResult(winner, top5, profile) {
  document.getElementById('result-name').textContent = winner.nom;
  document.getElementById('result-match').textContent = `Compatibilité : ${Math.round(winner.matchPct)}%`;
  document.getElementById('result-desc').textContent  = winner.description || '';

  document.getElementById('result-top5').innerHTML = top5.map((c,i)=>`
    <span class="result-top5-item${i===0?' first':''}">
      ${c.nom} — ${Math.round(c.matchPct)}%
    </span>`).join('');

  const axisLabels = {impulsivite:'Impuls.',empathie:'Empathie',loyaute:'Loyauté',ambition:'Ambition',humour:'Humour',agressivite:'Agressiv.',discipline:'Discip.',strategie:'Stratégie',idealisme:'Idéalism.',dominance:'Dominance'};
  document.getElementById('result-axes').innerHTML = AXES.map(a=>`
    <div class="result-axis">
      <div class="result-axis-label">${axisLabels[a]||a}</div>
      <div class="result-axis-bar"><div class="result-axis-fill" style="width:${Math.round(profile[a]||0)}%"></div></div>
      <div class="result-axis-val">${Math.round(profile[a]||0)}</div>
    </div>`).join('');

  document.getElementById('step-result').style.display = 'block';
}

function resetQuiz() {
  document.getElementById('step-result').style.display = 'none';
  document.getElementById('step-pseudo').style.display = 'block';
  document.getElementById('pseudo-input').value = '';
  document.getElementById('pseudo-error').style.display = 'none';
  document.getElementById('pseudo-btn').textContent = 'Continuer →';
  document.getElementById('pseudo-btn').disabled = false;
}

// ── Cards membres ─────────────────────────────────────────
async function loadPersoCards() {
  const wrap = document.getElementById('perso-cards');
  const count = document.getElementById('perso-count');
  try {
    const results = await fetchCsv('Personnalite');
    if (!results.length) { wrap.innerHTML = '<p class="empty-state">Aucun membre n\'a encore passé le quiz.</p>'; return; }
    if (count) count.textContent = `${results.length} membre${results.length>1?'s':''}`;
    wrap.innerHTML = results.sort((a,b)=>String(a.pseudo||'').localeCompare(String(b.pseudo||''))).map(r => `
      <div class="perso-card">
        <img class="perso-avatar" src="${WORKER_URL}/avatar/${r.discord_id||''}" alt=""
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1 1%22/>'">
        <div class="perso-pseudo">${r.pseudo||'—'}</div>
        <div class="perso-char">${r.personnage||'—'}</div>
        <div class="perso-match">${r.match_pct ? r.match_pct+'%' : ''}</div>
      </div>`).join('');
  } catch(e) { wrap.innerHTML = '<p class="empty-state">Erreur de chargement.</p>'; }
}

document.addEventListener('DOMContentLoaded', loadPersoCards);
</script>
