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
    { name: "annonce", description: "Publier une annonce (officiers)", options: [
      { name: "titre",     type: 3, description: "Titre de l'annonce",  required: true },
      { name: "message",   type: 3, description: "Contenu",             required: true },
      { name: "categorie", type: 3, description: "Catégorie",           required: false,
        choices: [
          { name: "Annonce",    value: "Annonce" },
          { name: "Event",      value: "Event" },
          { name: "GDG",        value: "GDG" },
          { name: "Important",  value: "Important" },
        ]}]},
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

  return new Response(JSON.stringify({ type: 8, data: { choices } }), { headers: { "Content-Type": "application/json" } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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
