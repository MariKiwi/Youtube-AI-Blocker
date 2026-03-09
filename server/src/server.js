import { buildApp } from "./app.js";
import { config, validateConfig } from "./config.js";

const start = async () => {
  validateConfig();

  const app = buildApp();

  try {
    await app.listen({
      host: config.host,
      port: config.port,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
