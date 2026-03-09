export async function healthRoutes(fastify) {
  fastify.get("/health", async () => ({
    status: "ok",
    service: "youtube-ai-blocker-server",
  }));
}

