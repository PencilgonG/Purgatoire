import { embed, field, reply, replyEmbed, sendWebhook } from "./discord.js";
import { upsertMembre, appendRow, readSheet, formatCC, getGradeFromCC, getWeekKey } from "./sheets.js";

// ── Détection guilde (G1 / G2) via rôle Discord ──────────────────────────
function getGuildSuffix(interaction, env) {
  if (!env.ROLE_GUILD2) return '';
  const roles = interaction.member?.roles || [];
  return roles.includes(env.ROLE_GUILD2) ? '2' : '';
}
// Retourne le bon sheet ID selon la guilde
function getSheetId(env, suffix) {
  return suffix === '2' ? (env.GOOGLE_SHEET_ID_2 || env.GOOGLE_SHEET_ID) : env.GOOGLE_SHEET_ID;
}
// Surcharge env avec le bon GOOGLE_SHEET_ID pour la guilde active
function envForGuild(env, suffix) {
  if (suffix !== '2') return env;
  return { ...env, GOOGLE_SHEET_ID: env.GOOGLE_SHEET_ID_2 || env.GOOGLE_SHEET_ID };
}


export async function handleCommand(interaction, env) {
  const name    = interaction.data.name;
  const options = interaction.data.options || [];
  const userId  = interaction.member?.user?.id || interaction.user?.id;
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username || "Inconnu";
  const getSub    = ()  => options[0]?.name ?? null;
  const getSubOpt = (n) => (options[0]?.options || []).find(o => o.name === n)?.value ?? null;

  // Détecte automatiquement si le membre est G1 ou G2 via son rôle
  const suffix  = getGuildSuffix(interaction, env);
  const guildEnv = envForGuild(env, suffix);

  try {
    switch (name) {
      case "cc":          return cmdCC(userId, pseudo, getSub(), getSubOpt, guildEnv);
      case "absence":     return cmdAbsence(userId, pseudo, getSub(), getSubOpt, guildEnv);
      case "tierlist":    return cmdTierlist(userId, getSub(), getSubOpt, env);
      case "perso":       return cmdPerso(interaction, env);
      case "team":        return cmdTeam(interaction, env);
      case "profil":      return cmdProfil(interaction, env);
      case "annonce":     return cmdAnnonce(interaction, env);
      case "gdg":         return cmdGDG(interaction, env);
      case "calendrier":  return cmdCalendrier();
      case "recrutement": return cmdRecrutement(env);
      case "recruteur":   return cmdRecruteur(interaction, env);
      case "contrat":     return cmdContrat(interaction, env);
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

    // Récupère l'avatar Discord
    let avatar_url = "";
    try {
      const userRes  = await fetch(`https://discord.com/api/v10/users/${userId}`, {
        headers: { Authorization: `Bot ${env.DISCORD_TOKEN}` }
      });
      const userData = await userRes.json();
      if (userData.avatar) {
        avatar_url = `https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png?size=128`;
      } else {
        const idx = (BigInt(userId) >> 22n) % 6n;
        avatar_url = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
      }
    } catch {}

    await upsertMembre(env, userId, { pseudo, cc, grade, avatar_url });
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
    await recalcTierlist(env, perso);
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

async function recalcTierlist(env, personnage) {
  const votes = await readSheet(env, "Tierlist_Votes");
  const persoVotes = votes.filter(r => r.personnage === personnage);
  // Déduplique : 1 vote par utilisateur, on garde le plus récent
  const lastVoteByUser = {};
  persoVotes.forEach(r => {
    if (!lastVoteByUser[r.discord_id] ||
        new Date(r.date) > new Date(lastVoteByUser[r.discord_id].date)) {
      lastVoteByUser[r.discord_id] = r;
    }
  });
  const deduped = Object.values(lastVoteByUser);
  const counts = { S:0, A:0, B:0, C:0, D:0 };
  deduped.forEach(r => { if (counts[r.tier] !== undefined) counts[r.tier]++; });
  const total = Object.values(counts).reduce((a,b) => a+b, 0);
  const tierOrder = { S:5, A:4, B:3, C:2, D:1 };
  const avg = total > 0 ? Object.entries(counts).reduce((s,[t,c]) => s + tierOrder[t]*c, 0) / total : 0;
  const tierMoyen = ["D","C","B","A","S"][Math.round(avg) - 1] || "B";

  const existing = await readSheet(env, "Tierlist");
  const idx = existing.findIndex(r => r.personnage === personnage);

  if (idx !== -1) {
    const token = await getToken(env);
    const rowNum = idx + 2;
    const range = `Tierlist!A${rowNum}:H${rowNum}`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ range, majorDimension: "ROWS", values: [[personnage, counts.S, counts.A, counts.B, counts.C, counts.D, total, tierMoyen]] }) }
    );
  } else {
    await appendRow(env, "Tierlist", [personnage, counts.S, counts.A, counts.B, counts.C, counts.D, total, tierMoyen]);
  }
}

async function getToken(env) {
  const pem = env.GOOGLE_PRIVATE_KEY.replace(/-----BEGIN PRIVATE KEY-----/g,"").replace(/-----END PRIVATE KEY-----/g,"").replace(/\\n/g,"").replace(/\n/g,"").replace(/\s/g,"");
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", keyData, { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" }, false, ["sign"]);
  const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  const jb = (o) => b64url(new TextEncoder().encode(JSON.stringify(o)));
  const now = Math.floor(Date.now()/1000);
  const h = jb({ alg:"RS256", typ:"JWT" });
  const p = jb({ iss:env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope:"https://www.googleapis.com/auth/spreadsheets", aud:"https://oauth2.googleapis.com/token", iat:now, exp:now+3600 });
  const sig = await crypto.subtle.sign({ name:"RSASSA-PKCS1-v1_5" }, key, new TextEncoder().encode(`${h}.${p}`));
  const jwt = `${h}.${p}.${b64url(sig)}`;
  const res = await fetch("https://oauth2.googleapis.com/token", { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:`grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}` });
  const data = await res.json();
  return data.access_token;
}

// ══════════════════════════════════════════════════════════════
//  /perso ajouter | liste
// ══════════════════════════════════════════════════════════════
export async function cmdPerso(interaction, env) {
  const options = interaction.data.options || [];
  const sub     = options[0]?.name;
  const userId  = interaction.member?.user?.id || interaction.user?.id;
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username || "Inconnu";

  if (sub === "ajouter") {
    const subOpts  = options[0]?.options || [];
    const perso    = subOpts.find(o => o.name === "personnage")?.value;
    const potentiel = subOpts.find(o => o.name === "potentiel")?.value ?? 0;

    if (!perso) return reply("❌ Personnage manquant.");

    // Upsert dans onglet Persos
    const rows = await readSheet(env, "Persos");
    const idx  = rows.findIndex(r => r.discord_id === userId && r.personnage === perso);

    if (idx !== -1) {
      // Update
      const token  = await getToken(env);
      const rowNum = idx + 2;
      const range  = `Persos!A${rowNum}:E${rowNum}`;
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ range, majorDimension: "ROWS", values: [[userId, pseudo, perso, potentiel, new Date().toISOString().slice(0,10)]] }) }
      );
    } else {
      await appendRow(env, "Persos", [userId, pseudo, perso, potentiel, new Date().toISOString().slice(0,10)]);
    }

    const bar = "█".repeat(potentiel) + "░".repeat(10 - potentiel);
    return replyEmbed([embed({
      title: "⚔️ Personnage enregistré",
      fields: [
        field("Personnage", perso,                           true),
        field("Potentiel",  `${bar} **${potentiel}/10**`,   true),
      ],
    })], null, true);
  }

  if (sub === "liste") {
    const rows  = await readSheet(env, "Persos");
    const persos = rows.filter(r => r.discord_id === userId);
    if (!persos.length) return reply("❌ Tu n'as aucun personnage enregistré. Utilise `/perso ajouter` !");
    const bar = (n) => "█".repeat(Number(n)||0) + "░".repeat(10-(Number(n)||0));
    const lines = persos.map(p =>
      `⚔️ **${p.personnage}** — ${bar(p.potentiel)} **${p.potentiel}/10**`
    ).join("\n");
    return replyEmbed([embed({ title: "⚔️ Tes personnages", description: lines })], null, true);
  }

  return reply("❓ Sous-commande inconnue.");
}

// ══════════════════════════════════════════════════════════════
//  /team <url>
// ══════════════════════════════════════════════════════════════
export async function cmdTeam(interaction, env) {
  const options = interaction.data.options || [];
  const url     = options.find(o => o.name === "url")?.value;
  const userId  = interaction.member?.user?.id || interaction.user?.id;
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username || "Inconnu";

  if (!url) return reply("❌ URL manquante.");
  if (!url.startsWith("http")) return reply("❌ URL invalide. Colle un lien direct vers ton image (imgur, discord...)");

  await upsertMembre(env, userId, { pseudo, team_photo: url });

  return replyEmbed([embed({
    title: "📸 Photo de team enregistrée !",
    description: `[Voir la photo](${url})`,
    fields: [field("Astuce", "Utilise `/profil` pour voir ta fiche complète.")],
  })], null, true);
}

// ══════════════════════════════════════════════════════════════
//  /profil
// ══════════════════════════════════════════════════════════════
export async function cmdProfil(interaction, env) {
  const options  = interaction.data.options || [];
  const targetId = options.find(o => o.name === "membre")?.value
    || interaction.member?.user?.id || interaction.user?.id;

  const [membres, persos] = await Promise.all([
    readSheet(env, "Membres"),
    readSheet(env, "Persos"),
  ]);

  const membre  = membres.find(m => m.discord_id === targetId);
  const myPersos = persos.filter(p => p.discord_id === targetId);

  if (!membre) return reply("❌ Aucun profil trouvé. Utilise `/cc set` pour créer ton profil !");

  const bar = (n) => "█".repeat(Number(n)||0) + "░".repeat(10-(Number(n)||0));

  const fields = [
    field("⚡ Combat Class", `**${membre.cc_format || formatCC(membre.cc || 0)}**`, true),
    field("🎖️ Grade",        membre.grade || "Recrue",                              true),
  ];

  if (myPersos.length) {
    fields.push(field(
      "⚔️ Personnages",
      myPersos.map(p => `**${p.personnage}** — ${bar(p.potentiel)} ${p.potentiel}/10`).join("\n")
    ));
  }

  if (membre.team_photo) {
    fields.push(field("📸 Team", `[Voir la photo](${membre.team_photo})`));
  }

  return replyEmbed([{
    ...embed({ title: `⚔️ Profil — ${membre.pseudo || "Inconnu"}`, fields }),
    image: membre.team_photo ? { url: membre.team_photo } : undefined,
  }], null, true);
}

// ══════════════════════════════════════════════════════════════
//  /annonce creer | supprimer  (officiers seulement)
// ══════════════════════════════════════════════════════════════
export async function cmdAnnonce(interaction, env) {
  const options = interaction.data.options || [];
  const sub     = options[0]?.name;
  const subOpts = options[0]?.options || [];
  const userId  = interaction.member?.user?.id || interaction.user?.id;
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username;

  // Vérif rôle officier
  const roles = interaction.member?.roles || [];
  const officierRoleId = env.OFFICIER_ROLE_ID;
  if (officierRoleId && !roles.includes(officierRoleId)) {
    return reply("🚫 Cette commande est réservée aux officiers.");
  }

  if (sub === "creer") {
    const titre     = subOpts.find(o => o.name === "titre")?.value || "";
    const desc      = subOpts.find(o => o.name === "description")?.value || "";
    const categorie = subOpts.find(o => o.name === "categorie")?.value || "Annonce";
    const image     = subOpts.find(o => o.name === "image")?.value || "";
    const epingle   = subOpts.find(o => o.name === "epingle")?.value === "oui" ? "OUI" : "NON";
    const date      = new Date().toISOString().slice(0, 10);

    await appendRow(env, "Annonces", [titre, desc, categorie, date, "OUI", epingle, image, "", ""]);

    // Webhook annonces
    const wh = env.WEBHOOK_ANNONCES;
    if (wh) {
      await sendWebhook(wh, { embeds: [embed({
        title: "📣 " + titre,
        description: desc,
        fields: [
          field("Catégorie", categorie, true),
          field("Par", pseudo, true),
          ...(epingle === "OUI" ? [field("", "📌 Épinglée")] : []),
        ],
        color: 0xd97706,
      })]});
    }

    return replyEmbed([embed({
      title: "✅ Annonce publiée !",
      fields: [
        field("Titre",     titre,     true),
        field("Catégorie", categorie, true),
        field("Épinglée",  epingle,   true),
      ],
    })], null, true);
  }

  if (sub === "supprimer") {
    const titre = subOpts.find(o => o.name === "titre")?.value;
    if (!titre) return reply("❌ Titre manquant.");

    // Cherche la ligne dans le Sheet et met publie = NON
    const token  = await getToken(env);
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Annonces`;
    const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
    const sheet  = await getRes.json();
    const values = sheet.values || [];

    const rowIndex = values.findIndex((r, i) => i > 0 && r[0] === titre);
    if (rowIndex === -1) return reply("❌ Annonce introuvable : **" + titre + "**");

    const lineNum = rowIndex + 1;
    const range   = `Annonces!E${lineNum}`;
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ range, majorDimension: "ROWS", values: [["NON"]] }),
      }
    );

    return replyEmbed([embed({
      title: "🗑️ Annonce supprimée",
      fields: [field("Titre", titre)],
      color: 0xc94f4f,
    })], null, true);
  }

  return reply("❓ Sous-commande inconnue.");
}

// ══════════════════════════════════════════════════════════════
//  /gdg declarer (officiers seulement)
// ══════════════════════════════════════════════════════════════
export async function cmdGDG(interaction, env) {
  const options = interaction.data.options || [];
  const sub     = options[0]?.name;
  const subOpts = options[0]?.options || [];
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username;

  // Vérif rôle officier
  const roles = interaction.member?.roles || [];
  const officierRoleId = env.OFFICIER_ROLE_ID;
  if (officierRoleId && !roles.includes(officierRoleId)) {
    return reply("🚫 Cette commande est réservée aux officiers.");
  }

  if (sub === "declarer") {
    const ennemi       = subOpts.find(o => o.name === "ennemi")?.value || "?";
    const resultat     = subOpts.find(o => o.name === "resultat")?.value || "nul";
    const notre_score  = subOpts.find(o => o.name === "notre_score")?.value || 0;
    const score_ennemi = subOpts.find(o => o.name === "score_ennemi")?.value || 0;
    const notes        = subOpts.find(o => o.name === "notes")?.value || "";
    const date         = new Date().toISOString().slice(0, 10);
    const id           = Date.now().toString();

    await appendRow(env, "GDG", [id, "GDG", ennemi, date, resultat, notre_score, score_ennemi, notes]);

    const emoji = resultat === "victoire" ? "🏆" : resultat === "defaite" ? "💀" : "🤝";
    const color = resultat === "victoire" ? 0x2ea87a : resultat === "defaite" ? 0xc94f4f : 0x6e4fff;

    // Webhook notif
    const wh = env.WEBHOOK_NOTIF;
    if (wh) {
      await sendWebhook(wh, { embeds: [embed({
        title: `${emoji} GDG — ${resultat.charAt(0).toUpperCase() + resultat.slice(1)} contre ${ennemi}`,
        fields: [
          field("⚔️ Purgatoire", String(notre_score),  true),
          field("🔴 " + ennemi,  String(score_ennemi), true),
          field("📅 Date",        date,                 true),
          ...(notes ? [field("📝 Notes", notes)] : []),
        ],
        color,
      })]});
    }

    return replyEmbed([embed({
      title: `${emoji} GDG enregistré !`,
      fields: [
        field("Adversaire",    ennemi,            true),
        field("Résultat",      resultat,          true),
        field("Score",         `${notre_score} — ${score_ennemi}`, true),
      ],
      color,
    })], null, true);
  }

  return reply("❓ Sous-commande inconnue.");
}


// ══════════════════════════════════════════════════════════════
//  /recruteur set @membre
// ══════════════════════════════════════════════════════════════
export async function cmdRecruteur(interaction, env) {
  const options  = interaction.data.options || [];
  const sub      = options[0]?.name;
  const subOpts  = options[0]?.options || [];
  const userId   = interaction.member?.user?.id || interaction.user?.id;
  const pseudo   = interaction.member?.nick || interaction.member?.user?.username || "Inconnu";

  if (sub === "set") {
    const targetId    = subOpts.find(o => o.name === "recrue")?.value;
    if (!targetId) return reply("❌ Mentionne la recrue.");

    // Récupère pseudo recrue
    let recruePseudo = "";
    try {
      const membres = await readSheet(env, "Membres");
      const m = membres.find(r => r.discord_id === targetId);
      if (!m) return reply("❌ Ce membre n'est pas enregistré. Il doit d'abord faire /cc set.");
      recruePseudo = m.pseudo;
    } catch {}

    // Vérifie si déjà dans l'arbre
    try {
      const arbre = await readSheet(env, "Arbre");
      const exists = arbre.find(r => r.discord_id === targetId);
      if (exists) return reply(`❌ ${recruePseudo} a déjà un recruteur enregistré : **${exists.recruteur_pseudo}**.`);
    } catch {}

    const date = new Date().toISOString().slice(0, 10);
    await appendRow(env, "Arbre", [targetId, recruePseudo, userId, pseudo, date]);

    // Activité
    try { await appendRow(env, "Activite", [new Date().toISOString(), "recrutement", `🌿 **${pseudo}** a recruté **${recruePseudo}**`, userId, ""]); } catch {}

    return replyEmbed([embed({
      title: "🌿 Lien de recrutement enregistré",
      description: `**${recruePseudo}** a été recruté(e) par **${pseudo}**`,
      color: 0x2ea87a,
    })], null, true);
  }

  if (sub === "voir") {
    let arbre = [];
    try { arbre = await readSheet(env, "Arbre"); } catch {}
    const recrues = arbre.filter(r => r.recruteur_id === userId);
    if (!recrues.length) return reply("🌿 Tu n'as encore recruté personne.");
    const lines = recrues.map(r => `• **${r.pseudo}** — recruté le ${r.date}`).join("\n");
    return replyEmbed([embed({
      title: `🌿 Recrues de ${pseudo}`,
      description: lines,
      color: 0x2ea87a,
    })], null, true);
  }

  return reply("❓ Sous-commande inconnue.");
}

// ══════════════════════════════════════════════════════════════
//  /contrat set|voir|liste
// ══════════════════════════════════════════════════════════════
export async function cmdContrat(interaction, env) {
  const options = interaction.data.options || [];
  const sub     = options[0]?.name;
  const subOpts = options[0]?.options || [];
  const userId  = interaction.member?.user?.id || interaction.user?.id;
  const pseudo  = interaction.member?.nick || interaction.member?.user?.username || "Inconnu";

  if (sub === "set") {
    const objectifRaw = subOpts.find(o => o.name === "objectif")?.value || "";
    const dateStr     = subOpts.find(o => o.name === "date")?.value || "";

    const objectif = parseInt(String(objectifRaw).replace(/[^\d]/g, ""));
    if (!objectif || objectif <= 0) return reply("❌ Objectif invalide. Ex: 2000000");

    // Parse date JJ/MM/AAAA
    let dateISO = "";
    try {
      const [d, m, y] = dateStr.split("/");
      dateISO = `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
      if (isNaN(new Date(dateISO).getTime())) throw new Error("invalid");
    } catch { return reply("❌ Date invalide. Format : JJ/MM/AAAA"); }

    // CC actuelle
    let ccActuelle = 0;
    try {
      const membres = await readSheet(env, "Membres");
      const m = membres.find(r => r.discord_id === userId);
      if (m) ccActuelle = Number(m.cc) || 0;
    } catch {}

    if (objectif <= ccActuelle) return reply(`❌ Ton objectif (${formatCC(objectif)}) est déjà atteint ! Ta CC actuelle est ${formatCC(ccActuelle)}.`);

    // Vérifie contrat existant actif
    try {
      const contrats = await readSheet(env, "Contrats");
      const actif = contrats.find(r => r.discord_id === userId && r.statut === "actif");
      if (actif) return reply(`❌ Tu as déjà un contrat actif : **${formatCC(actif.objectif_cc)} CC** avant le ${actif.date_objectif}. Atteins-le d'abord !`);
    } catch {}

    const date = new Date().toISOString().slice(0, 10);
    await appendRow(env, "Contrats", [userId, pseudo, objectif, dateISO, ccActuelle, "actif", date, ""]);

    // Activité
    try { await appendRow(env, "Activite", [new Date().toISOString(), "contrat", `📜 **${pseudo}** s'engage à atteindre **${formatCC(objectif)} CC** avant le ${dateStr}`, userId, ""]); } catch {}

    return replyEmbed([embed({
      title: "📜 Contrat enregistré !",
      description: `Tu t'engages à atteindre **${formatCC(objectif)} CC** d'ici le **${dateStr}**`,
      fields: [
        field("CC actuelle",  formatCC(ccActuelle), true),
        field("Objectif",     formatCC(objectif),   true),
        field("À gagner",     formatCC(objectif - ccActuelle), true),
      ],
      color: 0xd97706,
    })], null, true);
  }

  if (sub === "voir") {
    let contrats = [];
    try { contrats = await readSheet(env, "Contrats"); } catch {}
    const mon = contrats.find(r => r.discord_id === userId && r.statut === "actif");
    if (!mon) return reply("📜 Tu n'as pas de contrat actif.");

    let ccActuelle = 0;
    try {
      const membres = await readSheet(env, "Membres");
      const m = membres.find(r => r.discord_id === userId);
      if (m) ccActuelle = Number(m.cc) || 0;
    } catch {}

    const pct = Math.min(100, Math.round((ccActuelle - Number(mon.cc_au_moment)) / (Number(mon.objectif_cc) - Number(mon.cc_au_moment)) * 100));
    const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));

    return replyEmbed([embed({
      title: "📜 Ton contrat",
      fields: [
        field("Objectif",    `${formatCC(mon.objectif_cc)} CC`, true),
        field("Échéance",    mon.date_objectif, true),
        field("Progression", `${bar} ${pct}%`),
        field("CC actuelle", formatCC(ccActuelle), true),
        field("Restant",     formatCC(Math.max(0, Number(mon.objectif_cc) - ccActuelle)), true),
      ],
      color: 0xd97706,
    })], null, true);
  }

  if (sub === "liste") {
    let contrats = [];
    try { contrats = await readSheet(env, "Contrats"); } catch {}
    const actifs = contrats.filter(r => r.statut === "actif");
    if (!actifs.length) return reply("📜 Aucun contrat actif en ce moment.");
    const lines = actifs.map(r => `• **${r.pseudo}** → ${formatCC(r.objectif_cc)} CC avant le ${r.date_objectif}`).join("\n");
    return replyEmbed([embed({ title: "📜 Contrats actifs", description: lines, color: 0xd97706 })]);
  }

  return reply("❓ Sous-commande inconnue.");
}
