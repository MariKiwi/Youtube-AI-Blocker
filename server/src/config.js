import dotenv from "dotenv";

dotenv.config();

const parsePort = (value) => {
  const port = Number.parseInt(value ?? "3000", 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error("PORT must be a positive integer");
  }

  return port;
};

export const config = {
  port: parsePort(process.env.PORT),
  host: process.env.HOST ?? "0.0.0.0",
  databaseUrl: process.env.DATABASE_URL ?? "",
  defaultClientOrigin: process.env.DEFAULT_CLIENT_ORIGIN ?? "https://www.youtube.com",
};

export function validateConfig() {
  const required = ["DATABASE_URL"];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}
