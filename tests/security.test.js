import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("client and website avoid unsafe HTML/script injection patterns in dynamic paths", async () => {
  const contentScript = await readFile(`${root}/client/content/content.js`, "utf8");
  const websiteScript = await readFile(`${root}/website/script.js`, "utf8");

  assert.doesNotMatch(contentScript, /\.innerHTML\s*=/);
  assert.match(contentScript, /createElement\("div"\)/);
  assert.match(contentScript, /textContent = "AI Video Hidden"/);
  assert.match(websiteScript, /sanitizeHttpUrl/);
  assert.match(websiteScript, /new URL\(value\)/);
  assert.match(websiteScript, /url\.protocol !== "http:"/);
  assert.match(websiteScript, /url\.protocol !== "https:"/);
});

test("website build path avoids shell HTML injection and uses escaped file generation", async () => {
  const dockerfile = await readFile(`${root}/website/Dockerfile`, "utf8");
  const configBuilder = await readFile(`${root}/website/build-public-config.mjs`, "utf8");
  const googleInjector = await readFile(`${root}/website/inject-google-verification.mjs`, "utf8");

  assert.doesNotMatch(dockerfile, /sed -i/);
  assert.match(dockerfile, /build-public-config\.mjs/);
  assert.match(dockerfile, /inject-google-verification\.mjs/);
  assert.match(configBuilder, /JSON\.stringify/);
  assert.match(googleInjector, /escapeHtmlAttribute/);
  assert.match(googleInjector, /google-site-verification/);
});

test("extension network entry points validate URLs before use", async () => {
  const apiClient = await readFile(`${root}/client/common/api.js`, "utf8");
  const backgroundScript = await readFile(`${root}/client/background/background.js`, "utf8");

  assert.match(apiClient, /validateHttpUrl/);
  assert.match(apiClient, /throw new Error\("Invalid API base URL"\)/);
  assert.match(backgroundScript, /new URL\(String\(message\.url\)\)/);
  assert.match(backgroundScript, /Invalid request URL/);
});
