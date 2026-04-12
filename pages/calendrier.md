---
layout: default
title: Calendrier
permalink: /pages/calendrier/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild</span>
    <h1>Calendrier & Discord</h1>
    <p>Événements à venir et membres en ligne sur le serveur.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container cal-layout">

    <div class="cal-main">
      <div class="panel-head" style="margin-bottom:16px">
        <div><span class="eyebrow">À venir</span><h2>Événements</h2></div>
      </div>
      <div id="cal-events"><div class="loading-state">Chargement…</div></div>
    </div>

    <aside class="cal-side">
      <div class="panel discord-widget-panel">
        <div class="panel-head" style="margin-bottom:16px">
          <div><span class="eyebrow">Serveur Discord</span><h2>En ligne</h2></div>
        </div>
        <div id="discord-widget"><div class="loading-state">Chargement…</div></div>
        <a id="discord-join-btn" class="button button-gold" href="#" target="_blank" rel="noopener"
           style="display:block;text-align:center;margin-top:16px">Rejoindre le Discord ↗</a>
      </div>
    </aside>

  </div>
</section>

<style>
.cal-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 32px;
  align-items: start;
}
@media (max-width: 768px) {
  .cal-layout { grid-template-columns: 1fr; }
  .cal-side   { order: -1; }
}

/* Events */
.cal-event-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: border-color .2s;
}
.cal-event-card:hover { border-color: var(--border-gold); }
.cal-event-date {
  text-align: center;
  min-width: 52px;
  background: var(--bg-elevated);
  border-radius: var(--radius);
  padding: 8px 6px;
  flex-shrink: 0;
}
.cal-event-date .day   { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--gold-bright); line-height: 1; }
.cal-event-date .month { font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); }
.cal-event-body  { flex: 1; min-width: 0; }
.cal-event-title { font-weight: 700; font-size: .95rem; margin-bottom: 4px; }
.cal-event-desc  { font-size: .8rem; color: var(--text-secondary); margin-bottom: 8px; white-space: pre-wrap; }
.cal-event-meta  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cal-countdown   { font-size: .75rem; font-weight: 700; font-family: monospace; color: var(--gold-bright); background: var(--gold-dim); padding: 2px 8px; border-radius: 99px; }
.cal-gcal-btn    { font-size: .72rem; color: var(--text-muted); text-decoration: none; border: 1px solid var(--border); border-radius: 99px; padding: 2px 8px; transition: .15s; }
.cal-gcal-btn:hover { border-color: var(--border-gold); color: var(--gold-bright); }
.cal-allday      { font-size: .7rem; color: var(--text-muted); background: var(--bg-elevated); padding: 2px 6px; border-radius: 99px; }

/* Discord widget */
.discord-widget-panel { padding: 20px; }
.discord-member {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}
.discord-member:last-child { border-bottom: none; }
.discord-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--bg-elevated);
}
.discord-status-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--bg-surface);
}
.status-online  { background: #4ade80; }
.status-idle    { background: #fb923c; }
.status-dnd     { background: #f87171; }
.discord-username { font-size: .85rem; font-weight: 600; flex: 1; }
.discord-game     { font-size: .7rem; color: var(--text-muted); }
.discord-count    { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--gold-bright); margin-bottom: 4px; }
</style>

<script>
const WORKER_CAL = 'https://purgatoire-bot.originsguild.workers.dev';
const DISCORD_GUILD = '1488740561262477474';
const MONTHS_FR = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

function countdown(start) {
  const diff = new Date(start) - new Date();
  if (diff <= 0) return 'En cours';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `Dans ${d}j ${h}h`;
  if (h > 0) return `Dans ${h}h ${m}min`;
  return `Dans ${m}min`;
}

function gcalUrl(ev) {
  const fmt = d => d ? new Date(d).toISOString().replace(/[-:]/g,'').slice(0,15)+'Z' : '';
  const start = fmt(ev.start);
  const end   = fmt(ev.end);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent(ev.title)}`
    + `&dates=${start}/${end}`
    + `&details=${encodeURIComponent(ev.description||'')}`
    + `&location=${encodeURIComponent(ev.location||'')}`;
}

async function renderCalendar() {
  const wrap = document.getElementById('cal-events');
  if (!wrap) return;
  try {
    const res    = await fetch(`${WORKER_CAL}/calendar-events`);
    const events = await res.json();
    if (events.error) throw new Error(events.error);
    if (!events.length) { wrap.innerHTML = '<p class="empty-state">Aucun événement à venir.</p>'; return; }

    // Ticker pour rafraîchir les countdowns
    let html = events.map(ev => {
      const d     = new Date(ev.start);
      const day   = d.getDate();
      const month = MONTHS_FR[d.getMonth()];
      const time  = ev.allDay ? '' : d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
      return `
        <div class="cal-event-card">
          <div class="cal-event-date">
            <div class="day">${day}</div>
            <div class="month">${month}</div>
          </div>
          <div class="cal-event-body">
            <div class="cal-event-title">${ev.title}</div>
            ${ev.description ? `<div class="cal-event-desc">${ev.description.slice(0,120)}${ev.description.length>120?'…':''}</div>` : ''}
            <div class="cal-event-meta">
              ${ev.allDay
                ? `<span class="cal-allday">Toute la journée</span>`
                : `<span class="muted" style="font-size:.75rem">🕐 ${time}</span>`}
              <span class="cal-countdown" data-start="${ev.start}">${countdown(ev.start)}</span>
              ${ev.location ? `<span class="muted" style="font-size:.72rem">📍 ${ev.location}</span>` : ''}
              <a class="cal-gcal-btn" href="${gcalUrl(ev)}" target="_blank" rel="noopener">+ Google Calendar</a>
            </div>
          </div>
        </div>`;
    }).join('');
    wrap.innerHTML = html;

    // Rafraîchit les countdowns toutes les 30s
    setInterval(() => {
      wrap.querySelectorAll('.cal-countdown').forEach(el => {
        el.textContent = countdown(el.dataset.start);
      });
    }, 30000);
  } catch(e) {
    wrap.innerHTML = `<p class="empty-state">Erreur chargement calendrier.<br><small>${e.message}</small></p>`;
  }
}

async function renderDiscordWidget() {
  const wrap = document.getElementById('discord-widget');
  const btn  = document.getElementById('discord-join-btn');
  if (!wrap) return;
  try {
    const res  = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD}/widget.json`);
    const data = await res.json();
    if (data.code === 50004) {
      wrap.innerHTML = '<p class="muted" style="font-size:.8rem">Active le widget dans les paramètres Discord du serveur pour voir les membres en ligne.</p>';
      return;
    }
    if (btn && data.instant_invite) btn.href = data.instant_invite;
    const members = (data.members || []).slice(0, 15);
    const count   = data.presence_count || members.length;
    wrap.innerHTML = `
      <div class="discord-count">${count}</div>
      <div class="muted" style="font-size:.75rem;margin-bottom:12px">membre${count>1?'s':''} en ligne</div>
      ${members.map(m => `
        <div class="discord-member">
          <img class="discord-avatar" src="${m.avatar_url||''}" alt="" onerror="this.style.opacity='.3'">
          <div style="flex:1;min-width:0">
            <div class="discord-username">${m.username||'—'}</div>
            ${m.game?.name ? `<div class="discord-game">🎮 ${m.game.name}</div>` : ''}
          </div>
          <div class="discord-status-dot status-${m.status||'online'}"></div>
        </div>`).join('')}`;

    // Rafraîchit toutes les 60s
    setInterval(renderDiscordWidget, 60000);
  } catch(e) {
    wrap.innerHTML = '<p class="muted" style="font-size:.8rem">Widget Discord indisponible.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar();
  renderDiscordWidget();
});
</script>
