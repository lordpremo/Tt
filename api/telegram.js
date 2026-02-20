// api/telegram.js

const TELEGRAM_API = (token) => `https://api.telegram.org/bot${token}`;
const NEXRAY_BASE = "https://api.nexray.web.id";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, message: "BROKEN LORD Telegram webhook" });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    console.error("BOT_TOKEN missing in env");
    return res.status(500).json({ ok: false, error: "BOT_TOKEN not set" });
  }

  const update = req.body;

  try {
    if (update.message) {
      await handleMessage(BOT_TOKEN, update.message);
    } else if (update.callback_query) {
      await handleCallback(BOT_TOKEN, update.callback_query);
    }
  } catch (err) {
    console.error("Error handling update:", err);
  }

  return res.status(200).json({ ok: true });
}

async function handleMessage(token, message) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (!text) {
    return sendMessage(token, chatId, "Nipe command, kaka 😄");
  }

  if (text === "/start") {
    return sendMessage(
      token,
      chatId,
      [
        "🔥 <b>BROKEN LORD BOT</b> 🔥",
        "",
        "Karibu kwenye mfumo wa BROKEN LORD ⚡",
        "Hapa unaweza kutumia API za Nexray moja kwa moja:",
        "",
        "<b>COMMANDS:</b>",
        "/yt Zuchu - YouTube Play",
        "/ai Hi - TurboChat",
        "/suno love - Suno Music",
        "/logo Spider - Solo Logo",
        "/math 2+2 - MathGPT",
        "/img2prompt <url> - Image → Prompt",
        "/creart Beautiful - Create Art",
        "/vcc - Virtual Card Generator",
        "",
        "<b>Powered by:</b> BROKEN LORD ENGINE ⚡"
      ].join("\n")
    );
  }

  const [cmd, ...rest] = text.split(" ");
  const arg = rest.join(" ").trim();

  switch (cmd.toLowerCase()) {
    case "/yt":
      if (!arg) return sendMessage(token, chatId, "Andika: /yt Zuchu");
      return ytPlay(token, chatId, arg);

    case "/ai":
      if (!arg) return sendMessage(token, chatId, "Andika: /ai Hi");
      return turboChat(token, chatId, arg);

    case "/suno":
      if (!arg) return sendMessage(token, chatId, "Andika: /suno love");
      return sunoMusic(token, chatId, arg);

    case "/logo":
      if (!arg) return sendMessage(token, chatId, "Andika: /logo Spider");
      return soloLogo(token, chatId, arg);

    case "/math":
      if (!arg) return sendMessage(token, chatId, "Andika: /math 2+2");
      return mathGPT(token, chatId, arg);

    case "/img2prompt":
      if (!arg) return sendMessage(token, chatId, "Andika: /img2prompt <image_url>");
      return image2prompt(token, chatId, arg);

    case "/creart":
      if (!arg) return sendMessage(token, chatId, "Andika: /creart Beautiful");
      return creart(token, chatId, arg);

    case "/vcc":
      return askVccType(token, chatId);

    default:
      return sendMessage(token, chatId, "Sijaelewa hii command, tumia /start kuona list.");
  }
}

async function handleCallback(token, callback) {
  const chatId = callback.message.chat.id;
  const data = callback.data;

  if (data.startsWith("vcc:")) {
    const type = data.split(":")[1];
    await sendMessage(token, chatId, `⏳ Natoa VCC ya aina: ${type.toUpperCase()}...`);
    return vcc(token, chatId, type);
  }
}

// TELEGRAM HELPERS

async function sendMessage(token, chatId, text, extra = {}) {
  const url = `${TELEGRAM_API(token)}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error("sendMessage error:", err);
  }
}

async function sendInlineKeyboard(token, chatId, text, keyboard) {
  return sendMessage(token, chatId, text, {
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
}

// NEXRAY HELPERS

async function safeGet(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Nexray error:", res.status, url);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("safeGet error:", err);
    return null;
  }
}

async function ytPlay(token, chatId, query) {
  const url = `${NEXRAY_BASE}/downloader/ytplay?q=${encodeURIComponent(query)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage(token, chatId, "❌ YTPlay error.");

  const title = data.title || "Result";
  const dl = data.url || data.download_url || "";
  let msg = `🎵 <b>YouTube Play</b>\n\n<b>Title:</b> ${title}`;
  if (dl) msg += `\n<b>Download:</b> ${dl}`;
  return sendMessage(token, chatId, msg);
}

async function turboChat(token, chatId, text) {
  const url = `${NEXRAY_BASE}/ai/turbochat?text=${encodeURIComponent(text)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage(token, chatId, "❌ Turbochat error.");

  const reply = data.result || data.response || JSON.stringify(data, null, 2);
  return sendMessage(token, chatId, `🤖 <b>Turbochat</b>\n\n${reply}`);
}

async function sunoMusic(token, chatId, prompt) {
  const url = `${NEXRAY_BASE}/ai/suno?prompt=${encodeURIComponent(prompt)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage(token, chatId, "❌ Suno error.");

  const link = data.url || data.audio || "";
  let msg = `🎶 <b>Suno Music</b>\n\n<b>Prompt:</b> ${prompt}`;
  if (link) msg += `\n<b>Audio:</b> ${link}`;
  return sendMessage(token, chatId, msg);
}

async function soloLogo(token, chatId, prompt) {
  const url = `${NEXRAY_BASE}/ai/sologo?prompt=${encodeURIComponent(prompt)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage(token, chatId, "❌ Logo error.");

  const img = data.url || data.image || "";
  let msg = `🎨 <b>Solo Logo</b>\n\n<b>Prompt:</b> ${prompt}`;
  if (img) msg += `\n<b>Image:</b> ${img}`;
  return sendMessage(token, chatId, msg);
}

async function mathGPT(token, chatId, text) {
  const url = `${NEXRAY_BASE}/ai/mathgpt?text=${encodeURIComponent(text)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage(token, chatId, "❌ MathGPT error.");

  const ans = data.result || data.answer || JSON.stringify(data, null, 2);
  return sendMessage(token, chatId, `📐 <b>MathGPT</b>\n\n${ans}`);
}

async function image2prompt(token, chatId, imageUrl) {
  const url = `${NEXRAY_BASE}/ai/image2prompt?url=${encodeURIComponent(imageUrl)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage(token, chatId, "❌ image2prompt error.");

  const prompt = data.result || data.prompt || JSON.stringify(data, null, 2);
  return sendMessage(token, chatId, `🖼 <b>Image → Prompt</b>\n\n${prompt}`);
}

async function creart(token, chatId, prompt) {
  const url = `${NEXRAY_BASE}/ai/creart?prompt=${encodeURIComponent(prompt)}`;
  const data = await safeGet(url);
  if (!data) return sendMessage
