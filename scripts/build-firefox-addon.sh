#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
CLIENT_DIR="$ROOT_DIR/client"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$DIST_DIR/firefox-addon"
ZIP_PATH="$DIST_DIR/youtube-ai-blocker-firefox-addon.zip"
FIREFOX_ADDON_ID="${FIREFOX_ADDON_ID:-youtube-ai-blocker@example.com}"
FIREFOX_MIN_VERSION="${FIREFOX_MIN_VERSION:-121.0}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp -R "$CLIENT_DIR"/. "$BUILD_DIR"/

node -e '
const fs = require("node:fs");
const path = process.argv[1];
const addonId = process.argv[2];
const minVersion = process.argv[3];
const manifest = JSON.parse(fs.readFileSync(path, "utf8"));

manifest.browser_specific_settings = {
  gecko: {
    id: addonId,
    strict_min_version: minVersion,
  },
};

fs.writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
' "$BUILD_DIR/manifest.json" "$FIREFOX_ADDON_ID" "$FIREFOX_MIN_VERSION"

(
  cd "$BUILD_DIR"
  rm -f "$ZIP_PATH"
  bsdtar -a -cf "$ZIP_PATH" .
)

echo "Built Firefox add-on bundle:"
echo "  Directory: $BUILD_DIR"
echo "  Zip:       $ZIP_PATH"
echo "  Add-on ID: $FIREFOX_ADDON_ID"
