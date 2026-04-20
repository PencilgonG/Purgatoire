export async function verifyDiscordRequest(request, publicKey) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  if (!signature || !timestamp) return false;
  const body = await request.text();
  const key = await crypto.subtle.importKey(
    "raw", hexToBytes(publicKey),
    { name: "NODE-ED25519", namedCurve: "NODE-ED25519" },
    false, ["verify"]
  );
  return crypto.subtle.verify(
    "NODE-ED25519", key,
    hexToBytes(signature),
    new TextEncoder().encode(timestamp + body)
  );
}

function hexToBytes(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) arr[i/2] = parseInt(hex.substr(i, 2), 16);
  return arr;
}

export function pong() {
  return json({ type: 1 });
}

export function reply(content, ephemeral = true) {
  return json({ type: 4, data: { content, flags: ephemeral ? 64 : 0 } });
}

export function replyEmbed(embeds, content = null, ephemeral = false) {
  const data = { embeds };
  if (content) data.content = content;
  if (ephemeral) data.flags = 64;
  return json({ type: 4, data });
}

export function embed({ title, description, fields = [], color = 0x6e4fff, footer = true }) {
  const e = { color };
  if (title) e.title = title;
  if (description) e.description = description;
  if (fields.length) e.fields = fields;
  if (footer) e.footer = { text: "⚔️ Purgatoire • 7DS Origin" };
  e.timestamp = new Date().toISOString();
  return e;
}

export function field(name, value, inline = false) {
  return { name, value: String(value), inline };
}

export async function sendWebhook(url, payload) {
  if (!url) return;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}
