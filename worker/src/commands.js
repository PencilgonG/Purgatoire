import { embed, field, reply, replyEmbed, sendWebhook } from "./discord.js";
import { upsertMembre, appendRow, readSheet, formatCC, getGradeFromCC, getWeekKey } from "./sheets.js";

export async function handleCommand(interaction, env) {
  const name    = interaction.data.name;
  const options = interaction.data.options || [];
  const userId  = interaction.member?.user?.id || interaction.user?.id;
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username || "Inconnu";
  const getSub    = ()  => options[0]?.name ?? null;
  const getSubOpt = (n) => (options[0]?.options || []).find(o => o.name === n)?.value ?? null;

  try {
    switch (name) {
      case "cc":          return cmdCC(userId, pseudo, getSub(), getSubOpt, env);
      case "absence":     return cmdAbsence(userId, pseudo, getSub(), getSubOpt, env);
      case "tierlist":    return cmdTierlist(userId, getSub(), getSubOpt, env);
      case "calendrier":  return cmdCalendrier();
      case "recrutement": return cmdRecrutement(env);
      default:            return reply("❓ Commande non reconnue.");
    }
  } catch(e) {
    console.error(`[${name}]`, e);
    return reply("⚠️ Une erreur s'est produite.");
  }
}

async function cmdCC(userId, pseudo, sub, getOpt, env) {
  if (sub === "set") {
    const cc = parseInt(getOpt("valeur"));
    if (!cc || cc <= 0) return reply("❌ Valeur invalide.");
    let oldCC = 0;
    try {
      const membres = await readSheet(env, "Membres");
      const m = membres.find(r => r.discord_id === userId);
      if (m) oldCC = Number(m.cc) || 0;
    } catch {}
    const grade = getGradeFromCC(cc);
    await upsertMembre(env, userId, { pseudo, cc, grade });
    const diff    = cc - oldCC;
    const diffStr = diff > 0 ? `📈 +${formatCC(diff)}` : diff < 0 ? `📉 −${formatCC(Math.abs(diff))}` : "Premier enregistrement";
    return replyEmbed([embed({
      title: "⚡ CC mise à jour",
      fields: [
        field("Nouvelle CC", `**${formatCC(cc)}**`, true),
        field("Évolution",   diffStr,               true),
        field("Grade",       grade,                 true),
      ],
    })], null, true);
  }

  if (sub === "classement") {
    const membres = await readSheet(env, "Membres");
    const sorted  = membres.filter(m => m.cc > 0).sort((a,b) => Number(b.cc) - Number(a.cc)).slice(0,15);
    if (!sorted.length) return reply("📊 Aucune CC enregistrée. Utilise `/cc set` !");
    const medals = ["🥇","🥈","🥉"];
    const lines  = sorted.map((m,i) => `${medals[i] ?? `**#${i+1}**`} **${m.pseudo}** — ${m.cc_format || formatCC(m.cc)}`).join("\n");
    return replyEmbed([embed({ title: "⚡ Classement CC — Purgatoire", description: lines, color: 0xd97706 })]);
  }

  if (sub === "evolution") {
    const targetId = getOpt("membre") || userId;
    let history = [];
    try {
      const rows = await readSheet(env, "CC_Historique");
      history = rows.filter(r => r.discord_id === targetId).sort((a,b) => a.semaine > b.semaine ? 1 : -1).slice(-8);
    } catch {}
    if (history.length < 2) return reply("📈 Pas assez de données. Mets à jour ta CC chaque semaine !");
    const lines = history.map((h,i) => {
      const prev  = history[i-1];
      const diff  = prev ? Number(h.cc) - Number(prev.cc) : 0;
      const arrow = diff > 0 ? "📈" : diff < 0 ? "📉" : "➡️";
      const dStr  = diff !== 0 ? ` (${diff > 0 ? "+" : ""}${formatCC(diff)})` : "";
      return `**${h.semaine}** : ${formatCC(h.cc)}${dStr} ${arrow}`;
    });
    const total = Number(history[history.length-1].cc) - Number(history[0].cc);
    return replyEmbed([embed({
      title: `📈 Évolution CC — ${history[0].pseudo}`,
      description: lines.join("\n"),
      fields: [field("Progression totale", `${total >= 0 ? "+" : ""}${formatCC(total)} sur ${history.length} semaines`)],
    })], null, true);
  }

  return reply("❓ Sous-commande inconnue.");
}

async function cmdAbsence(userId, pseudo, sub, getOpt, env) {
  if (sub === "declarer") {
    const debut  = getOpt("debut");
    const fin    = getOpt("fin");
    const raison = getOpt("raison") || "";
    const parseDate = (s) => {
      if (!s) return null;
      const [d,m,y] = s.split("/").map(Number);
      if (!d||!m||!y) return null;
      return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    };
    const debutISO = parseDate(debut);
    const finISO   = parseDate(fin);
    if (!debutISO || !finISO) return reply("❌ Format invalide. Utilise **JJ/MM/AAAA**");
    if (debutISO > finISO)    return reply("❌ La date de début doit être avant la date de fin.");
    await appendRow(env, "Absences", [Date.now().toString(), userId, pseudo, debutISO, finISO, raison, "OUI"]);
    const wh = env.WEBHOOK_ANNONCES;
    if (wh) await sendWebhook(wh, { embeds: [embed({
      title: "😴 Absence déclarée",
      description: `**${pseudo}** sera absent(e) du **${debut}** au **${fin}**`,
      fields: raison ? [field("Raison", raison)] : [],
      color: 0x6e4fff,
    })]});
    return replyEmbed([embed({
      title: "✅ Absence enregistrée",
      fields: [field("Du", debut, true), field("Au", fin, true), ...(raison ? [field("Raison", raison)] : [])],
    })], null, true);
  }

  if (sub === "liste") {
    const rows    = await readSheet(env, "Absences");
    const today   = new Date().toISOString().slice(0,10);
    const actives = rows.filter(r => r.active === "OUI" && (r.fin||"") >= today);
    if (!actives.length) return reply("✅ Aucune absence en cours ou à venir.");
    const fmtD    = (s) => { if (!s) return "—"; const [y,m,d] = s.split("-"); return `${d}/${m}/${y}`; };
    const enCours = actives.filter(a => a.debut <= today);
    const avenir  = actives.filter(a => a.debut > today);
    const fields  = [];
    if (enCours.length) fields.push(field(`🔴 En cours (${enCours.length})`,
      enCours.map(a => `**${a.pseudo}** jusqu'au ${fmtD(a.fin)}`).join("\n")));
    if (avenir.length)  fields.push(field(`🟡 À venir (${avenir.length})`,
      avenir.map(a => `**${a.pseudo}** du ${fmtD(a.debut)} au ${fmtD(a.fin)}`).join("\n")));
    return replyEmbed([embed({ title: "😴 Absences — Purgatoire", fields })]);
  }

  return reply("❓ Sous-commande inconnue.");
}

async function cmdTierlist(userId, sub, getOpt, env) {
  if (sub === "voter") {
    const perso = getOpt("personnage");
    const tier  = getOpt("tier");
    if (!["S","A","B","C","D"].includes(tier)) return reply("❌ Tier invalide.");
    await appendRow(env, "Tierlist_Votes", [userId, perso, tier, new Date().toISOString()]);
    return replyEmbed([embed({
      title: "✅ Vote enregistré !",
      fields: [field("Personnage", perso, true), field("Tier", `**${tier}**`, true)],
    })], null, true);
  }

  if (sub === "voir") {
    const rows = await readSheet(env, "Tierlist");
    if (!rows.length) return reply("⭐ Aucun vote pour l'instant. Utilise `/tierlist voter` !");
    const sorted = [...rows].sort((a,b) => ({ S:0,A:1,B:2,C:3,D:4 }[a.tier_moyen]??5) - ({ S:0,A:1,B:2,C:3,D:4 }[b.tier_moyen]??5));
    const groups = {};
    sorted.forEach(e => { const t = e.tier_moyen||"B"; if (!groups[t]) groups[t] = []; groups[t].push(`**${e.personnage}** *(${e.total}v)*`); });
    const tEmoji = { S:"🔴",A:"🟠",B:"🟡",C:"🟢",D:"🔵" };
    const fields = Object.entries(groups).map(([t,chars]) => field(`${tEmoji[t]||""} Tier ${t}`, chars.join(" • ")));
    return replyEmbed([embed({ title: "⭐ Tierlist — 7DS Origin", fields, color: 0xd97706 })]);
  }

  return reply("❓ Sous-commande inconnue.");
}

function cmdCalendrier() {
  const now = new Date();
  const nextD = new Date(now);
  if (now.getUTCHours() >= 7) nextD.setUTCDate(nextD.getUTCDate()+1);
  nextD.setUTCHours(7,0,0,0);
  const dMs = nextD - now;
  const dH = Math.floor(dMs/3600000), dM = Math.floor((dMs%3600000)/60000);
  const day = now.getUTCDay();
  const toMon = day === 1 && now.getUTCHours() < 7 ? 0 : ((8-day)%7||7);
  const nextW = new Date(now);
  nextW.setUTCDate(now.getUTCDate()+toMon);
  nextW.setUTCHours(7,0,0,0);
  const wMs = nextW - now;
  const wD = Math.floor(wMs/86400000), wH = Math.floor((wMs%86400000)/3600000);
  const nextM = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1, 1, 7));
  const mD = Math.floor((nextM - now)/86400000);
  const paris = 7 + (isDST(now) ? 2 : 1);
  return replyEmbed([embed({
    title: "📅 Resets — 7DS Origin",
    description: `**07:00 UTC** = **${paris}h00 Paris**`,
    fields: [
      field(`🌅 Reset Quotidien — dans ${dH>0?`${dH}h ${dM}min`:`${dM}min`}`, "Missions · Boss · PVP · Boutique · Énergie"),
      field(`📆 Reset Hebdo (Lundi) — dans ${wD>0?`${wD}j ${wH}h`:`${wH}h`}`, "GDG · Donjon guilde · PVP · Boutique hebdo"),
      field(`📅 Reset Mensuel — dans ${mD} jours`, "Saison PVP · Classement guilde · Boutique mensuelle"),
    ],
    color: 0xd97706,
  })], null, true);
}

function isDST(d) {
  const j = new Date(d.getFullYear(),0,1).getTimezoneOffset();
  const t = new Date(d.getFullYear(),6,1).getTimezoneOffset();
  return d.getTimezoneOffset() < Math.max(j,t);
}

function cmdRecrutement(env) {
  const formUrl = env.FORM_RECRUTEMENT_URL || "Non configuré";
  return replyEmbed([embed({
    title: "📋 Recrutement — Purgatoire",
    description: `Tu veux rejoindre la guilde ?\n\n🔗 **[Remplir le formulaire](<${formUrl}>)**`,
    fields: [field("Prérequis", "CC compétitive · Actif en GDG · Respectueux")],
    color: 0xd97706,
  })]);
}
