---
layout: default
title: Annonces
permalink: /pages/annonces/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Communauté</span>
    <h1>Annonces</h1>
    <p>Patch notes, actualités, maintenances, liens Notion et ressources partagées.</p>
  </div>
</section>

<section class="section section-tight">
  <div class="container annonces-layout">
    <section class="annonces-main">
      <div id="annonce-featured"></div>
      <div id="annonces-list" class="cards-grid cards-grid-annonces"></div>
    </section>

    <aside class="panel annonces-side">
      <div class="panel-head">
        <div>
          <span class="eyebrow">Accès rapide</span>
          <h2>Liens utiles</h2>
        </div>
      </div>
      <div class="side-stack">
        <a class="quick-link" href="{{ '/pages/recrutement/' | relative_url }}">Recrutement</a>
        <a class="quick-link" href="{{ '/pages/gdg/' | relative_url }}">Historique GDG</a>
        <a class="quick-link" href="{{ '/pages/roster/' | relative_url }}">Roster complet</a>
      </div>
    </aside>
  </div>
</section>
