function isAssetRequest(pathname) {
  return pathname.includes(".");
}

export default {
  async fetch(request, env) {
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
        },
      });
    }

    const url = new URL(request.url);
    let response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || isAssetRequest(url.pathname)) {
      return response;
    }

    url.pathname = "/index.html";

    response = await env.ASSETS.fetch(
      new Request(url.toString(), request),
    );

    return response;
  },
};
