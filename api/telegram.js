// ===============================
// BROKEN LORD • TELEGRAM BOT ENGINE (VERCEL)
// ===============================

// Ruhusu Vercel asome JSON body
export const config = {
  api: {
    bodyParser: true
  }
};

const TELEGRAM_API = (token) => `https://api.telegram.org/bot${token}`;
const NEXRAY = "https://api.nexray.web.id";

// MAIN HANDLER
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, message: "BROKEN LORD Telegram webhook" });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ ok: false, error: "BOT_TOKEN missing" });
  }

  const update = req.body;

  try {
    if (update.message) {
      await handleMessage(BOT_TOKEN, update.message);
    } else if (update.callback_query) {
      await handleCallback(BOT_TOKEN, update.callback_query);
    }
  } catch (err) {
    console.error("BOT ERROR:", err);
  }

  return res.status(200).json({ ok: true });
}

// ===============================
// MESSAGE HANDLER
// ===============================

async function handleMessage(token, msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  if (!text) {
    return send(token, chatId, "Nipe command kaka 😄");
  }

  // /start → brand + commands
  if (text === "/start") {
    return send(
      token,
      chatId,
`🔥 <b>BROKEN LORD BOT</b> 🔥

Karibu kwenye mfumo wa BROKEN LORD ⚡
Hapa unaweza kutumia API za Nexray moja kwa moja.

<b>COMMANDS:</b>
/yt Zuchu - YouTube Play
/ai Hi - TurboChat
/suno love - Suno Music
/logo Spider - Solo Logo
/math 2+2 - MathGPT
/img2prompt <url> - Image → Prompt
/creart Beautiful - Create Art
/vcc - Virtual Card Generator

<b>Powered by:</b> BROKEN LORD ENGINE ⚡`
    );
  }

  const [cmd, ...rest] = text.split(" ");
  const arg = rest.join(" ").trim();

  switch (cmd.toLowerCase()) {
    case "/yt":
      return yt(token, chatId, arg);
    case "/ai":
      return ai(token, chatId, arg);
    case "/suno":
      return suno(token, chatId, arg);
    case "/logo":
      return logo(token, chatId, arg);
    case "/math":
      return math(token, chatId, arg);
    case "/img2prompt":
      return img2prompt(token, chatId, arg);
    case "/creart":
      return creart(token, chatId, arg);
    case "/vcc":
      return askVcc(token, chatId);
    default:
      return send(token, chatId, "Sijaelewa hii command, tumia /start kuona list.");
  }
}

// ===============================
// CALLBACK HANDLER (VCC BUTTONS)
// ===============================

async function handleCallback(token, cb) {
  const chatId = cb.message.chat.id;
  const data = cb.data || "";

  if (data.startsWith("vcc:")) {
    const type = data.split(":")[1];
    await send(token, chatId, `⏳ Natoa VCC ya ${type.toUpperCase()}...`);
    return vcc(token, chatId, type);
  }
}

// ===============================
// TELEGRAM HELPERS
// ===============================

async function send(token, chatId, text, extra = {}) {
  try {
    await fetch(`${TELEGRAM_API(token)}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...extra
      })
    });
  } catch (e) {
    console.error("send error:", e);
  }
}

async function sendKeyboard(token, chatId, text, keyboard) {
  return send(token, chatId, text, {
    reply_markup: { inline_keyboard: keyboard }
  });
}

// ===============================
// NEXRAY HELPER
// ===============================

async function get(url) {
  try {
    const r = await fetch(url);
    return await r.json();
  } catch (e) {
    console.error("Nexray error:", e);
    return null;
  }
}

// ===============================
// COMMAND IMPLEMENTATIONS
// ===============================

async function yt(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /yt Zuchu");
  const data = await get(`${NEXRAY}/downloader/ytplay?q=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ YT error.");
  return send(
    token,
    chatId,
    `🎵 <b>YouTube</b>\n\n<b>Title:</b> ${data.title || "-"}\n<b>Link:</b> ${data.url || data.download_url || "-"}`
  );
}

async function ai(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /ai Hi");
  const data = await get(`${NEXRAY}/ai/turbochat?text=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ TurboChat error.");
  return send(token, chatId, `🤖 <b>TurboChat</b>\n\n${data.result || data.response || JSON.stringify(data, null, 2)}`);
}

async function suno(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /suno love");
  const data = await get(`${NEXRAY}/ai/suno?prompt=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ Suno error.");
  return send(
    token,
    chatId,
    `🎶 <b>Suno</b>\n\n<b>Prompt:</b> ${q}\n<b>Audio:</b> ${data.url || data.audio || "-"}`
  );
}

async function logo(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /logo Spider");
  const data = await get(`${NEXRAY}/ai/sologo?prompt=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ Logo error.");
  return send(
    token,
    chatId,
    `🎨 <b>Solo Logo</b>\n\n<b>Prompt:</b> ${q}\n<b>Image:</b> ${data.url || data.image || "-"}`
  );
}

async function math(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /math 2+2");
  const data = await get(`${NEXRAY}/ai/mathgpt?text=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ MathGPT error.");
  return send(
    token,
    chatId,
    `📐 <b>MathGPT</b>\n\n${data.result || data.answer || JSON.stringify(data, null, 2)}`
  );
}

async function img2prompt(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /img2prompt <url>");
  const data = await get(`${NEXRAY}/ai/image2prompt?url=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ image2prompt error.");
  return send(
    token,
    chatId,
    `🖼 <b>Image → Prompt</b>\n\n${data.result || data.prompt || JSON.stringify(data, null, 2)}`
  );
}

async function creart(token, chatId, q) {
  if (!q) return send(token, chatId, "Andika: /creart Beautiful");
  const data = await get(`${NEXRAY}/ai/creart?prompt=${encodeURIComponent(q)}`);
  if (!data) return send(token, chatId, "❌ CreArt error.");
  return send(
    token,
    chatId,
    `🎨 <b>CreArt</b>\n\n<b>Prompt:</b> ${q}\n<b>Image:</b> ${data.url || data.image || "-"}`
  );
}

async function askVcc(token, chatId) {
  return sendKeyboard(token, chatId, "Chagua aina ya VCC:", [
    [
      { text: "Visa", callback_data: "vcc:visa" },
      { text: "Mastercard", callback_data: "vcc:mastercard" }
    ],
    [
      { text: "Amex", callback_data: "vcc:amex" },
      { text: "JCB", callback_data: "vcc:jcb" }
    ]
  ]);
}

async function vcc(token, chatId, type) {
  const data = await get(`${NEXRAY}/tools/vcc?type=${encodeURIComponent(type)}`);
  return send(
    token,
    chatId,
    `💳 <b>VCC (${type.toUpperCase()})</b>\n\n<code>${JSON.stringify(data || {}, null, 2)}</code>`
  );
}
