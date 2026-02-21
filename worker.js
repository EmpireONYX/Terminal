export default {
  async fetch(req, env) {
    if (req.method !== "POST") return new Response("OK", { status: 200 });

    // Basic CORS (allow your GitHub Pages site)
    const origin = req.headers.get("Origin") || "";
    const allowed = [
      "https://empireonyx.github.io",
    ];
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") return new Response("", { headers: corsHeaders });

    const body = await req.json().catch(() => null);
    if (!body) return new Response("Bad JSON", { status: 400, headers: corsHeaders });

    // Simple anti-spam: require a token you store in the Worker (optional)
    // if (body.token !== env.EVENT_TOKEN) return new Response("Nope", { status: 403, headers: corsHeaders });

    const payload = {
      content:
        `**TERMINAL EVENT:** ${body.event || "unknown"}\n` +
        `**Reason:** ${body.reason || "n/a"}\n` +
        `**Page:** ${body.page || "n/a"}\n` +
        `**Time:** ${new Date().toISOString()}\n` +
        "```json\n" + JSON.stringify(body.meta || {}, null, 2) + "\n```"
    };

    await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return new Response("logged", { status: 200, headers: corsHeaders });
  }
};
