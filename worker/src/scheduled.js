import { sendWebhook, embed, field } from "./discord.js";
import { readSheet, appendRow, formatCC, getWeekKey } from "./sheets.js";

export async function handleScheduled(event, env) {
  const cron = event.cron;
  if (cron === "0 9 * * 1") { await weeklyReport(env); await snapshotCC(env); }
  if (cron === "0 9 1 * *")  await monthlyReport(env);
  if (cron === "0 10 * * *") await checkCCProgress(env);
}

async function weeklyReport(env) {
  const wh = env.WEBHOOK_NOTIF;
  if (!wh) return;
  let membres = [], gdg = [], absences = [];
  try { membres  = await readSheet(env, "Membres"); }  catch {}
  try { gdg      = await readSheet(env, "GDG"); }      catch {}
  try { absences = await readSheet(env, "Absences"); } catch {}
  const today  = new Date().toISOString().slice(0,10);
  const actifs = membres.filter(m => m.cc > 0).sort((a,b) => Number(b.cc) - Number(a.cc));
  const topCC  = actifs.slice(0,5);
  const absCurr = absences.filter(a => a.active === "OUI" && (a.fin||"") >= today);
  const lastGDG = [...gdg].reverse().slice(0,3);
  const medals  = ["🥇","🥈","🥉","4️⃣","5️⃣"];
  const ccLines = topCC.length
    ? topCC.map((m,i) => `${medals[i]} **${m.pseudo}** — ${m.cc_format || formatCC(m.cc)}`).join("\n")
    : "Aucune donnée";
  const gdgLines = lastGDG.length
    ? lastGDG.map(g => {
        const r = String(g.resultat||"").toLowerCase();
        const e = r === "victoire" ? "🏆" : r.includes("d") ? "💀" : "🤝";
        return `${e} **${g.nom||"?"}** vs ${g.ennemi||"?"} — ${g.resultat||"?"}`;
      }).join("\n")
    : "Aucun GDG récent";
  await sendWebhook(wh, { embeds: [embed({
    title: "📊 Rapport Hebdomadaire — Purgatoire",
    description: `Bilan de la semaine · **${actifs.length} membres actifs**`,
    fields: [
      field("⚡ Top 5 CC", ccLines),
      field("⚔️ Derniers GDG", gdgLines),
      field("😴 Absences en cours", absCurr.length > 0
        ? absCurr.map(a => `**${a.pseudo}** jusqu'au ${a.fin}`).join("\n")
        : "Aucune"),
    ],
    color: 0xd97706,
  })]});
}

async function snapshotCC(env) {
  let membres = [];
  try { membres = await readSheet(env, "Membres"); } catch { return; }
  const semaine = getWeekKey();
  const now     = new Date().toISOString();
  for (const m of membres) {
    if (!m.discord_id || !m.cc) continue;
    try { await appendRow(env, "CC_Historique", [m.discord_id, m.pseudo, m.cc, semaine, now]); } catch {}
  }
}

async function monthlyReport(env) {
  const wh = env.WEBHOOK_NOTIF;
  if (!wh) return;
  let membres = [], gdg = [];
  try { membres = await readSheet(env, "Membres"); } catch {}
  try { gdg     = await readSheet(env, "GDG"); }    catch {}
  const actifs    = membres.filter(m => m.cc > 0).sort((a,b) => Number(b.cc) - Number(a.cc));
  const victoires = gdg.filter(g => String(g.resultat||"").toLowerCase() === "victoire").length;
  const defaites  = gdg.filter(g => ["defaite","défaite"].includes(String(g.resultat||"").toLowerCase())).length;
  const mois = new Date().toLocaleString("fr-FR", { month: "long", year: "numeric" });
  await sendWebhook(wh, { embeds: [embed({
    title: `📅 Rapport Mensuel — ${mois}`,
    fields: [
      field("👥 Membres actifs", String(actifs.length), true),
      field("⚡ Meilleure CC", actifs[0] ? `${formatCC(actifs[0].cc)} (${actifs[0].pseudo})` : "—", true),
      field("⚔️ Bilan GDG", `🏆 ${victoires} victoires · 💀 ${defaites} défaites`),
    ],
    color: 0xd97706,
  })]});
}

async function checkCCProgress(env) {
  const wh = env.WEBHOOK_NOTIF;
  if (!wh) return;
  let membres = [], history = [];
  try { membres = await readSheet(env, "Membres"); }       catch { return; }
  try { history = await readSheet(env, "CC_Historique"); } catch { return; }
  const sems = [...new Set(history.map(r => r.semaine))].sort().reverse();
  if (sems.length < 2) return;
  const [currSem, prevSem] = sems;
  const progres = [];
  membres.forEach(m => {
    const curr = history.find(r => r.discord_id === m.discord_id && r.semaine === currSem);
    const prev = history.find(r => r.discord_id === m.discord_id && r.semaine === prevSem);
    if (!curr || !prev) return;
    const diff = Number(curr.cc) - Number(prev.cc);
    if (diff >= 500000) progres.push({ pseudo: m.pseudo, diff, cc: curr.cc });
  });
  if (!progres.length) return;
  const lines = progres.sort((a,b) => b.diff - a.diff)
    .map(p => `📈 **${p.pseudo}** +${formatCC(p.diff)} → **${formatCC(p.cc)}**`)
    .join("\n");
  await sendWebhook(wh, { embeds: [embed({
    title: "⚡ Progression CC cette semaine !",
    description: lines,
    color: 0x2ea87a,
  })]});
}
