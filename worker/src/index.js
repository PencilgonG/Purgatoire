import { verifyDiscordRequest, pong, reply } from "./discord.js";
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
        { name: "personnage", type: 3, description: "Nom du personnage", required: true },
        { name: "tier", type: 3, description: "Tier", required: true, choices: [
          { name: "S — Indispensable", value: "S" },
          { name: "A — Très bon",      value: "A" },
          { name: "B — Correct",       value: "B" },
          { name: "C — Moyen",         value: "C" },
          { name: "D — Faible",        value: "D" }]}]},
      { name: "voir", type: 1, description: "Afficher la tierlist" },
    ]},
    { name: "calendrier",  description: "Prochains resets 7DS Origin" },
    { name: "recrutement", description: "Formulaire de candidature Purgatoire" },
  ];
  const res = await fetch(
    `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/register" && request.method === "GET") {
      try {
        const cmds = await registerSlashCommands(env);
        return new Response(
          `✅ ${Array.isArray(cmds) ? cmds.length : "?"} commandes enregistrées !\n\n${JSON.stringify(cmds, null, 2)}`,
          { headers: { "Content-Type": "text/plain" } }
        );
      } catch(e) {
        return new Response("❌ Erreur : " + e.message, { status: 500 });
      }
    }

    if (request.method !== "POST") {
      return new Response("Purgatoire Bot — OK", { status: 200 });
    }

    const isValid = await verifyDiscordRequest(request.clone(), env.DISCORD_PUBLIC_KEY);
    if (!isValid) return new Response("Invalid request signature", { status: 401 });

    const body = await request.json();
    if (body.type === 1) return pong();
    if (body.type === 2) return handleCommand(body, env);

    return new Response("OK");
  },

  async scheduled(event, env, ctx) {
    const { handleScheduled } = await import("./scheduled.js");
    ctx.waitUntil(handleScheduled(event, env));
  },
};
