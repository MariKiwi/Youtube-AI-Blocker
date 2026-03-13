import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const execFileAsync = promisify(execFile);

test("client manifest declares popup, background, content script, and storage permission", async () => {
  const manifestText = await readFile(`${root}/client/manifest.json`, "utf8");
  const manifest = JSON.parse(manifestText);

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.action.default_popup, "popup/popup.html");
  assert.deepEqual(manifest.action.default_icon, {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
  });
  assert.equal(manifest.background.service_worker, "background/background.js");
  assert.ok(manifest.permissions.includes("storage"));
  assert.ok(manifest.content_scripts[0].matches.includes("https://www.youtube.com/*"));
  assert.ok(manifest.content_scripts[0].css.includes("content/content.css"));
  assert.ok(manifest.content_scripts[0].js.includes("common/logger.js"));
  assert.ok(manifest.host_permissions.includes("http://127.0.0.1:3000/*"));
  assert.deepEqual(manifest.icons, {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png",
  });
});

test("popup scaffold exposes blocking and API server settings", async () => {
  const popupHtml = await readFile(`${root}/client/popup/popup.html`, "utf8");

  assert.match(popupHtml, /popup__brand-mark/);
  assert.match(popupHtml, /id="blockingEnabled"/);
  assert.match(popupHtml, /id="debugUnknownIndicators"/);
  assert.match(popupHtml, /toggle__slider/);
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

test("settings hydration preserves saved values while filling missing keys from packaged defaults", async () => {
  const settingsScript = await readFile(`${root}/client/common/settings.js`, "utf8");
  const backgroundScript = await readFile(`${root}/client/background/background.js`, "utf8");

  assert.match(settingsScript, /function hydrateSettings/);
  assert.match(backgroundScript, /hydrateSettings\(storedSettings\)/);
  assert.match(backgroundScript, /storage\.get\(\[settingsApi\.STORAGE_KEY\]/);
});

test("content script scaffold includes interactive watch page controls", async () => {
  const contentScript = await readFile(`${root}/client/content/content.js`, "utf8");

  assert.match(contentScript, /findActionRow/);
  assert.match(contentScript, /#top-level-buttons-computed/);
  assert.match(contentScript, /Flag as AI/);
  assert.match(contentScript, /Upvote/);
  assert.match(contentScript, /Downvote/);
  assert.match(contentScript, /API Error/);
  assert.match(contentScript, /buildActionButton/);
  assert.match(contentScript, /button\.dataset\.yaibAction = action/);
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
  assert.match(contentScript, /yt-page-data-updated/);
  assert.match(contentScript, /renderScheduled/);
  assert.match(contentScript, /rerenderRequested/);
  assert.match(contentScript, /extensionContextInvalidated/);
  assert.match(contentScript, /isExtensionContextInvalidatedError/);
  assert.match(contentScript, /handleExtensionContextInvalidated/);
  assert.match(contentScript, /Extension context invalidated; stopping page observers until reload/);
  assert.match(contentScript, /Watch-page API request failed/);
  assert.doesNotMatch(contentScript, /\.innerHTML\s*=/);
});

test("logger utility provides a stable filterable prefix", async () => {
  const loggerScript = await readFile(`${root}/client/common/logger.js`, "utf8");

  assert.match(loggerScript, /\[YAIB\]/);
  assert.match(loggerScript, /console\.info/);
  assert.match(loggerScript, /console\.warn/);
  assert.match(loggerScript, /console\.error/);
});

test("background script supports both service worker and Firefox background script contexts", async () => {
  const backgroundScript = await readFile(`${root}/client/background/background.js`, "utf8");

  assert.match(backgroundScript, /typeof importScripts === "function"/);
  assert.match(backgroundScript, /importScripts\("\.\.\/common\/logger\.js", "\.\.\/common\/settings\.js"\)/);
});

test("content CSS defines dark mode variables and toast styles for injected controls", async () => {
  const css = await readFile(`${root}/client/content/content.css`, "utf8");

  assert.match(css, /html\[dark\]/);
  assert.match(css, /--yaib-pill-text: #f1f1f1/);
  assert.match(css, /var\(--yaib-pill-text\)/);
  assert.match(css, /var\(--yaib-pill-bg\)/);
  assert.match(css, /--yaib-button-active-bg/);
  assert.match(css, /--yaib-group-bg/);
  assert.match(css, /--yaib-card-badge-bg/);
  assert.match(css, /\.yaib-button--active/);
  assert.match(css, /\.yaib-controls/);
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

test("popup CSS defines YouTube-like themed surfaces for light and dark mode", async () => {
  const css = await readFile(`${root}/client/popup/popup.css`, "utf8");

  assert.match(css, /color-scheme: light dark/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(css, /--primary: #ff0033/);
  assert.match(css, /\.popup__brand-mark/);
  assert.match(css, /\.toggle__slider/);
  assert.match(css, /\.button--primary/);
});

test("extension packaging workflow exists for local builds and store upload zips", async () => {
  const buildScript = await readFile(`${root}/scripts/build-extension.sh`, "utf8");
  const firefoxBuildScript = await readFile(`${root}/scripts/build-firefox-addon.sh`, "utf8");
  const makefile = await readFile(`${root}/Makefile`, "utf8");
  const clientReadme = await readFile(`${root}/client/README.md`, "utf8");
  const publishingDoc = await readFile(`${root}/docs/client-publishing.md`, "utf8");

  assert.match(buildScript, /CLIENT_DIR=.*client/);
  assert.match(buildScript, /DIST_DIR=.*dist/);
  assert.match(buildScript, /ZIP_PATH=.*youtube-ai-blocker-extension\.zip/);
  assert.match(buildScript, /ENV_PATH=.*\.env/);
  assert.match(buildScript, /EXTENSION_DEFAULT_API_BASE_URL/);
  assert.match(buildScript, /EXTENSION_VERSION/);
  assert.match(buildScript, /EXTENSION_DEFAULT_BLOCKING_ENABLED/);
  assert.match(buildScript, /EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS/);
  assert.match(buildScript, /PUBLIC_WEBSITE_URL/);
  assert.match(buildScript, /cp -R "\$CLIENT_DIR"\/\. "\$BUILD_DIR"\//);
  assert.match(buildScript, /manifest\.host_permissions/);
  assert.match(buildScript, /manifest\.homepage_url/);
  assert.match(buildScript, /const fs = require\("fs"\);/);
  assert.match(buildScript, /Failed to update packaged default settings/);
  assert.match(buildScript, /zipfile\.ZipFile/);
  assert.match(firefoxBuildScript, /FIREFOX_ADDON_ID/);
  assert.match(firefoxBuildScript, /browser_specific_settings/);
  assert.match(firefoxBuildScript, /strict_min_version/);
  assert.match(firefoxBuildScript, /EXTENSION_DEFAULT_API_BASE_URL/);
  assert.match(firefoxBuildScript, /EXTENSION_VERSION/);
  assert.match(firefoxBuildScript, /EXTENSION_DEFAULT_BLOCKING_ENABLED/);
  assert.match(firefoxBuildScript, /EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS/);
  assert.match(firefoxBuildScript, /manifest\.host_permissions/);
  assert.match(firefoxBuildScript, /manifest\.homepage_url/);
  assert.match(firefoxBuildScript, /const fs = require\("fs"\);/);
  assert.match(firefoxBuildScript, /youtube-ai-blocker-firefox-addon\.zip/);
  assert.match(makefile, /^build-extension:\n\tsh \.\/scripts\/build-extension\.sh/m);
  assert.match(makefile, /^build-firefox-addon:\n\tsh \.\/scripts\/build-firefox-addon\.sh/m);
  assert.match(clientReadme, /make build-extension/);
  assert.match(clientReadme, /make build-firefox-addon/);
  assert.match(publishingDoc, /Chrome Web Store/i);
  assert.match(publishingDoc, /Firefox Add-ons/i);
  assert.match(publishingDoc, /dist\/youtube-ai-blocker-extension\.zip/);
  assert.match(publishingDoc, /dist\/youtube-ai-blocker-firefox-addon\.zip/);
});

test("build scripts stamp packaged extension defaults and manifest permissions from deploy config", async () => {
  const env = {
    ...process.env,
    PUBLIC_WEBSITE_URL: "https://yaib.example",
    PUBLIC_API_BASE_URL: "https://api.yaib.example",
    EXTENSION_DEFAULT_API_BASE_URL: "https://api.yaib.example/v1",
    EXTENSION_VERSION: "0.1.1",
    EXTENSION_DEFAULT_BLOCKING_ENABLED: "true",
    EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS: "true",
    FIREFOX_ADDON_ID: "firefox-addon@example.com",
    FIREFOX_MIN_VERSION: "128.0",
  };

  await execFileAsync("sh", ["./scripts/build-extension.sh"], {
    cwd: root,
    env,
  });

  await execFileAsync("sh", ["./scripts/build-firefox-addon.sh"], {
    cwd: root,
    env,
  });

  const chromiumManifest = JSON.parse(await readFile(`${root}/dist/extension/manifest.json`, "utf8"));
  const chromiumSettings = await readFile(`${root}/dist/extension/common/settings.js`, "utf8");
  const firefoxManifest = JSON.parse(await readFile(`${root}/dist/firefox-addon/manifest.json`, "utf8"));
  const firefoxSettings = await readFile(`${root}/dist/firefox-addon/common/settings.js`, "utf8");

  assert.deepEqual(chromiumManifest.host_permissions, [
    "https://www.youtube.com/*",
    "https://api.yaib.example/*",
  ]);
  assert.equal(chromiumManifest.homepage_url, "https://yaib.example");
  assert.equal(chromiumManifest.version, "0.1.1");
  assert.match(chromiumSettings, /apiBaseUrl: "https:\/\/api\.yaib\.example\/v1"/);
  assert.match(chromiumSettings, /blockingEnabled: true/);
  assert.match(chromiumSettings, /debugUnknownIndicators: true/);

  assert.deepEqual(firefoxManifest.host_permissions, [
    "https://www.youtube.com/*",
    "https://api.yaib.example/*",
  ]);
  assert.equal(firefoxManifest.homepage_url, "https://yaib.example");
  assert.equal(firefoxManifest.version, "0.1.1");
  assert.deepEqual(firefoxManifest.background, {
    scripts: [
      "common/logger.js",
      "common/settings.js",
      "background/background.js",
    ],
  });
  assert.equal(firefoxManifest.browser_specific_settings.gecko.id, "firefox-addon@example.com");
  assert.equal(firefoxManifest.browser_specific_settings.gecko.strict_min_version, "128.0");
  assert.equal(firefoxManifest.background.service_worker, undefined);
  assert.match(firefoxSettings, /apiBaseUrl: "https:\/\/api\.yaib\.example\/v1"/);
  assert.match(firefoxSettings, /blockingEnabled: true/);
  assert.match(firefoxSettings, /debugUnknownIndicators: true/);
});

test("firefox add-on zip puts manifest at archive root", async () => {
  const env = {
    ...process.env,
    PUBLIC_WEBSITE_URL: "https://yaib.example",
    PUBLIC_API_BASE_URL: "https://api.yaib.example",
    EXTENSION_DEFAULT_API_BASE_URL: "https://api.yaib.example/v1",
    FIREFOX_ADDON_ID: "firefox-addon@example.com",
    FIREFOX_MIN_VERSION: "128.0",
  };

  execFileSync("sh", ["./scripts/build-firefox-addon.sh"], {
    cwd: root,
    env,
  });

  const listing = execFileSync("python3", ["-c", "import sys, zipfile; z=zipfile.ZipFile(sys.argv[1]); sys.stdout.write(chr(10).join(z.namelist()))", `${root}/dist/youtube-ai-blocker-firefox-addon.zip`], {
    cwd: root,
    env,
    encoding: "utf8",
  });

  assert.match(listing, /^manifest\.json$/m);
  assert.doesNotMatch(listing, /^\.\/manifest\.json$/m);
});
