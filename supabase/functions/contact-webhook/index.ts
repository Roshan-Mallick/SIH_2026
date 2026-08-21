// Aegis PreFlight — contact form → Discord webhook relay.
// The Discord webhook URL lives in a Supabase secret (DISCORD_WEBHOOK_URL),
// never in the frontend bundle or git history.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) {
    return json({ ok: false, error: "Webhook not configured" }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const name = str(payload.name, 100);
  const email = str(payload.email, 200);
  const topic = str(payload.topic, 100) || "General inquiry";
  const message = str(payload.message, 2000);

  // Basic validation mirroring the HTML form requirements
  if (!name || !message) {
    return json({ ok: false, error: "Name and message are required." }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "A valid email is required." }, 400);
  }

  const embedColor = topic === "Security incident report" ? 0xff4d4d : 0xff6428;

  const discordBody = {
    username: "Aegis PreFlight — Contact",
    embeds: [
      {
        title: `📩 New contact message — ${topic}`,
        color: embedColor,
        fields: [
          { name: "Name", value: name, inline: true },
          { name: "Email", value: email, inline: true },
          { name: "Topic", value: topic, inline: true },
          { name: "Message", value: message.slice(0, 1024) || "—" },
        ],
        footer: { text: "Sent from the Aegis PreFlight contact page" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const discordRes = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(discordBody),
  });

  if (!discordRes.ok) {
    console.error("Discord webhook failed:", discordRes.status, await discordRes.text());
    return json({ ok: false, error: "Failed to deliver message. Try again later." }, 502);
  }

  return json({ ok: true });
});
