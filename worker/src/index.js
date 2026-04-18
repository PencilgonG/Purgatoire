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
    { name: "recruteur", description: "Arbre genealogique de la guilde", options: [
      { name: "set",  type: 1, description: "Declare qui tu as recrute", options: [
        { name: "recrue", type: 6, description: "Le membre que tu as recrute", required: true }]},
      { name: "voir", type: 1, description: "Voir tes recrues" },
    ]},
    { name: "contrat", description: "Engagement public sur un objectif CC", options: [
      { name: "set",   type: 1, description: "Cree un contrat", options: [
        { name: "objectif", type: 3, description: "Objectif CC (ex: 2000000)", required: true },
        { name: "date",     type: 3, description: "Date limite JJ/MM/AAAA",   required: true }]},
      { name: "voir",  type: 1, description: "Voir ton contrat actif" },
      { name: "liste", type: 1, description: "Tous les contrats actifs" },
    ]},
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

    // ── Proxy image CDN zeroluck.gg (contourne hotlink protection) ──
    if (url.pathname === "/img") {
      const imgUrl = url.searchParams.get("url");
      if (!imgUrl) return new Response("Missing url param", { status: 400 });
      // Whitelist: seulement le CDN zeroluck
      if (!imgUrl.startsWith("https://cdn-zeroluck-gg.b-cdn.net/")) {
        return new Response("Forbidden origin", { status: 403 });
      }
      try {
        const imgRes = await fetch(imgUrl, {
          headers: {
            "Referer": "https://zeroluck.gg/",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          }
        });
        if (!imgRes.ok) return new Response("Image not found", { status: 404 });
        const img = await imgRes.arrayBuffer();
        return new Response(img, {
          headers: {
            "Content-Type": imgRes.headers.get("Content-Type") || "image/png",
            "Cache-Control": "public, max-age=604800",  // 7 jours
            "Access-Control-Allow-Origin": "*",
          }
        });
      } catch(e) {
        return new Response("Proxy error", { status: 500 });
      }
    }

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

    // Route activite — flux d'activité live
    if (url.pathname === "/activite" && request.method === "GET") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };
      try {
        const { getToken } = await import("./sheets.js");
        const token = await getToken(env);

        // Fetch Activite sheet
        let activiteRows = [];
        try {
          const r = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Activite`, { headers: { Authorization: `Bearer ${token}` } });
          const d = await r.json();
          if (d.values && d.values.length > 1) {
            const [hdrs, ...rows] = d.values;
            activiteRows = rows.map(r => Object.fromEntries(hdrs.map((h,i) => [h.trim().toLowerCase(), (r[i]||'').trim()])));
          }
        } catch {}

        // Sort by timestamp desc, take last 30
        const sorted = activiteRows
          .filter(r => r.timestamp)
          .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 30);

        return new Response(JSON.stringify(sorted), { headers: corsH });
      } catch(e) {
        return new Response(JSON.stringify([]), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }

    // Route builds — GET load / POST save
    if (url.pathname === "/builds" && request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    }
    if (url.pathname === "/builds" && request.method === "POST") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
      try {
        const body = await request.json();
        const { pseudo, build_name, character, build_json, build_id } = body;
        if (!pseudo || !build_json) return new Response(JSON.stringify({error:"Missing fields"}), {status:400,headers:corsH});
        const { getToken } = await import("./sheets.js");
        const token = await getToken(env);
        const date = new Date().toISOString().slice(0,10);
        const id = build_id || crypto.randomUUID().slice(0,8);
        // Check if updating existing build
        const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Builds`;
        const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
        const sheet = await getRes.json();
        const rows = sheet.values || [];
        const existing = rows.findIndex((r,i) => i > 0 && r[5] === id);
        if (existing !== -1) {
          const lineNum = existing + 1;
          const range = `Builds!A${lineNum}:G${lineNum}`;
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
            method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ range, majorDimension: "ROWS", values: [[date, pseudo, character||"", build_name||"Mon build", build_json, id, "public"]] })
          });
        } else {
          await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Builds:append?valueInputOption=USER_ENTERED`, {
            method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [[date, pseudo, character||"", build_name||"Mon build", build_json, id, "public"]] })
          });
        }
        return new Response(JSON.stringify({ok:true, id}), {headers:corsH});
      } catch(e) { return new Response(JSON.stringify({error:e.message}), {status:500,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}); }
    }
    if (url.pathname.startsWith("/builds/") && request.method === "GET") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };
      try {
        const id = url.pathname.replace("/builds/","");
        const { getToken } = await import("./sheets.js");
        const token = await getToken(env);
        const getRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Builds`, { headers: { Authorization: `Bearer ${token}` } });
        const sheet = await getRes.json();
        const rows = (sheet.values || []).slice(1);
        const row = rows.find(r => r[5] === id);
        if (!row) return new Response(JSON.stringify({error:"Build not found"}), {status:404,headers:corsH});
        return new Response(JSON.stringify({ date:row[0], pseudo:row[1], character:row[2], build_name:row[3], build_json:row[4], id:row[5] }), {headers:corsH});
      } catch(e) { return new Response(JSON.stringify({error:e.message}), {status:500,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}}); }
    }

    // Route calendrier
    // Route personnalite — sauvegarde résultat quiz
    // Route build — sauvegarde/mise à jour un build (1 par pseudo+char_slug)
    if (url.pathname === "/build" && request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    }
    if (url.pathname === "/build" && request.method === "GET") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };
      try {
        const { readSheet } = await import("./sheets.js");
        const builds = await readSheet(env, "Builds");
        const pseudo = url.searchParams.get("pseudo");
        const char_slug = url.searchParams.get("char_slug");
        let result = builds;
        if (pseudo) result = result.filter(b => b.pseudo === pseudo);
        if (char_slug) result = result.filter(b => b.char_slug === char_slug);
        return new Response(JSON.stringify(result), { headers: corsH });
      } catch(e) {
        return new Response(JSON.stringify([]), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }
    if (url.pathname === "/build" && request.method === "POST") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
      try {
        const body = await request.json();
        const { pseudo, char_slug, name, build_data } = body;
        if (!pseudo || !char_slug || !build_data) return new Response(JSON.stringify({error:"Missing fields"}),{status:400,headers:corsH});
        const { readSheet, appendRow, getToken } = await import("./sheets.js");
        // Check if build already exists for this pseudo+char_slug
        const builds = await readSheet(env, "Builds");
        const idx = builds.findIndex(b => b.pseudo === pseudo && b.char_slug === char_slug);
        if (idx >= 0) {
          // Update existing row
          const token = await getToken(env);
          const rowNum = idx + 2;
          const range = `Builds!A${rowNum}:E${rowNum}`;
          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
            { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ range, majorDimension: "ROWS", values: [[
                new Date().toISOString().slice(0,10), pseudo, char_slug, name, build_data
              ]] }) }
          );
        } else {
          // Append new row
          await appendRow(env, "Builds", [
            new Date().toISOString().slice(0,10), pseudo, char_slug, name, build_data
          ]);
        }
        // Log activite
        try { await appendRow(env, "Activite", [new Date().toISOString(), "build", `⚔️ **${pseudo}** a enregistré un build pour **${char_slug}**`, "", ""]); } catch {}
        return new Response(JSON.stringify({ok:true}), {headers:corsH});
      } catch(e) {
        return new Response(JSON.stringify({error:e.message}),{status:500,headers:corsH});
      }
    }

    if (url.pathname === "/personnalite" && request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    }
    // Route build — sauvegarde/mise à jour un build (1 par pseudo+char_slug)
    if (url.pathname === "/build" && request.method === "OPTIONS") {
      return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
    }
    if (url.pathname === "/build" && request.method === "GET") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=60" };
      try {
        const { readSheet } = await import("./sheets.js");
        const builds = await readSheet(env, "Builds");
        const pseudo = url.searchParams.get("pseudo");
        const char_slug = url.searchParams.get("char_slug");
        let result = builds;
        if (pseudo) result = result.filter(b => b.pseudo === pseudo);
        if (char_slug) result = result.filter(b => b.char_slug === char_slug);
        return new Response(JSON.stringify(result), { headers: corsH });
      } catch(e) {
        return new Response(JSON.stringify([]), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      }
    }
    if (url.pathname === "/build" && request.method === "POST") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
      try {
        const body = await request.json();
        const { pseudo, char_slug, name, build_data } = body;
        if (!pseudo || !char_slug || !build_data) return new Response(JSON.stringify({error:"Missing fields"}),{status:400,headers:corsH});
        const { readSheet, appendRow, getToken } = await import("./sheets.js");
        // Check if build already exists for this pseudo+char_slug
        const builds = await readSheet(env, "Builds");
        const idx = builds.findIndex(b => b.pseudo === pseudo && b.char_slug === char_slug);
        if (idx >= 0) {
          // Update existing row
          const token = await getToken(env);
          const rowNum = idx + 2;
          const range = `Builds!A${rowNum}:E${rowNum}`;
          await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
            { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ range, majorDimension: "ROWS", values: [[
                new Date().toISOString().slice(0,10), pseudo, char_slug, name, build_data
              ]] }) }
          );
        } else {
          // Append new row
          await appendRow(env, "Builds", [
            new Date().toISOString().slice(0,10), pseudo, char_slug, name, build_data
          ]);
        }
        // Log activite
        try { await appendRow(env, "Activite", [new Date().toISOString(), "build", `⚔️ **${pseudo}** a enregistré un build pour **${char_slug}**`, "", ""]); } catch {}
        return new Response(JSON.stringify({ok:true}), {headers:corsH});
      } catch(e) {
        return new Response(JSON.stringify({error:e.message}),{status:500,headers:corsH});
      }
    }

    if (url.pathname === "/personnalite" && request.method === "POST") {
      const corsH = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
      try {
        const body = await request.json();
        const { pseudo, personnage, match_pct, top5, profil } = body;
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
            profil || '',
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
