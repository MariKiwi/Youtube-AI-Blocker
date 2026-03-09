import cors from "@fastify/cors";
import Fastify from "fastify";

import { config } from "./config.js";
import { prisma } from "./db.js";
import { buildRateLimitPlugin } from "./plugins/rate-limit.js";
import { healthRoutes } from "./routes/health.js";
import { videoRoutes } from "./routes/videos.js";
import { buildVideoService } from "./services/videos.js";

export function buildApp(options = {}) {
  const app = Fastify({
    logger: true,
  });
  const videoService = buildVideoService(options.videoService);

  app.register(cors, {
    origin: options.allowedOrigins ?? config.allowedOrigins,
    credentials: false,
  });

  const registerRateLimit = buildRateLimitPlugin(options.rateLimit ?? {
    windowMs: config.writeRateLimitWindowMs,
    maxRequests: config.writeRateLimitMaxRequests,
  });
  registerRateLimit(app);

  app.decorate("videoService", videoService);

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (reply.sent) {
      return;
    }

    reply.status(error.statusCode ?? 500).send({
      error: error.name,
      message: error.statusCode && error.statusCode < 500
        ? error.message
        : "Internal Server Error",
    });
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  app.register(healthRoutes);
  app.register(videoRoutes);

  return app;
}
