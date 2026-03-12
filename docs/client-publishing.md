# Client Publishing

## Shared deployment config

The extension build scripts read the repository root `.env` file before packaging.

Important variables:

- `PUBLIC_WEBSITE_URL`: public website/homepage URL for the packaged manifest
- `PUBLIC_API_BASE_URL`: canonical public API URL
- `EXTENSION_DEFAULT_API_BASE_URL`: default API URL written into the packaged extension settings
- `FIREFOX_ADDON_ID`: Firefox add-on ID used in the packaged Gecko manifest
- `FIREFOX_MIN_VERSION`: minimum Firefox version for the packaged add-on

If `EXTENSION_DEFAULT_API_BASE_URL` is not set, the build falls back to `PUBLIC_API_BASE_URL`.

The packaged extension manifest is also updated so `host_permissions` includes the configured API origin. That keeps the built extension aligned with the API it is meant to call.

## Build the extension package

From the repository root:

```bash
make build-extension
```

This produces:

- `dist/extension/`: a clean unpacked extension directory for local verification
- `dist/youtube-ai-blocker-extension.zip`: a ZIP package suitable for Chrome Web Store upload

## Build the Firefox add-on package

From the repository root:

```bash
make build-firefox-addon
```

This produces:

- `dist/firefox-addon/`: Firefox-targeted unpacked add-on directory
- `dist/youtube-ai-blocker-firefox-addon.zip`: ZIP package for Firefox Add-ons submission or temporary testing

Optional environment overrides:

```bash
FIREFOX_ADDON_ID=your-addon-id@example.com FIREFOX_MIN_VERSION=121.0 make build-firefox-addon
```

## Local install flow

To test the built package locally in Chromium:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Choose `Load unpacked`
4. Select `dist/extension/`

## Chrome Web Store flow

The Chrome Web Store upload expects a ZIP, not a locally self-signed CRX.

Current practical flow:

1. Run `make build-extension`
2. Upload `dist/youtube-ai-blocker-extension.zip` in the Chrome Web Store dashboard
3. Complete the listing metadata in the dashboard
4. Add store-required assets such as screenshots, promotional images, and privacy disclosures
5. Submit the package for review

## Firefox local testing flow

To test the Firefox-targeted build locally:

1. Run `make build-firefox-addon`
2. Open `about:debugging#/runtime/this-firefox`
3. Choose `Load Temporary Add-on`
4. Select `dist/firefox-addon/manifest.json`

## Firefox Add-ons flow

1. Run `make build-firefox-addon`
2. Upload `dist/youtube-ai-blocker-firefox-addon.zip` to the Firefox Add-ons dashboard
3. Complete listing metadata and privacy disclosures
4. Submit the package for review

## Current packaging notes

- The repository can generate the ZIP package automatically
- Final CRX signing and distribution are handled by the Chrome Web Store
- Firefox packaging is generated separately with build-time Gecko metadata
- The build scripts stamp the packaged manifests with the configured public website URL and API host permission
- Keep the API URL in `.env`, the server CORS config, and any public website install links aligned before publishing
- Store publication also requires a publisher account and listing content outside the repository
