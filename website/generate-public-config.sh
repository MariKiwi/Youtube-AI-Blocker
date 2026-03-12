#!/bin/sh

set -eu

OUTPUT_PATH="${1:-./public-config.js}"
PUBLIC_WEBSITE_URL="${PUBLIC_WEBSITE_URL:-https://your-website.example}"
CHROME_WEB_STORE_URL="${CHROME_WEB_STORE_URL:-https://chromewebstore.google.com/}"
FIREFOX_ADDONS_URL="${FIREFOX_ADDONS_URL:-https://addons.mozilla.org/}"
GITHUB_SOURCE_URL="${GITHUB_SOURCE_URL:-https://github.com/MattiKiwi/Youtube-AI-Blocker}"
GITHUB_RELEASES_URL="${GITHUB_RELEASES_URL:-https://github.com/MattiKiwi/Youtube-AI-Blocker/releases}"
UMAMI_SCRIPT_URL="${UMAMI_SCRIPT_URL:-}"
UMAMI_WEBSITE_ID="${UMAMI_WEBSITE_ID:-}"
UMAMI_HOST_URL="${UMAMI_HOST_URL:-}"
UMAMI_DOMAINS="${UMAMI_DOMAINS:-}"

cat > "$OUTPUT_PATH" <<EOF
window.YouTubeAiBlockerPublicConfig = Object.freeze({
  publicWebsiteUrl: "${PUBLIC_WEBSITE_URL}",
  chromeWebStoreUrl: "${CHROME_WEB_STORE_URL}",
  firefoxAddonsUrl: "${FIREFOX_ADDONS_URL}",
  githubSourceUrl: "${GITHUB_SOURCE_URL}",
  githubReleasesUrl: "${GITHUB_RELEASES_URL}",
  umamiScriptUrl: "${UMAMI_SCRIPT_URL}",
  umamiWebsiteId: "${UMAMI_WEBSITE_ID}",
  umamiHostUrl: "${UMAMI_HOST_URL}",
  umamiDomains: "${UMAMI_DOMAINS}"
});
EOF
