#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
CLIENT_DIR="$ROOT_DIR/client"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$DIST_DIR/firefox-addon"
ZIP_PATH="$DIST_DIR/youtube-ai-blocker-firefox-addon.zip"
ENV_PATH="$ROOT_DIR/.env"

if [ -f "$ENV_PATH" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_PATH"
  set +a
fi

EXTENSION_DEFAULT_API_BASE_URL="${EXTENSION_DEFAULT_API_BASE_URL:-${PUBLIC_API_BASE_URL:-http://127.0.0.1:3000}}"
PUBLIC_WEBSITE_URL="${PUBLIC_WEBSITE_URL:-https://your-website.example}"
FIREFOX_ADDON_ID="${FIREFOX_ADDON_ID:-youtube-ai-blocker@example.com}"
FIREFOX_MIN_VERSION="${FIREFOX_MIN_VERSION:-121.0}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp -R "$CLIENT_DIR"/. "$BUILD_DIR"/

node -e '
const fs = require("fs");

const manifestPath = process.argv[1];
const settingsPath = process.argv[2];
const addonId = process.argv[3];
const minVersion = process.argv[4];
const apiBaseUrl = process.argv[5];
const websiteUrl = process.argv[6];
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const apiOrigin = new URL(apiBaseUrl).origin;

manifest.browser_specific_settings = {
  gecko: {
    id: addonId,
    strict_min_version: minVersion,
  },
};
manifest.host_permissions = [
  "https://www.youtube.com/*",
  `${apiOrigin}/*`,
];
manifest.homepage_url = websiteUrl;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const settingsScript = fs.readFileSync(settingsPath, "utf8");
const nextSettingsScript = settingsScript.replace(
  /apiBaseUrl: "[^"]+"/,
  `apiBaseUrl: "${apiBaseUrl}"`,
);

if (settingsScript === nextSettingsScript) {
  throw new Error("Failed to update default apiBaseUrl in built settings.js");
}

fs.writeFileSync(settingsPath, nextSettingsScript);
' "$BUILD_DIR/manifest.json" "$BUILD_DIR/common/settings.js" "$FIREFOX_ADDON_ID" "$FIREFOX_MIN_VERSION" "$EXTENSION_DEFAULT_API_BASE_URL" "$PUBLIC_WEBSITE_URL"

(
  cd "$BUILD_DIR"
  rm -f "$ZIP_PATH"
  bsdtar -a -cf "$ZIP_PATH" .
)

echo "Built Firefox add-on bundle:"
echo "  Directory: $BUILD_DIR"
echo "  Zip:       $ZIP_PATH"
echo "  Add-on ID: $FIREFOX_ADDON_ID"
echo "  API:       $EXTENSION_DEFAULT_API_BASE_URL"
echo "  Website:   $PUBLIC_WEBSITE_URL"
