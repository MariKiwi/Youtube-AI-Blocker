#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
CLIENT_DIR="$ROOT_DIR/client"
DIST_DIR="$ROOT_DIR/dist"
BUILD_DIR="$DIST_DIR/extension"
ZIP_PATH="$DIST_DIR/youtube-ai-blocker-extension.zip"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

cp -R "$CLIENT_DIR"/. "$BUILD_DIR"/

(
  cd "$BUILD_DIR"
  rm -f "$ZIP_PATH"
  bsdtar -a -cf "$ZIP_PATH" .
)

echo "Built extension bundle:"
echo "  Directory: $BUILD_DIR"
echo "  Zip:       $ZIP_PATH"
