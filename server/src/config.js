import dotenv from "dotenv";

dotenv.config();

const parsePort = (value) => {
  const port = Number.parseInt(value ?? "3000", 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
};

const parseOrigins = (value, fallback) => {
  const origins = (value ?? fallback)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set(origins)];
};

export const config = {
  port: parsePort(process.env.PORT),
  host: process.env.HOST ?? "0.0.0.0",
  databaseUrl: process.env.DATABASE_URL ?? "",
  allowedOrigins: parseOrigins(
    process.env.CORS_ALLOWED_ORIGINS,
    process.env.DEFAULT_CLIENT_ORIGIN ?? "https://www.youtube.com",
  ),
  writeRateLimitWindowMs: Number.parseInt(process.env.WRITE_RATE_LIMIT_WINDOW_MS ?? "60000", 10),
  writeRateLimitMaxRequests: Number.parseInt(process.env.WRITE_RATE_LIMIT_MAX_REQUESTS ?? "30", 10),
};

export function validateConfig() {
  const required = ["DATABASE_URL"];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
