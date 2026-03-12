# Security Notes

## Current injection hardening

The project currently hardens the most likely code and command injection paths in three areas:

- API input handling
- extension DOM rendering and network configuration
- website build-time config and runtime link/script injection

## Server/API

Current protections:

- Fastify schema validation rejects unexpected request shapes
- write endpoints use explicit property whitelists with `additionalProperties: false`
- YouTube IDs are validated before service access
- request strings are trimmed before use
- the current server code does not execute shell commands from API input

## Extension

Current protections:

- API base URLs are validated as `http` or `https` before requests are built
- background fetch rejects invalid or non-HTTP(S) request URLs
- watch-page controls and block overlays are built with DOM APIs instead of `innerHTML`
- the extension manifest limits host permissions instead of using broad wildcards

## Website

Current protections:

- public links and Umami script URLs are validated as `http` or `https` before runtime use
- Umami is injected only after explicit consent
- generated public config is written through JSON serialization
- Google verification injection is done through a file-generation script with HTML escaping
- the Docker build no longer uses shell `sed` replacement for HTML env injection

## Remaining risks and future work

- Custom API support still means users can point the extension at an untrusted backend; the client now treats that as data, but the backend can still lie
- CSP headers are not yet enforced on the website container
- the API does not yet add extra abuse protections beyond rate limiting
- a formal dependency audit and SAST step would be useful before public release

## Verification

Security-related regression coverage currently lives in:

- `tests/security.test.js`
- `tests/client-config.test.js`
- `tests/docker-config.test.js`
- `tests/website.test.js`
