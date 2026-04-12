---
layout: default
title: Calendrier
permalink: /pages/calendrier/
---

<section class="page-hero compact">
  <div class="container">
    <span class="eyebrow">Guild</span>
    <h1>Calendrier</h1>
    <p>Événements à venir pour la guilde Purgatoire.</p>
  </div>
</section>

<section class="section-tight">
  <div class="container">
    <div id="cal-events"><div class="loading-state">Chargement…</div></div>
  </div>
</section>

<style>
.cal-event-card {
  background: transparent;
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  transition: border-color .2s, background .2s;
}
.cal-event-card:hover { border-color: rgba(201,151,62,.3); background: rgba(201,151,62,.03); }
.cal-event-date {
  text-align: center;
  min-width: 52px;
  background: rgba(255,255,255,.05);
  border-radius: 8px;
  padding: 8px 6px;
  flex-shrink: 0;
}
.cal-event-date .day   { font-family: var(--font-display); font-size: 1.6rem; font-weight: 700; color: var(--gold-bright); line-height: 1; }
.cal-event-date .month { font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-muted); }
.cal-event-body  { flex: 1; min-width: 0; }
.cal-event-title { font-weight: 700; font-size: .95rem; margin-bottom: 4px; }
.cal-event-desc  { font-size: .8rem; color: var(--text-secondary); margin-bottom: 8px; }
.cal-event-meta  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cal-countdown   { font-size: .75rem; font-weight: 700; font-family: monospace; color: var(--gold-bright); background: rgba(201,151,62,.12); padding: 2px 8px; border-radius: 99px; }
.cal-gcal-btn    { font-size: .72rem; color: var(--text-muted); border: 1px solid rgba(255,255,255,.1); border-radius: 99px; padding: 2px 8px; transition: .15s; }
.cal-gcal-btn:hover { border-color: rgba(201,151,62,.4); color: var(--gold-bright); }
.cal-allday      { font-size: .7rem; color: var(--text-muted); background: rgba(255,255,255,.06); padding: 2px 6px; border-radius: 99px; }
</style>

<script>
const WORKER_CAL = 'https://purgatoire-bot.originsguild.workers.dev';
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
  return `https://calendar.google.com/calendar/render?action=TEMPLATE`
    + `&text=${encodeURIComponent(ev.title)}`
    + `&dates=${fmt(ev.start)}/${fmt(ev.end)}`
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
    wrap.innerHTML = events.map(ev => {
      const d = new Date(ev.start);
      const time = ev.allDay ? '' : d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
      return `
        <div class="cal-event-card">
          <div class="cal-event-date">
            <div class="day">${d.getDate()}</div>
            <div class="month">${MONTHS_FR[d.getMonth()]}</div>
          </div>
          <div class="cal-event-body">
            <div class="cal-event-title">${ev.title}</div>
            ${ev.description ? `<div class="cal-event-desc">${ev.description.slice(0,120)}${ev.description.length>120?'…':''}</div>` : ''}
            <div class="cal-event-meta">
              ${ev.allDay ? `<span class="cal-allday">Toute la journée</span>` : `<span class="muted" style="font-size:.75rem">🕐 ${time}</span>`}
              <span class="cal-countdown" data-start="${ev.start}">${countdown(ev.start)}</span>
              ${ev.location ? `<span class="muted" style="font-size:.72rem">📍 ${ev.location}</span>` : ''}
              <a class="cal-gcal-btn" href="${gcalUrl(ev)}" target="_blank" rel="noopener">+ Google Calendar</a>
            </div>
          </div>
        </div>`;
    }).join('');
    setInterval(() => {
      document.querySelectorAll('.cal-countdown').forEach(el => el.textContent = countdown(el.dataset.start));
    }, 30000);
  } catch(e) {
    wrap.innerHTML = `<p class="empty-state">Erreur chargement calendrier.<br><small>${e.message}</small></p>`;
  }
}

document.addEventListener('DOMContentLoaded', renderCalendar);
</script>
