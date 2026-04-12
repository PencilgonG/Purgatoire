---
layout: default
title: Annonces
permalink: /pages/annonces/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Communauté</span>
    <h1>Annonces</h1>
    <p>Patch notes, actualités, maintenances et ressources partagées.</p>
  </div>
</section>

<section class="section-tight">
  <div class="ann-layout">

    <!-- 50% gauche : cartes annonces -->
    <div class="ann-left">
      <div id="annonces-list"></div>
    </div>

    <!-- 50% droite : liens utiles -->
    <div class="ann-right">
      <div class="liens-block">
        <span class="eyebrow" style="display:block;margin-bottom:12px">Accès rapide</span>
        <h2 class="liens-title">Liens utiles</h2>
        <ul class="liens-list">
          <li><a href="{{ '/pages/recrutement/' | relative_url }}">Recrutement</a></li>
          <li><a href="{{ '/pages/gdg/' | relative_url }}">Historique GDG</a></li>
          <li><a href="{{ '/pages/roster/' | relative_url }}">Roster complet</a></li>
          <li><a href="{{ '/pages/tierlist/' | relative_url }}">Tierlist</a></li>
          <li><a href="{{ '/pages/absences/' | relative_url }}">Absences</a></li>
          <li><a href="{{ '/pages/calendrier/' | relative_url }}">Calendrier</a></li>
        </ul>
      </div>
    </div>

  </div>
</section>

<style>
.ann-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 200px);
  border-top: 1px solid rgba(255,255,255,.06);
}

/* Gauche */
.ann-left {
  padding: 28px 32px 32px 40px;
  border-right: 1px solid rgba(255,255,255,.07);
  overflow-y: auto;
}

/* Card annonce */
.ann-card {
  background: transparent;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 12px;
  transition: border-color .2s, background .2s;
}
.ann-card:hover {
  border-color: rgba(201,151,62,.3);
  background: rgba(201,151,62,.03);
}
.ann-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.ann-card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f0ece0;
  margin-bottom: 5px;
}
.ann-card-desc {
  font-size: .82rem;
  color: rgba(153,147,170,.85);
  line-height: 1.65;
  margin-bottom: 10px;
}
.ann-card-links { display: flex; gap: 8px; flex-wrap: wrap; }
.ann-card-link {
  font-size: .72rem;
  color: rgba(201,151,62,.8);
  border: 1px solid rgba(201,151,62,.25);
  border-radius: 99px;
  padding: 3px 10px;
  transition: .15s;
  text-decoration: none;
}
.ann-card-link:hover { color: #e3b45a; border-color: rgba(201,151,62,.5); }

/* Droite */
.ann-right {
  padding: 28px 40px 32px 32px;
  display: flex;
  flex-direction: column;
}
.liens-block { position: sticky; top: 80px; }
.liens-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #f0ece0;
  margin-bottom: 20px;
}
.liens-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.liens-list li a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  font-size: .88rem;
  font-weight: 500;
  color: rgba(233,228,217,.7);
  border: 1px solid rgba(255,255,255,.07);
  border-left: 2px solid rgba(201,151,62,.3);
  border-radius: 8px;
  transition: color .18s, border-color .18s, background .18s;
  text-decoration: none;
}
.liens-list li a:hover {
  color: #f0ece0;
  border-color: rgba(201,151,62,.5);
  border-left-color: rgba(201,151,62,.8);
  background: rgba(201,151,62,.04);
}
.liens-list li a::before {
  content: '→';
  font-size: .75rem;
  color: rgba(201,151,62,.5);
  transition: color .18s;
}
.liens-list li a:hover::before { color: #e3b45a; }

@media (max-width: 768px) {
  .ann-layout { grid-template-columns: 1fr; }
  .ann-left, .ann-right { padding: 20px; border: none; }
}
</style>
