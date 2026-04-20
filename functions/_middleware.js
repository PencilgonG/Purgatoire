// ── Middleware Cloudflare Pages ─────────────────────────────────────────────
// Vérifie le cookie de session sur toutes les pages protégées.
// Pages publiques (sans auth) : accueil, join, recrutement, wiki, calendrier.

const PUBLIC_PATHS = ['/', '/join', '/join.html', '/pages/recrutement', '/pages/wiki', '/pages/calendrier', '/auth'];

export async function onRequest({ request, next, env }) {
  const url = new URL(request.url);

  // Laisser passer les assets statiques
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_')) {
    return next();
  }

  // Pages publiques
  const isPublic = PUBLIC_PATHS.some(p => url.pathname === p || url.pathname.startsWith(p + '/') || url.pathname.startsWith(p + '.'));
  if (isPublic) return next();

  // Vérifier le cookie de session
  const session = await getSession(request, env.SESSION_SECRET);
  if (!session) {
    const loginUrl = new URL('/auth/login', url.origin);
    loginUrl.searchParams.set('next', url.pathname);
    return Response.redirect(loginUrl.toString(), 302);
  }

  return next();
}

async function getSession(request, secret) {
  if (!secret) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match  = cookie.match(/purgatoire_session=([^;]+)/);
  if (!match) return null;
  try {
    const [dataB64, sigHex] = match[1].split('.');
    if (!dataB64 || !sigHex) return null;
    const valid = await verifyHMAC(dataB64, sigHex, secret);
    if (!valid) return null;
    const data = JSON.parse(atob(dataB64));
    if (data.exp < Date.now()) return null; // expiré
    return data;
  } catch { return null; }
}

async function verifyHMAC(data, sigHex, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const sig = hexToBuffer(sigHex);
  return crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i*2, i*2+2), 16);
  return bytes;
}
