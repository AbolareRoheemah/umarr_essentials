import { buildTelegramText, validateOrder } from "@/lib/order";

// Receives an order from the website and sends a private alert to the
// owner's Telegram. The customer still sends the order on WhatsApp, so this
// is a safety net: if Telegram isn't set up or is down, the order flow
// carries on and the response says notified: false.

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Hidden "website" field: real people leave it empty, form-filling bots don't.
  if (typeof (body as Record<string, unknown>)?.website === "string" &&
      (body as Record<string, string>).website !== "") {
    return Response.json({ ok: true, notified: false });
  }

  const result = validateOrder(body);
  if (!result.ok) {
    return Response.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("Telegram is not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID).");
    return Response.json({ ok: true, notified: false });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramText(result.order),
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error("Telegram rejected the alert, status", res.status);
      return Response.json({ ok: true, notified: false });
    }
    return Response.json({ ok: true, notified: true });
  } catch {
    console.error("Telegram alert failed (network or timeout).");
    return Response.json({ ok: true, notified: false });
  }
}
