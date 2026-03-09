export function buildRateLimitPlugin(options = {}) {
  const store = new Map();
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 30;

  return async function rateLimitPlugin(fastify) {
    fastify.addHook("onRequest", async (request, reply) => {
      const routePath = request.routeOptions?.url ?? request.url;
      const isWriteVideoRoute = request.method === "POST"
        && (
          routePath === "/videos/:youtubeVideoId/flag"
          || routePath === "/videos/:youtubeVideoId/vote"
          || /\/videos\/[^/]+\/flag$/.test(request.url)
          || /\/videos\/[^/]+\/vote$/.test(request.url)
        );

      if (!isWriteVideoRoute) {
        return;
      }

      const key = `${request.ip}:${routePath}`;
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now >= entry.resetAt) {
        store.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });
        return;
      }

      if (entry.count >= maxRequests) {
        return reply.status(429).send({
          error: "Too Many Requests",
          message: "Rate limit exceeded for write requests",
        });
      }

      entry.count += 1;
    });
  };
}
