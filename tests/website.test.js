import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

const root = path.resolve(import.meta.dirname, "..");
const execFileAsync = promisify(execFile);

test("website landing page includes core project messaging and SEO metadata", async () => {
  const html = await readFile(`${root}/website/index.html`, "utf8");

  assert.match(html, /<title>YouTube AI Blocker \| Flag, Highlight, and Block AI Videos<\/title>/);
  assert.match(html, /name="description"/);
  assert.match(html, /open source browser extension/i);
  assert.match(html, /Store install when available, manual install when needed/i);
  assert.match(html, /Chrome Web Store/);
  assert.match(html, /Firefox Add-ons/);
  assert.match(html, /GitHub Releases/);
  assert.match(html, /href="\/manual-install\/"/);
  assert.doesNotMatch(html, /manual-install\.html/);
  assert.match(html, /third-party extension installs/i);
  assert.match(html, /github\.com\/MariKiwi\/Youtube-AI-Blocker\/releases/);
  assert.match(html, /How it works/);
  assert.match(html, /anonymous voting/i);
  assert.match(html, /optional blocking/i);
  assert.match(html, /https:\/\/github\.com\/MariKiwi\/Youtube-AI-Blocker/);
  assert.match(html, /mario-ame-EUTXu9T36XU-unsplash\.jpg/);
  assert.match(html, /mario-ame-fSfv8RhkvCs-unsplash\.jpg/);
  assert.match(html, /logan-voss-vJy0DdZ6NVk-unsplash\.jpg/);
  assert.match(html, /Photo credits/);
  assert.match(html, /Mario Amé/);
  assert.match(html, /Logan Voss/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /FAQ/);
  assert.match(html, /YAIB_GOOGLE_SITE_VERIFICATION/);
  assert.match(html, /data-public-link="chromeWebStoreUrl"/);
  assert.match(html, /data-public-link="firefoxAddonsUrl"/);
  assert.match(html, /data-public-link="githubSourceUrl"/);
  assert.match(html, /data-public-link="githubReleasesUrl"/);
  assert.match(html, /data-open-cookie-settings/);
  assert.match(html, /cookie-settings-fab/);
  assert.match(html, /cookieBanner/);
  assert.match(html, /Accept analytics/);
  assert.match(html, /Decline non-essential cookies/);
  assert.match(html, /Cookie consent/);
  assert.match(html, /\/public-config\.js/);
});

test("website manual install guide exists and links the user through unpacked install flow", async () => {
  const html = await readFile(`${root}/website/manual-install.html`, "utf8");

  assert.match(html, /Manual Install \| YouTube AI Blocker/);
  assert.match(html, /chromium-based browsers/i);
  assert.match(html, /chrome:\/\/extensions/);
  assert.match(html, /Developer mode/);
  assert.match(html, /Load unpacked/);
  assert.match(html, /dist\/extension\//);
  assert.match(html, /github\.com\/MariKiwi\/Youtube-AI-Blocker\/releases/);
  assert.match(html, /data-public-link="githubReleasesUrl"/);
  assert.match(html, /data-public-link="githubSourceUrl"/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/#install"/);
  assert.doesNotMatch(html, /index\.html/);
  assert.match(html, /data-open-cookie-settings/);
  assert.match(html, /cookie-settings-fab/);
  assert.match(html, /Accept analytics/);
  assert.match(html, /\/public-config\.js/);
});

test("website build assets define themed styling and clean-route generation", async () => {
  const css = await readFile(`${root}/website/styles.css`, "utf8");
  const js = await readFile(`${root}/website/script.js`, "utf8");
  const publicConfig = await readFile(`${root}/website/public-config.js`, "utf8");
  const publicConfigScript = await readFile(`${root}/website/generate-public-config.sh`, "utf8");
  const publicConfigBuilder = await readFile(`${root}/website/build-public-config.mjs`, "utf8");
  const googleInjector = await readFile(`${root}/website/inject-google-verification.mjs`, "utf8");
  const siteOutputBuilder = await readFile(`${root}/website/generate-site-output.mjs`, "utf8");
  const nginxConfig = await readFile(`${root}/website/nginx.conf`, "utf8");
  const dockerfile = await readFile(`${root}/website/Dockerfile`, "utf8");

  assert.match(css, /color-scheme: light dark/);
  assert.match(css, /Space Grotesk/);
  assert.match(css, /radial-gradient/);
  assert.match(css, /\.hero__content/);
  assert.match(css, /\.feature-grid/);
  assert.match(css, /\.install-grid/);
  assert.match(css, /\.install-card/);
  assert.match(css, /\.install-note/);
  assert.match(css, /\.cookie-banner/);
  assert.match(css, /\.cookie-banner__actions/);
  assert.match(css, /\.cookie-settings-fab/);
  assert.match(css, /\.cookie-settings-fab--raised/);
  assert.match(css, /\.steps--manual/);
  assert.match(css, /\.page-title/);
  assert.match(css, /\.photo-credits/);
  assert.match(css, /\.preview-card__image/);
  assert.match(css, /\.preview-card__image--hero/);
  assert.match(css, /object-fit: cover/);
  assert.match(css, /\.feed-item__image/);
  assert.match(css, /@media \(prefers-color-scheme: dark\)/);
  assert.match(publicConfig, /YouTubeAiBlockerPublicConfig/);
  assert.match(publicConfig, /chromeWebStoreUrl/);
  assert.match(publicConfig, /githubReleasesUrl/);
  assert.match(publicConfig, /umamiScriptUrl/);
  assert.match(publicConfig, /umamiWebsiteId/);
  assert.match(publicConfigScript, /build-public-config\.mjs/);
  assert.match(publicConfigBuilder, /PUBLIC_WEBSITE_URL/);
  assert.match(publicConfigBuilder, /CHROME_WEB_STORE_URL/);
  assert.match(publicConfigBuilder, /GITHUB_SOURCE_URL/);
  assert.match(publicConfigBuilder, /UMAMI_SCRIPT_URL/);
  assert.match(publicConfigBuilder, /UMAMI_WEBSITE_ID/);
  assert.match(googleInjector, /escapeHtmlAttribute/);
  assert.match(siteOutputBuilder, /sitemap\.xml/);
  assert.match(siteOutputBuilder, /routePathForHtml/);
  assert.match(siteOutputBuilder, /outputPathForHtml/);
  assert.match(siteOutputBuilder, /buildLegacyRedirect/);
  assert.match(nginxConfig, /try_files \$uri \$uri\/ =404/);
  assert.match(nginxConfig, /location = \/sitemap\.xml/);
  assert.match(dockerfile, /generate-site-output\.mjs/);
  assert.match(dockerfile, /COPY --from=builder \/app\/.site-build \/usr\/share\/nginx\/html/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /currentYear/);
  assert.match(js, /data-reveal/);
  assert.match(js, /data-public-link/);
  assert.match(js, /YouTubeAiBlockerPublicConfig/);
  assert.match(js, /yaib_analytics_consent/);
  assert.match(js, /script\.defer = true/);
  assert.match(js, /data-website-id/);
  assert.doesNotMatch(js, /data-yaib-umami/);
  assert.doesNotMatch(js, /data-do-not-track/);
  assert.doesNotMatch(js, /data-host-url/);
  assert.doesNotMatch(js, /data-domains/);
  assert.match(js, /data-open-cookie-settings/);
  assert.match(js, /cookieBannerStatus/);
  assert.match(js, /cookie-settings-fab--raised/);
  assert.match(js, /showConsentBanner/);
  assert.match(js, /sanitizeHttpUrl/);
});

test("website build output generates clean routes, legacy redirects, and sitemap entries", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), 'yaib-site-'));

  try {
    await execFileAsync('node', [
      `${root}/website/generate-site-output.mjs`,
      `${root}/website`,
      outputDir,
    ], {
      cwd: root,
      env: {
        ...process.env,
        PUBLIC_WEBSITE_URL: 'https://yaib.example',
      },
    });

    const sitemap = await readFile(path.join(outputDir, 'sitemap.xml'), 'utf8');
    const cleanManualPage = await readFile(path.join(outputDir, 'manual-install', 'index.html'), 'utf8');
    const legacyRedirect = await readFile(path.join(outputDir, 'manual-install.html'), 'utf8');

    assert.match(sitemap, /<loc>https:\/\/yaib\.example\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/yaib\.example\/manual-install\/<\/loc>/);
    assert.match(cleanManualPage, /Manual Install \| YouTube AI Blocker/);
    assert.match(legacyRedirect, /url=\/manual-install\//);
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});
