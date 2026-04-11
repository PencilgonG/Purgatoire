const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function b64url(buf) {
  const bytes = new Uint8Array(buf);
  let str = "";
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}

function jsonB64(obj) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)));
}

async function makeJWT(email, privateKeyPem) {
  const now = Math.floor(Date.now() / 1000);
  const pem = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "").replace(/\n/g, "").replace(/\s/g, "");
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );
  const header  = jsonB64({ alg: "RS256", typ: "JWT" });
  const payload = jsonB64({
    iss: email, scope: SCOPES,
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  });
  const msg = new TextEncoder().encode(`${header}.${payload}`);
  const sig = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, key, msg);
  return `${header}.${payload}.${b64url(sig)}`;
}

export async function getToken(env) {
  const jwt = await makeJWT(env.GOOGLE_SERVICE_ACCOUNT_EMAIL, env.GOOGLE_PRIVATE_KEY);
  const res  = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Token error: " + JSON.stringify(data));
  return data.access_token;
}

export async function readSheet(env, sheetName) {
  const token = await getToken(env);
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(sheetName)}`;
  const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data  = await res.json();
  if (!data.values || data.values.length < 2) return [];
  const [headers, ...rows] = data.values;
  return rows
    .filter(r => r[0] && r[0].toString().trim() !== "") // ignore lignes vides
    .map(r => Object.fromEntries(headers.map((h,i) => [h.trim(), (r[i]||"").trim()])));
}

export async function appendRow(env, sheetName, values) {
  const token = await getToken(env);
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`;
  const res   = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });
  return res.json();
}

export async function upsertMembre(env, discordId, data) {
  const token  = await getToken(env);
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Membres`;
  const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}` } });
  const sheet  = await getRes.json();
  const values = sheet.values || [];

  // Cherche uniquement les lignes avec un discord_id valide en colonne A
  const rowIndex = values.findIndex((r, i) => i > 0 && r[0] && r[0].toString().trim() === discordId);

  if (rowIndex !== -1) {
    const lineNum = rowIndex + 1;
    const range   = `Membres!A${lineNum}:J${lineNum}`;
    const current = values[rowIndex];
    const updated = [
      discordId,
      data.pseudo      ?? current[1] ?? "",
      data.cc          ?? current[2] ?? 0,
      formatCC(data.cc ?? current[2] ?? 0),
      data.main_char   ?? current[4] ?? "",
      data.grade       ?? current[5] ?? "Recrue",
      data.statut      ?? current[6] ?? "Actif",
      new Date().toISOString().slice(0, 10),
      data.team_photo  ?? current[8] ?? "",
      data.avatar_url  ?? current[9] ?? "",
    ];
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ range, majorDimension: "ROWS", values: [updated] }),
      }
    );
  } else {
    // Nouveau membre — ligne propre avec toutes les colonnes
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Membres:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [[
          discordId,
          data.pseudo     || "",
          data.cc         || 0,
          formatCC(data.cc || 0),
          data.main_char  || "",
          data.grade      || "Recrue",
          data.statut     || "Actif",
          new Date().toISOString().slice(0, 10),
          data.team_photo || "",
          data.avatar_url || "",
        ]] }),
      }
    );
  }
}

export function formatCC(v) {
  const n = Number(String(v).replace(/[^\d.]/g,"")) || 0;
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n/1_000).toFixed(1)}K`;
  return String(n);
}

export function getGradeFromCC(cc) {
  const n = Number(cc) || 0;
  if (n >= 5_000_000) return "Chef";
  if (n >= 3_000_000) return "Officier";
  if (n >= 2_000_000) return "Élite";
  if (n >= 1_000_000) return "Vétéran";
  if (n >= 500_000)   return "Membre";
  return "Recrue";
}

export function getWeekKey() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week  = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2,"0")}`;
}
