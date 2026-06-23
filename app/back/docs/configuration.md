# Configuration

The backend reads configuration from process environment variables and from a local `.env` file when present. Real `.env` files are ignored by git; use `.env.example` as the safe template.

## Runtime Selection

| Command | Entry point | Database config |
| --- | --- | --- |
| `npm run dev` | `src/main/server.ts` | `DB_DEV_*` |
| `npm run build` | TypeScript compiler only | none |
| `npm start` | `dist/main/server-prod.js` | `DB_*` |
| `npm test` | DB-free Jest config | none |
| `npm run test:db` | DB-backed Jest config | `DB_TEST_*` |

## Environment Variables

| Variable | Required | Used by | Description |
| --- | --- | --- | --- |
| `PORT` | no | dev/prod server | HTTP port. Defaults to `5050`. |
| `JWT_SECRET` | yes for real use | auth | Secret used to sign and verify backend access tokens. Use a long random value outside portfolio demos. |
| `DEMO_MODE_ENABLED` | no | demo routes | Enables the safe backend demo login and mocked backend responses when set to `true`, `1`, `yes`, or `on`. |
| `CLICK_AUTH_API_BASE_URL` | no | campaign workflows | Admin `click_auth` endpoint for the restored ingestion service. Defaults to `http://localhost:8080/admin/clickauth`. |
| `META_CLICK_AUTH_API_BASE_URL` | no | campaign workflows | Optional separate admin `click_auth` endpoint for Meta ingestion. Defaults to `CLICK_AUTH_API_BASE_URL`. |
| `CLICK_AUTH_ADMIN_TOKEN` | maybe | campaign workflows | Bearer token sent to ingestion admin routes. Set this to the ingestion service `ADMIN_TOKEN` when those routes are enabled. |
| `DB_HOST` | yes for prod start | `npm start` | MySQL host for compiled/prod-like runtime. |
| `DB_PORT` | no | `npm start` | MySQL port. Defaults to `3306`. |
| `DB_USER` | yes for prod start | `npm start` | MySQL username. |
| `DB_PASSWORD` | maybe | `npm start` | MySQL password. Can be empty for local users configured without a password. |
| `DB_NAME` | yes for prod start | `npm start` | MySQL database name. |
| `DB_DEV_HOST` | yes for dev server | `npm run dev` | MySQL host for local development runtime. |
| `DB_DEV_PORT` | no | `npm run dev` | MySQL port. Defaults to `3306`. |
| `DB_DEV_USER` | yes for dev server | `npm run dev` | MySQL username for local development. |
| `DB_DEV_PASSWORD` | maybe | `npm run dev` | MySQL password for local development. |
| `DB_DEV_NAME` | yes for dev server | `npm run dev` | MySQL database name for local development. |
| `DB_TEST_HOST` | yes for DB tests | `npm run test:db` | MySQL host for opt-in DB-backed tests. |
| `DB_TEST_PORT` | no | `npm run test:db` | MySQL port. Defaults to `3306`. |
| `DB_TEST_USER` | yes for DB tests | `npm run test:db` | MySQL username for the disposable test database. |
| `DB_TEST_PASSWORD` | maybe | `npm run test:db` | MySQL password for DB-backed tests. |
| `DB_TEST_NAME` | yes for DB tests | `npm run test:db` | Disposable MySQL database name for DB-backed tests. |

The runtime server entry points fail fast when `JWT_SECRET` is missing. The default Jest setup provides a test-only secret so `npm test` can run without requiring a local `.env`.

When backend demo mode is enabled, `POST /api/login` accepts the safe demo credentials used by the frontend backend-demo button and returns a demo access token. Authenticated demo requests are answered from backend-side fixtures before any MySQL or provider API work is attempted.

## Auth Header

Authenticated API routes expect the backend token in this header:

```text
x-access-token: <token returned by /api/login>
```

## Provider Credentials

Taboola and Meta credentials are stored through API workflows and persisted in MySQL. They are not represented as static environment variables in this backend.

Campaign creation, account activation, account deactivation, and account data deletion also synchronize `click_auth` mappings with the ingestion service admin endpoint. In local portfolio runs, point `CLICK_AUTH_API_BASE_URL` at `services/tbl-ingestion-api` and set `CLICK_AUTH_ADMIN_TOKEN` to the same value as that service's `ADMIN_TOKEN`.
