// ── /auth/callback ───────────────────────────────────────────────────────────
// Discord redirige ici après le login.
// 1. Échange le code contre un token Discord
// 2. Vérifie que l'utilisateur est membre de la guilde
// 3. Pose un cookie signé HMAC (24h)
// 4. Redirige vers la page d'origine ou /join si pas membre

export async function onRequestGet({ request, env }) {
  const url   = new URL(request.url);
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) return Response.redirect(`${url.origin}/join`, 302);

  // Récupérer la page cible depuis le state
  let next = '/';
  try { next = JSON.parse(atob(state)).next || '/'; } catch {}

  // 1. Échanger le code contre un access_token Discord
  const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  `${url.origin}/auth/callback`,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return Response.redirect(`${url.origin}/join`, 302);

  const accessToken = tokenData.access_token;
  const headers     = { Authorization: `Bearer ${accessToken}` };

  // 2. Identité de l'utilisateur
  const userRes  = await fetch('https://discord.com/api/v10/users/@me', { headers });
  const user     = await userRes.json();
  if (!user.id)  return Response.redirect(`${url.origin}/join`, 302);

  // 3. Vérifier l'appartenance à la guilde principale
  const memberRes = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${env.GUILD_ID}/member`,
    { headers }
  );

  if (!memberRes.ok) {
    // Pas membre de la guilde → page de recrutement
    return Response.redirect(`${url.origin}/join`, 302);
  }

  const member = await memberRes.json();
  const roles  = member.roles || [];

  // 4. Détecter guilde 1 ou 2 selon le rôle Discord
  // (optionnel : si pas de rôle G2 défini, tout le monde est G1 par défaut)
  let guild = '1';
  if (env.ROLE_GUILD2 && roles.includes(env.ROLE_GUILD2)) guild = '2';

  // 5. Créer le cookie de session (24h)
  const exp     = Date.now() + 24 * 60 * 60 * 1000;
  const payload = { userId: user.id, username: user.username, guild, exp };
  const dataB64 = btoa(JSON.stringify(payload));
  const sig     = await signHMAC(dataB64, env.SESSION_SECRET);
  const cookie  = `${dataB64}.${sig}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location:   `${url.origin}${next}`,
      'Set-Cookie': `purgatoire_session=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
    },
  });
}

async function signHMAC(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}
