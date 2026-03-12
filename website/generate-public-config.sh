#!/bin/sh

set -eu

OUTPUT_PATH="${1:-./public-config.js}"
node "$(dirname "$0")/build-public-config.mjs" "$OUTPUT_PATH"
