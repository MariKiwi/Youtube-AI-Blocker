# Testing

## Current approach

The project currently uses Node's built-in test runner for server tests.

This keeps the early test setup simple and avoids introducing a larger test stack before the API surface has stabilized.

## Test locations

- `tests/server.routes.test.js`: route-level tests for the current Fastify API
- `tests/confidence.test.js`: unit tests for confidence and status calculation

## Running tests

From the repository root:

```bash
make test-all
```

Direct execution:

```bash
node --test tests/*.test.js
```

## Design notes

- Route tests use Fastify's injection support
- Database-backed behavior is mocked through service injection
- This allows API behavior to be tested without requiring a live PostgreSQL instance
