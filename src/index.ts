export default {
  async fetch(request, env) {
    const apiKey = request.headers.get("x-api-key") || env.MUSTIKA_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const path = new URL(request.url).pathname.replace(/^\/api/, "") || request.url;
    const targetUrl = "https://mustikapayment.com" + path;

    const body = request.method === "POST" ? await request.text() : null;

    const resp = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-api-key": apiKey,
      },
      body,
    });

    const text = await resp.text();

    try {
      const json = JSON.parse(text);
      return new Response(JSON.stringify(json), {
        status: resp.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      return new Response(text, {
        status: resp.status,
        headers: { "Content-Type": "text/html" },
      });
    }
  },
};
