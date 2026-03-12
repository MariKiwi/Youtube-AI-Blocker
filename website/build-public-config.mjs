import { writeFileSync } from "node:fs";

const outputPath = process.argv[2] ?? "./public-config.js";

const config = {
  publicWebsiteUrl: process.env.PUBLIC_WEBSITE_URL ?? "https://your-website.example",
  chromeWebStoreUrl: process.env.CHROME_WEB_STORE_URL ?? "https://chromewebstore.google.com/",
  firefoxAddonsUrl: process.env.FIREFOX_ADDONS_URL ?? "https://addons.mozilla.org/",
  githubSourceUrl: process.env.GITHUB_SOURCE_URL ?? "https://github.com/MattiKiwi/Youtube-AI-Blocker",
  githubReleasesUrl: process.env.GITHUB_RELEASES_URL ?? "https://github.com/MattiKiwi/Youtube-AI-Blocker/releases",
  umamiScriptUrl: process.env.UMAMI_SCRIPT_URL ?? "",
  umamiWebsiteId: process.env.UMAMI_WEBSITE_ID ?? "",
  umamiHostUrl: process.env.UMAMI_HOST_URL ?? "",
  umamiDomains: process.env.UMAMI_DOMAINS ?? "",
};

writeFileSync(
  outputPath,
  `window.YouTubeAiBlockerPublicConfig = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
);
