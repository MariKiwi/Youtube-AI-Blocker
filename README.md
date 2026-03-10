# YouTube AI Blocker

YouTube AI Blocker is an open source project for flagging, highlighting, and optionally blocking AI-made YouTube videos.

It combines:

- a shared server and database
- a browser extension that works directly on YouTube
- anonymous community voting to decide how confident the system should be about a video

## Start Here

If you just want to understand the project:

- Website: `https://your-website.example`
- Local website preview: `website/index.html`
- Documentation index: `docs/README.md`

Replace `https://your-website.example` with your real public website when it is available.

## What It Does

- Lets users mark a YouTube video as AI-made
- Lets other users vote for or against that flag
- Shows confidence levels directly on YouTube
- Can optionally block flagged videos from feeds and watch pages
- Keeps the system open and community-driven instead of using a closed detection model

## How It Works

1. A user flags a video as AI-made.
2. Other users vote up or down on that flag.
3. The server stores the result and calculates the current score.
4. The browser extension shows the video as `unknown`, `low`, `medium`, `high`, `disputed`, or `unflagged`.
5. Users can choose whether flagged videos are only highlighted or also blocked.

## For First-Time Users

If you are not a developer, the easiest way to follow the project is:

1. Visit the project website.
2. Read the install instructions there.
3. Use the browser store version when it is published.
4. If you are testing early builds, use the manual install guide from the website.

## Current Project Parts

- `server/`: API, database schema, and deployment logic
- `client/`: browser extension
- `website/`: public-facing project website
- `docs/`: detailed documentation

## Useful Commands

These are the main commands most contributors or self-hosters will need:

- `make deploy-stack`: first deploy or rebuild-and-start the stack
- `make update-stack`: update a running stack without data loss
- `make stop-stack`: stop the stack without removing data
- `make start-stack`: start a previously stopped stack
- `make reset-stack`: remove the stack and database volume for a clean start
- `make backup-db`: create a manual database backup
- `make test-all`: run the current automated tests
- `make build-extension`: build the Chromium extension package
- `make build-firefox-addon`: build the Firefox add-on package

## Contributing

Contributions are welcome.

Good first ways to help:

- report bugs or confusing behavior
- improve detection and voting UX
- test the extension on different YouTube layouts
- improve documentation for non-technical users
- help with Firefox support and store publishing

If you want to contribute code:

1. Read the relevant docs in `docs/`
2. Make a focused change
3. Run `make test-all`
4. Open a pull request or share the patch

## Documentation

Start with the documentation index:

- `docs/README.md`

Detailed docs:

- `docs/api.md`
- `docs/server-deployment.md`
- `docs/client-extension.md`
- `docs/client-publishing.md`
- `docs/testing.md`

## Project Status

The repository already includes:

- a Fastify API with PostgreSQL and Prisma
- a Chromium extension with highlighting, voting, and blocking
- Firefox packaging support
- a separate website container for the public project page

## License and Source

This project is open source. The GitHub repository is:

- `https://github.com/MattiKiwi/Youtube-AI-Blocker`
