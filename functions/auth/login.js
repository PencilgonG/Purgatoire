// ── /auth/login ─────────────────────────────────────────────────────────────
// Toujours utiliser l'URL de production pour le callback
// afin d'éviter les erreurs avec les URLs de preview Cloudflare

const PRODUCTION_URL = "https://purgatoire-9z2.pages.dev";

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const next   = url.searchParams.get('next') || '/';
  const state  = btoa(JSON.stringify({ next, nonce: crypto.randomUUID() }));

  const discord = new URL('https://discord.com/oauth2/authorize');
  discord.searchParams.set('client_id',     env.DISCORD_CLIENT_ID);
  discord.searchParams.set('redirect_uri',  `${PRODUCTION_URL}/auth/callback`);
  discord.searchParams.set('response_type', 'code');
  discord.searchParams.set('scope',         'identify guilds guilds.members.read');
  discord.searchParams.set('state',         state);

  return Response.redirect(discord.toString(), 302);
}
