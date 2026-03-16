<h1 align="center">YouTube AI Blocker</h1>

<p align="center">
  Open source community-driven detection, highlighting, and optional blocking for AI-made YouTube videos.
</p>

<p align="center">
  <b>Install:</b>
  <a href="https://chromewebstore.google.com/">Chrome Web Store (Coming Soon)</a> |
  <a href="https://addons.mozilla.org/en-US/firefox/addon/youtube-ai-blocker/">Firefox Add-ons</a> |
  <a href="https://github.com/MariKiwi/Youtube-AI-Blocker/releases">Manual Releases</a> |
  <a href="https://yaib.codecurrent.eu">Website</a>
</p>

<p align="center">
  <b>Documentation:</b>
  <a href="docs/README.md">Docs Index</a> |
  <a href="docs/client-extension.md">Extension</a> |
  <a href="docs/client-publishing.md">Publishing</a> |
  <a href="docs/api.md">API</a> |
  <a href="docs/server-deployment.md">Deployment</a>
</p>


## What Is This?

YouTube AI Blocker is a project that helps users spot AI-made YouTube videos before clicking on them or spending time watching them.

It works through:

- a shared API and database
- a browser extension that integrates directly into YouTube
- anonymous community voting that decides how strong the AI flag should be

Instead of relying on a closed or hidden moderation model, the system is meant to stay transparent and community-driven.

## What It Does

- mark a video as AI-made
- vote for or against an existing AI flag
- show visible confidence levels on YouTube
- highlight suspicious videos in feeds and on watch pages
- optionally block flagged videos if the user enables that setting

## How It Works

1. A user flags a video as AI-made.
2. Other users vote up or down on that flag.
3. The server stores the result and updates the score.
4. The extension shows that video as `unknown`, `low`, `medium`, `high`, `disputed`, or `unflagged`.
5. Users decide whether they want highlighting only or full blocking.

## For First-Time Users

If you are new to GitHub or development, you do not need to understand the codebase to understand the project.

Start here:

1. Open the website when it is published.
2. Read the install section there.
3. Use the browser store version when available.
4. If you are trying early builds, use the manual install guide on the website.

## Current Project Parts

- `client/`: browser extension
- `server/`: API and database backend
- `website/`: public-facing website
- `docs/`: detailed documentation

## Important Commands

For most contributors or self-hosters, these are the commands that matter:

- `make deploy-stack`
- `make update-stack`
- `make stop-stack`
- `make start-stack`
- `make reset-stack`
- `make backup-db`
- `make test-all`
- `make build-extension`
- `make build-firefox-addon`

## Contributing

Contributions are welcome, including from people who are not full-time developers.

Useful ways to contribute:

- report bugs
- improve the extension UX
- test YouTube layout compatibility
- improve documentation for normal users
- help with packaging and store publishing

If you want to contribute code:

1. Read the relevant docs in `docs/`
2. Make a focused change
3. Run `make test-all`
4. Open a pull request or share the patch

## Deploy Configuration

The root `.env` file is the main deployment config for the stack and packaged extensions.

Useful values include:

- `PUBLIC_WEBSITE_URL`
- `PUBLIC_API_BASE_URL`
- `EXTENSION_DEFAULT_API_BASE_URL`
- `EXTENSION_VERSION`
- `EXTENSION_DEFAULT_BLOCKING_ENABLED`
- `EXTENSION_DEFAULT_DEBUG_UNKNOWN_INDICATORS`
- `CHROME_WEB_STORE_URL`
- `FIREFOX_ADDONS_URL`
- `GITHUB_SOURCE_URL`
- `GITHUB_RELEASES_URL`
- `GOOGLE_SITE_VERIFICATION`
- `UMAMI_SCRIPT_URL`
- `UMAMI_WEBSITE_ID`
- `UMAMI_HOST_URL`
- `UMAMI_DOMAINS`
- `FIREFOX_ADDON_ID`

If you want the built extension to point at your production API by default, set those values in `.env` before running `make build-extension` or `make build-firefox-addon`.

## Detailed Documentation

Start with:

- [Documentation Index](docs/README.md)

Main docs:

- [Extension Guide](docs/client-extension.md)
- [Publishing Guide](docs/client-publishing.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/server-deployment.md)
- [Testing Guide](docs/testing.md)

## Project Status

The repository already includes:

- a Fastify API with PostgreSQL and Prisma
- a Chromium extension with flagging, voting, highlighting, and blocking
- Firefox packaging support
- a separate website container for the public landing page

## Source

GitHub repository:

- https://github.com/MariKiwi/Youtube-AI-Blocker
