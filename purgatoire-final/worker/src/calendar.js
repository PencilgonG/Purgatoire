const CALENDAR_ID    = '49a56f9b32d4d5c0e30ec448519246ef7dc45a9c95752e5f187e12e3debaac56@group.calendar.google.com';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

function b64url(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}
function jsonB64(obj) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function getCalendarToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const pem = env.GOOGLE_PRIVATE_KEY
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '').replace(/\n/g, '').replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'pkcs8', keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );
  const header  = jsonB64({ alg: 'RS256', typ: 'JWT' });
  const payload = jsonB64({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: CALENDAR_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  });
  const msg = new TextEncoder().encode(`${header}.${payload}`);
  const sig = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, key, msg);
  const jwt = `${header}.${payload}.${b64url(sig)}`;

  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error('Calendar token error: ' + JSON.stringify(data));
  return data.access_token;
}

export async function getCalendarEvents(env) {
  const token  = await getCalendarToken(env);
  const now    = new Date().toISOString();
  const url    = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`
    + `?timeMin=${encodeURIComponent(now)}&maxResults=20&singleEvents=true&orderBy=startTime`;
  const res    = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data   = await res.json();
  if (!data.items) throw new Error('Calendar API error: ' + JSON.stringify(data));
  return data.items.map(e => ({
    id:          e.id,
    title:       e.summary     || 'Événement',
    description: e.description || '',
    start:       e.start?.dateTime || e.start?.date || '',
    end:         e.end?.dateTime   || e.end?.date   || '',
    allDay:      !e.start?.dateTime,
    location:    e.location    || '',
    colorId:     e.colorId     || '',
  }));
}
