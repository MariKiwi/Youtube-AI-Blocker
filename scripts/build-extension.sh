#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
CLIENT_DIR="$ROOT_DIR/client"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$DIST_DIR/extension"
ZIP_PATH="$DIST_DIR/youtube-ai-blocker-extension.zip"
ENV_PATH="$ROOT_DIR/.env"

if [ -f "$ENV_PATH" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_PATH"
  set +a
fi

EXTENSION_DEFAULT_API_BASE_URL="${EXTENSION_DEFAULT_API_BASE_URL:-${PUBLIC_API_BASE_URL:-http://127.0.0.1:3000}}"
PUBLIC_WEBSITE_URL="${PUBLIC_WEBSITE_URL:-https://your-website.example}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp -R "$CLIENT_DIR"/. "$BUILD_DIR"/

node -e '
const fs = require("fs");

const manifestPath = process.argv[1];
const settingsPath = process.argv[2];
const apiBaseUrl = process.argv[3];
const websiteUrl = process.argv[4];
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const apiOrigin = new URL(apiBaseUrl).origin;

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
' "$BUILD_DIR/manifest.json" "$BUILD_DIR/common/settings.js" "$EXTENSION_DEFAULT_API_BASE_URL" "$PUBLIC_WEBSITE_URL"

(
  cd "$BUILD_DIR"
  rm -f "$ZIP_PATH"
  bsdtar -a -cf "$ZIP_PATH" .
)

echo "Built extension bundle:"
echo "  Directory: $BUILD_DIR"
echo "  Zip:       $ZIP_PATH"
echo "  API:       $EXTENSION_DEFAULT_API_BASE_URL"
echo "  Website:   $PUBLIC_WEBSITE_URL"
