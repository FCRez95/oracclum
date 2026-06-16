# Testing Strategy

This portfolio version keeps the default verification path independent from MySQL while preserving legacy database-backed coverage as an explicit opt-in suite.

## Default Tests

Run:

```bash
npm test
```

This uses `jest-unit-config.js` and runs a curated DB-free suite of stable unit tests for:

- validation helpers
- crypto adapters
- click auth helpers
- selected data usecases
- selected presentation controllers
- selected controller validation factories

The default suite is intentionally explicit instead of matching every `*.spec.ts` file. Several legacy specs drifted from current domain interfaces during production evolution, and keeping them in the default path would make portfolio verification fail for reasons unrelated to app setup.

## DB-Backed Tests

Run:

```bash
npm run test:db
```

This uses `jest-db-config.js` and the regular MySQL repositories.

Included DB-backed tests:

- `src/infra/db/mysql/**/*.spec.ts`
- `src/main/routes/**/*.test.ts`

These tests require `DB_TEST_*` environment variables and connect to the configured test database directly. Use a dedicated disposable database only, because the tests can mutate data.

## CI Command

Run:

```bash
npm run test:ci
```

This runs the DB-free unit suite with coverage enabled. It does not require MySQL.

The most recent portfolio-safe coverage result was approximately:

```text
Statements: 86.83%
Branches:   92.02%
Functions:  89.88%
Lines:      86.83%
```

That percentage applies to the curated DB-free modules included in `jest-unit-config.js`, not to the entire backend.

## Legacy Test Gaps

The following areas are intentionally outside the default suite until they are rewritten or refreshed:

- MySQL repository specs and route integration tests, because they require a real MySQL test database.
- Some older reporting and campaign specs whose fixtures no longer match current domain interfaces.
- Some account/admin specs whose expected models predate enriched account fields.
- Main HTTP middleware tests that rely on Supertest binding a local listener, which is less portable in sandboxed environments.

The preferred modernization path is to keep repository integration tests opt-in, then rewrite route-level tests with mocked repositories/usecases so HTTP behavior can be verified without MySQL.
