import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = "/home/mari/Documents/Youtube AI Blocker";

test("client manifest declares popup, background, content script, and storage permission", async () => {
  const manifestText = await readFile(`${root}/client/manifest.json`, "utf8");
  const manifest = JSON.parse(manifestText);

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.action.default_popup, "popup/popup.html");
  assert.equal(manifest.background.service_worker, "background/background.js");
  assert.ok(manifest.permissions.includes("storage"));
  assert.ok(manifest.content_scripts[0].matches.includes("https://www.youtube.com/*"));
  assert.ok(manifest.content_scripts[0].css.includes("content/content.css"));
  assert.ok(manifest.content_scripts[0].js.includes("common/logger.js"));
  assert.ok(manifest.host_permissions.includes("http://127.0.0.1:3000/*"));
});

test("popup scaffold exposes blocking and API server settings", async () => {
  const popupHtml = await readFile(`${root}/client/popup/popup.html`, "utf8");

  assert.match(popupHtml, /id="blockingEnabled"/);
  assert.match(popupHtml, /id="debugUnknownIndicators"/);
  assert.match(popupHtml, /id="apiBaseUrl"/);
  assert.match(popupHtml, /id="saveButton"/);
  assert.match(popupHtml, /id="resetButton"/);
});

test("shared client settings define default API and blocking values", async () => {
  const settingsScript = await readFile(`${root}/client/common/settings.js`, "utf8");

  assert.match(settingsScript, /apiBaseUrl: "http:\/\/127\.0\.0\.1:3000"/);
  assert.match(settingsScript, /blockingEnabled: false/);
  assert.match(settingsScript, /debugUnknownIndicators: false/);
  assert.match(settingsScript, /chrome\.storage\.sync/);
  assert.match(settingsScript, /chrome\.storage\.local/);
  assert.match(settingsScript, /DEVICE_ID_STORAGE_KEY/);
  assert.match(settingsScript, /crypto\?\.randomUUID/);
});

test("content script scaffold includes interactive watch page controls", async () => {
  const contentScript = await readFile(`${root}/client/content/content.js`, "utf8");

  assert.match(contentScript, /findActionRow/);
  assert.match(contentScript, /Flag as AI/);
  assert.match(contentScript, /Upvote/);
  assert.match(contentScript, /Downvote/);
  assert.match(contentScript, /API Error/);
  assert.match(contentScript, /data-yaib-action="flag"/);
  assert.match(contentScript, /data-yaib-action="upvote"/);
  assert.match(contentScript, /data-yaib-action="downvote"/);
  assert.match(contentScript, /handleFlag/);
  assert.match(contentScript, /handleVote/);
  assert.match(contentScript, /Saving flag/);
  assert.match(contentScript, /Submitting vote/);
  assert.match(contentScript, /currentDeviceVote/);
  assert.match(contentScript, /yaib-button--active/);
  assert.match(contentScript, /aria-pressed/);
  assert.match(contentScript, /yaib-watch-toast/);
  assert.match(contentScript, /collectVideoCardTargets/);
  assert.match(contentScript, /renderVideoCardHighlights/);
  assert.match(contentScript, /bulkLookup/);
  assert.match(contentScript, /ytd-rich-item-renderer/);
  assert.match(contentScript, /ytd-rich-grid-media/);
  assert.match(contentScript, /ytd-rich-grid-slim-media/);
  assert.match(contentScript, /debugUnknownIndicators/);
  assert.match(contentScript, /AI Unknown/);
  assert.match(contentScript, /Show anyway/);
  assert.match(contentScript, /temporarilyRevealedVideoIds/);
  assert.match(contentScript, /blockingEnabled/);
  assert.match(contentScript, /AI Video Hidden/);
  assert.match(contentScript, /Video-card detection snapshot/);
  assert.match(contentScript, /Video-card bulk lookup failed/);
  assert.match(contentScript, /SUCCESS_STATUS_MS/);
  assert.match(contentScript, /yt-navigate-finish/);
  assert.match(contentScript, /renderScheduled/);
  assert.match(contentScript, /Watch-page API request failed/);
});

test("logger utility provides a stable filterable prefix", async () => {
  const loggerScript = await readFile(`${root}/client/common/logger.js`, "utf8");

  assert.match(loggerScript, /\[YAIB\]/);
  assert.match(loggerScript, /console\.info/);
  assert.match(loggerScript, /console\.warn/);
  assert.match(loggerScript, /console\.error/);
});

test("content CSS defines dark mode variables and toast styles for injected controls", async () => {
  const css = await readFile(`${root}/client/content/content.css`, "utf8");

  assert.match(css, /html\[dark\]/);
  assert.match(css, /--yaib-pill-text: #f1f1f1/);
  assert.match(css, /var\(--yaib-pill-text\)/);
  assert.match(css, /var\(--yaib-pill-bg\)/);
  assert.match(css, /--yaib-button-active-bg/);
  assert.match(css, /--yaib-card-badge-bg/);
  assert.match(css, /\.yaib-button--active/);
  assert.match(css, /\.yaib-card-badge/);
  assert.match(css, /\.yaib-card--high/);
  assert.match(css, /\.yaib-card-blocked/);
  assert.match(css, /\.yaib-watch-blocked/);
  assert.match(css, /\.yaib-block-overlay/);
  assert.match(css, /\.yaib-block-overlay__button/);
  assert.match(css, /\.yaib-thumbnail-host/);
  assert.match(css, /text-shadow:/);
  assert.match(css, /backdrop-filter: blur/);
  assert.match(css, /--yaib-toast-success-border/);
  assert.match(css, /\.yaib-toast/);
  assert.match(css, /\.yaib-toast--visible/);
});
