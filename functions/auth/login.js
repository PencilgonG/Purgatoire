// ── /auth/login ─────────────────────────────────────────────────────────────
// Redirige l'utilisateur vers Discord pour s'authentifier.

export async function onRequestGet({ request, env }) {
  const url    = new URL(request.url);
  const next   = url.searchParams.get('next') || '/';
  const state  = btoa(JSON.stringify({ next, nonce: crypto.randomUUID() }));

  const discord = new URL('https://discord.com/oauth2/authorize');
  discord.searchParams.set('client_id',     env.DISCORD_CLIENT_ID);
  discord.searchParams.set('redirect_uri',  `${url.origin}/auth/callback`);
  discord.searchParams.set('response_type', 'code');
  discord.searchParams.set('scope',         'identify guilds guilds.members.read');
  discord.searchParams.set('state',         state);

  return Response.redirect(discord.toString(), 302);
}
