import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("root readme is user-friendly and links to the website placeholder and docs", async () => {
  const readme = await readFile(`${root}/README.md`, "utf8");

  assert.match(readme, /YouTube AI Blocker is an open source project/i);
  assert.match(readme, /https:\/\/your-website\.example/);
  assert.match(readme, /docs\/README\.md/);
  assert.match(readme, /For First-Time Users/);
  assert.match(readme, /Contributing/);
  assert.match(readme, /make deploy-stack/);
  assert.match(readme, /make build-extension/);
  assert.match(readme, /make build-firefox-addon/);
});

test("docs index links the main detailed documentation files", async () => {
  const docsIndex = await readFile(`${root}/docs/README.md`, "utf8");

  assert.match(docsIndex, /Documentation Index/);
  assert.match(docsIndex, /client-extension\.md/);
  assert.match(docsIndex, /client-publishing\.md/);
  assert.match(docsIndex, /api\.md/);
  assert.match(docsIndex, /server-deployment\.md/);
  assert.match(docsIndex, /testing\.md/);
});
