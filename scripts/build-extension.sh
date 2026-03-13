#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
CLIENT_DIR="$ROOT_DIR/client"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$DIST_DIR/extension"
ZIP_PATH="$DIST_DIR/youtube-ai-blocker-extension.zip"
ENV_PATH="$ROOT_DIR/.env"

existing_public_api_base_url="${PUBLIC_API_BASE_URL-}"
existing_extension_default_api_base_url="${EXTENSION_DEFAULT_API_BASE_URL-}"
existing_public_website_url="${PUBLIC_WEBSITE_URL-}"
existing_extension_version="${EXTENSION_VERSION-}"
existing_extension_default_blocking_enabled="${EXTENSION_DEFAULT_BLOCKING_ENABLED-}"
existing_extension_default_debug_unknown_indicators="${EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS-}"

if [ -f "$ENV_PATH" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_PATH"
  set +a
fi

if [ -n "${existing_public_api_base_url}" ]; then
  export PUBLIC_API_BASE_URL="$existing_public_api_base_url"
fi

if [ -n "${existing_extension_default_api_base_url}" ]; then
  export EXTENSION_DEFAULT_API_BASE_URL="$existing_extension_default_api_base_url"
fi

if [ -n "${existing_public_website_url}" ]; then
  export PUBLIC_WEBSITE_URL="$existing_public_website_url"
fi

if [ -n "${existing_extension_version}" ]; then
  export EXTENSION_VERSION="$existing_extension_version"
fi

if [ -n "${existing_extension_default_blocking_enabled}" ]; then
  export EXTENSION_DEFAULT_BLOCKING_ENABLED="$existing_extension_default_blocking_enabled"
fi

if [ -n "${existing_extension_default_debug_unknown_indicators}" ]; then
  export EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS="$existing_extension_default_debug_unknown_indicators"
fi

EXTENSION_DEFAULT_API_BASE_URL="${EXTENSION_DEFAULT_API_BASE_URL:-${PUBLIC_API_BASE_URL:-http://127.0.0.1:3000}}"
PUBLIC_WEBSITE_URL="${PUBLIC_WEBSITE_URL:-https://your-website.example}"
EXTENSION_VERSION="${EXTENSION_VERSION:-0.1.0}"
EXTENSION_DEFAULT_BLOCKING_ENABLED="${EXTENSION_DEFAULT_BLOCKING_ENABLED:-false}"
EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS="${EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS:-false}"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp -R "$CLIENT_DIR"/. "$BUILD_DIR"/

node -e '
const fs = require("fs");

const manifestPath = process.argv[1];
const settingsPath = process.argv[2];
const apiBaseUrl = process.argv[3];
const websiteUrl = process.argv[4];
const extensionVersion = process.argv[5];
const blockingEnabled = process.argv[6] === "true";
const debugUnknownIndicators = process.argv[7] === "true";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const apiOrigin = new URL(apiBaseUrl).origin;

manifest.host_permissions = [
  "https://www.youtube.com/*",
  `${apiOrigin}/*`,
];
manifest.homepage_url = websiteUrl;
manifest.version = extensionVersion;

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const settingsScript = fs.readFileSync(settingsPath, "utf8");
let nextSettingsScript = settingsScript.replace(
  /apiBaseUrl: "[^"]+"/,
  `apiBaseUrl: "${apiBaseUrl}"`,
);
nextSettingsScript = nextSettingsScript.replace(
  /blockingEnabled: (true|false)/,
  `blockingEnabled: ${blockingEnabled}`,
);
nextSettingsScript = nextSettingsScript.replace(
  /debugUnknownIndicators: (true|false)/,
  `debugUnknownIndicators: ${debugUnknownIndicators}`,
);

if (settingsScript === nextSettingsScript) {
  throw new Error("Failed to update packaged default settings in built settings.js");
}

fs.writeFileSync(settingsPath, nextSettingsScript);
' "$BUILD_DIR/manifest.json" "$BUILD_DIR/common/settings.js" "$EXTENSION_DEFAULT_API_BASE_URL" "$PUBLIC_WEBSITE_URL" "$EXTENSION_VERSION" "$EXTENSION_DEFAULT_BLOCKING_ENABLED" "$EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS"

python3 - <<'PYTHONZIP'
from pathlib import Path
import zipfile

build_dir = Path(r"$BUILD_DIR")
zip_path = Path(r"$ZIP_PATH")
if zip_path.exists():
    zip_path.unlink()
with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(build_dir.rglob("*")):
        if path.is_dir():
            continue
        archive.write(path, path.relative_to(build_dir).as_posix())
PYTHONZIP

echo "Built extension bundle:"
echo "  Directory: $BUILD_DIR"
echo "  Zip:       $ZIP_PATH"
echo "  API:       $EXTENSION_DEFAULT_API_BASE_URL"
echo "  Website:   $PUBLIC_WEBSITE_URL"
