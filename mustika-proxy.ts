export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-api-key",
        },
      });
    }

    const apiKey = request.headers.get("x-api-key") || env.MUSTIKA_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ status: "error", message: "Missing API key" }), {
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      let targetUrl = "";
      let method = "GET";
      let body = null;

      if (url.pathname === "/api/createpay" || url.pathname === "/createpay") {
        targetUrl = "https://mustikapayment.com/api/createpay";
        method = "POST";
        const formData = await request.formData();
        const params = new URLSearchParams();
        for (const [key, value] of formData) {
          params.append(key, String(value));
        }
        body = params.toString();
      } else if (url.pathname === "/api/cekpay" || url.pathname === "/cekpay") {
        const refNo = url.searchParams.get("ref_no");
        targetUrl = `https://mustikapayment.com/api/cekpay?ref_no=${encodeURIComponent(refNo || "")}`;
        method = "GET";
      } else {
        return new Response(JSON.stringify({ status: "error", message: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const resp = await fetch(targetUrl, {
        method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-api-key": apiKey,
        },
        body,
      });

      const data = await resp.json();

      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ status: "error", message: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
