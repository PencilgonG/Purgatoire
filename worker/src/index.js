import { verifyDiscordRequest, pong } from "./discord.js";
import { handleCommand } from "./commands.js";

async function registerSlashCommands(env) {
  const { DISCORD_TOKEN: token, DISCORD_APPLICATION_ID: appId, GUILD_ID: guildId } = env;
  const commands = [
    { name: "cc", description: "Gère ta Combat Class", options: [
      { name: "set", type: 1, description: "Enregistre ta CC", options: [
        { name: "valeur", type: 4, description: "Ta CC (ex: 2500000)", required: true, min_value: 1 }]},
      { name: "classement", type: 1, description: "Top CC de la guilde" },
      { name: "evolution", type: 1, description: "Évolution CC hebdomadaire", options: [
        { name: "membre", type: 6, description: "Membre (toi par défaut)", required: false }]},
    ]},
    { name: "absence", description: "Gère les absences", options: [
      { name: "declarer", type: 1, description: "Déclare une absence", options: [
        { name: "debut",  type: 3, description: "Date début JJ/MM/AAAA", required: true },
        { name: "fin",    type: 3, description: "Date fin JJ/MM/AAAA",   required: true },
        { name: "raison", type: 3, description: "Raison (optionnel)",     required: false }]},
      { name: "liste", type: 1, description: "Voir les absences en cours" },
    ]},
    { name: "tierlist", description: "Tierlist communautaire", options: [
      { name: "voter", type: 1, description: "Voter pour un personnage", options: [
        { name: "personnage", type: 3, description: "Nom du personnage", required: true, autocomplete: true },
        { name: "tier", type: 3, description: "Tier", required: true, choices: [
          { name: "S — Indispensable", value: "S" },
          { name: "A — Très bon",      value: "A" },
          { name: "B — Correct",       value: "B" },
          { name: "C — Moyen",         value: "C" },
          { name: "D — Faible",        value: "D" }]}]},
      { name: "voir", type: 1, description: "Afficher la tierlist" },
    ]},
    { name: "perso", description: "Gère tes personnages et potentiels", options: [
      { name: "ajouter", type: 1, description: "Ajouter ou modifier un personnage", options: [
        { name: "personnage", type: 3, description: "Nom du personnage", required: true, autocomplete: true },
        { name: "potentiel",  type: 4, description: "Potentiel de 0 à 10", required: true, min_value: 0, max_value: 10 }]},
      { name: "liste", type: 1, description: "Voir tes personnages et potentiels" },
    ]},
    { name: "team", description: "Enregistre la photo de ta team", options: [
      { name: "url", type: 3, description: "Lien direct vers ton image (imgur, discord...)", required: true }]},
    { name: "profil", description: "Voir ta fiche complète", options: [
      { name: "membre", type: 6, description: "Membre (toi par défaut)", required: false }]},
    { name: "annonce", description: "Gérer les annonces (officiers)", options: [
      { name: "creer", type: 1, description: "Créer une annonce", options: [
        { name: "titre",       type: 3, description: "Titre",        required: true, max_length: 100 },
        { name: "description", type: 3, description: "Description",  required: true, max_length: 1000 },
        { name: "categorie",   type: 3, description: "Catégorie",    required: true, choices: [
          { name: "📢 Annonce",      value: "Annonce" },
          { name: "🎉 Event",        value: "Event" },
          { name: "📋 Note de patch",value: "Note de patch" },
          { name: "⚔️ GDG",          value: "GDG" },
          { name: "❗ Important",    value: "Important" },
        ]},
        { name: "image",   type: 3, description: "URL d'une image (optionnel)", required: false },
        { name: "epingle", type: 3, description: "Épingler l'annonce ?",        required: false, choices: [
          { name: "Oui", value: "oui" },
          { name: "Non", value: "non" },
        ]},
      ]},
      { name: "supprimer", type: 1, description: "Supprimer une annonce", options: [
        { name: "titre", type: 3, description: "Titre de l'annonce à supprimer", required: true, autocomplete: true },
      ]},
    ]},
    { name: "gdg", description: "Gérer les guerres de guilde (officiers)", options: [
      { name: "declarer", type: 1, description: "Déclarer le résultat d'un GDG", options: [
        { name: "ennemi",       type: 3, description: "Nom de la guilde adverse",  required: true },
        { name: "resultat",     type: 3, description: "Résultat du GDG",           required: true, choices: [
          { name: "🏆 Victoire", value: "victoire" },
          { name: "💀 Défaite",  value: "defaite" },
          { name: "🤝 Nul",      value: "nul" },
        ]},
        { name: "notre_score",  type: 4, description: "Notre score",              required: true, min_value: 0 },
        { name: "score_ennemi", type: 4, description: "Score de l'adversaire",    required: true, min_value: 0 },
        { name: "notes",        type: 3, description: "Notes (optionnel)",         required: false },
      ]},
    ]},
    { name: "calendrier",  description: "Prochains resets 7DS Origin" },
    { name: "recrutement", description: "Formulaire de candidature Purgatoire" },
  ];

  const res = await fetch(
    `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`,
    { method: "PUT", headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(commands) }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function followUp(appId, token, data) {
  await fetch(`https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function handleAutocomplete(body, env) {
  const name    = body.data.name;
  const options = body.data.options || [];
  const sub     = options[0];
  const focused = (sub?.options || options).find(o => o.focused);
  if (!focused) return new Response(JSON.stringify({ type: 8, data: { choices: [] } }), { headers: { "Content-Type": "application/json" } });

  const query = (focused.value || "").toLowerCase();
  let choices = [];

  if ((name === "perso" || name === "tierlist") && focused.name === "personnage") {
    try {
      const { readSheet } = await import("./sheets.js");
      const rows = await readSheet(env, "Liste_Persos");
      choices = rows
        .filter(r => r.nom && r.nom.toLowerCase().includes(query))
        .slice(0, 25)
        .map(r => ({ name: `${r.nom} (${r.categorie || "?"})`, value: r.nom }));
    } catch {}
  }

  if (name === "annonce" && focused.name === "titre") {
    try {
      const { readSheet } = await import("./sheets.js");
      const rows = await readSheet(env, "Annonces");
      choices = rows
        .filter(r => r.titre && (r.publie || "").toLowerCase() === "oui" && r.titre.toLowerCase().includes(query))
        .slice(0, 25)
        .map(r => ({ name: `${r.titre} (${r.categorie || "?"}) — ${r.date || ""}`, value: r.titre }));
    } catch {}
  }

  return new Response(JSON.stringify({ type: 8, data: { choices } }), { headers: { "Content-Type": "application/json" } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Proxy avatar Discord (contourne CORS)
    if (url.pathname.startsWith("/avatar/")) {
      const userId = url.pathname.split("/avatar/")[1];
      if (!userId) return new Response("Not found", { status: 404 });
      try {
        const userRes = await fetch(`https://discord.com/api/v10/users/${userId}`, {
          headers: { Authorization: `Bot ${env.DISCORD_TOKEN}` }
        });
        const userData = await userRes.json();
        let avatarUrl;
        if (userData.avatar) {
          avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${userData.avatar}.png?size=128`;
        } else {
          const idx = (BigInt(userId) >> 22n) % 6n;
          avatarUrl = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
        }
        const imgRes = await fetch(avatarUrl);
        const img    = await imgRes.arrayBuffer();
        return new Response(img, {
          headers: {
            "Content-Type": imgRes.headers.get("Content-Type") || "image/png",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          }
        });
      } catch(e) {
        return new Response("Error", { status: 500 });
      }
    }

    // Route calendrier
    // Route personnalite — sauvegarde résultat quiz
    if (url.pathname === "/personnalite" && request.method === "POST") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
      try {
        const body = await request.json();
        const { pseudo, personnage, match_pct, top5 } = body;
        if (!pseudo || !personnage) return new Response(JSON.stringify({error:"Missing fields"}),{status:400,headers:corsH});

        const { getToken } = await import("./sheets.js");
        const token = await getToken(env);

        // Récupère le discord_id depuis Membres
        const getMembres = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Membres`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const membresData = await getMembres.json();
        const rows = membresData.values || [];
        const headers = rows[0] || [];
        const pseudoCol = headers.findIndex(h => h.trim().toLowerCase() === 'pseudo');
        const idCol = headers.findIndex(h => h.trim().toLowerCase() === 'discord_id');
        const memberRow = rows.slice(1).find(r => (r[pseudoCol]||'').toLowerCase() === pseudo.toLowerCase());
        const discord_id = memberRow ? (memberRow[idCol]||'') : '';

        // Écrit dans Personnalite
        const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Personnalite:append?valueInputOption=USER_ENTERED`;
        await fetch(appendUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [[
            new Date().toISOString().slice(0,10),
            discord_id,
            pseudo,
            personnage,
            match_pct,
            top5,
          ]] })
        });
        return new Response(JSON.stringify({ok:true}), {headers:corsH});
      } catch(e) {
        return new Response(JSON.stringify({error:e.message}),{status:500,headers:{...corsH}});
      }
    }

    if (url.pathname === "/calendar-events" && request.method === "GET") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=300" };
      try {
        const { getCalendarEvents } = await import("./calendar.js");
        const events = await getCalendarEvents(env);
        return new Response(JSON.stringify(events), { headers: corsH });
      } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsH });
      }
    }

    if (url.pathname === "/register" && request.method === "GET") {
      try {
        const cmds = await registerSlashCommands(env);
        return new Response(`✅ ${Array.isArray(cmds) ? cmds.length : "?"} commandes enregistrées !\n\n${JSON.stringify(cmds, null, 2)}`, { headers: { "Content-Type": "text/plain" } });
      } catch(e) {
        return new Response("❌ Erreur : " + e.message, { status: 500 });
      }
    }

    if (request.method !== "POST") return new Response("Purgatoire Bot — OK", { status: 200 });

    const isValid = await verifyDiscordRequest(request.clone(), env.DISCORD_PUBLIC_KEY);
    if (!isValid) return new Response("Invalid request signature", { status: 401 });

    const body = await request.json();

    if (body.type === 1) return pong();

    // Autocomplete
    if (body.type === 4) return handleAutocomplete(body, env);

    if (body.type === 2) {
      const deferred = new Response(JSON.stringify({ type: 5, data: { flags: 64 } }), {
        headers: { "Content-Type": "application/json" },
      });

      ctx.waitUntil((async () => {
        try {
          const result  = await handleCommand(body, env);
          const resData = await result.json();
          await followUp(env.DISCORD_APPLICATION_ID, body.token, resData.data || { content: "✅" });
        } catch(e) {
          console.error("Command error:", e);
          await followUp(env.DISCORD_APPLICATION_ID, body.token, { content: "❌ Erreur : " + e.message });
        }
      })());

      return deferred;
    }

    return new Response("OK");
  },

  async scheduled(event, env, ctx) {
    const { handleScheduled } = await import("./scheduled.js");
    ctx.waitUntil(handleScheduled(event, env));
  },
};
