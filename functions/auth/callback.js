// ── /auth/callback ───────────────────────────────────────────────────────────
export async function onRequestGet({ request, env }) {
  const url   = new URL(request.url);
  const code  = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const state = url.searchParams.get('state');

  // Si erreur Discord (mauvais mdp, annulation...) → relancer le login
  if (error || !code) return Response.redirect(`${url.origin}/auth/login`, 302);

  let next = '/';
  try { next = JSON.parse(atob(state)).next || '/'; } catch {}

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
  if (!tokenData.access_token) return Response.redirect(`${url.origin}/auth/login`, 302);

  const accessToken = tokenData.access_token;
  const headers     = { Authorization: `Bearer ${accessToken}` };

  const userRes = await fetch('https://discord.com/api/v10/users/@me', { headers });
  const user    = await userRes.json();
  if (!user.id) return Response.redirect(`${url.origin}/auth/login`, 302);

  const memberRes = await fetch(
    `https://discord.com/api/v10/users/@me/guilds/${env.GUILD_ID}/member`,
    { headers }
  );

  if (!memberRes.ok) return Response.redirect(`${url.origin}/join`, 302);

  const member = await memberRes.json();
  const roles  = member.roles || [];

  let guild = '1';
  if (env.ROLE_GUILD2 && roles.includes(env.ROLE_GUILD2)) guild = '2';

  const exp     = Date.now() + 24 * 60 * 60 * 1000;
  const payload = { userId: user.id, username: user.username, guild, exp };
  const dataB64 = btoa(JSON.stringify(payload));
  const sig     = await signHMAC(dataB64, env.SESSION_SECRET);
  const cookie  = `${dataB64}.${sig}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location:     `${url.origin}${next}`,
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
