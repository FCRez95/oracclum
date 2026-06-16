# Oracclum Backend Portfolio TODO

Use this checklist to track the backend repo polish work for the Oracclum portfolio reconstruction.

- [x] Secrets and config
  - [x] Audit hardcoded DB credentials, JWT secrets, API tokens, and provider credentials.
  - [x] Move runtime config to environment variables.
  - [x] Add `.env.example` with safe placeholder values.
  - [x] Keep real `.env` files ignored by git.

- [x] README rewrite
  - [x] Replace the Bitbucket starter README.
  - [x] Align positioning with the main Oracclum portfolio README.
  - [x] Document purpose, architecture, setup, tests, API overview, database notes, and tradeoffs.

- [x] Database documentation
  - [x] Document expected MySQL version and setup assumptions.
  - [x] Document required tables, columns, indexes, and relationships.
  - [x] Add schema/setup SQL instructions.
  - [x] Avoid adding Docker or prescribing a local DB runtime.

- [x] Test strategy
  - [x] Identify DB-dependent integration tests.
  - [x] Decide which tests should be excluded, removed, or rewritten with mocks.
  - [x] Make default `npm test` run without MySQL.
  - [x] Document remaining legacy test gaps.

- [x] Build and verification
  - [x] Confirm `npm run build` works.
  - [x] Confirm default tests work without MySQL.
  - [x] Document verification commands in the README.

- [x] Package metadata
  - [x] Update package name, description, author, keywords, and main entry.
  - [x] Keep dependency modernization as a separate scoped decision.

- [x] Dependency modernization
  - [x] Upgrade the Node engine requirement to Node.js 24.16.0 or newer.
  - [x] Review npm peer dependency conflicts.
  - [x] Audit high and critical dependency warnings.
  - [x] Decide what to upgrade now versus document as intentional legacy.

- [x] Security hygiene review
  - [x] Map current route and middleware risk surface.
  - [x] Review token-in-URL patterns.
  - [x] Remove unauthenticated postback routes from the portfolio backend.
  - [x] Review dynamic SQL helper usage.
  - [x] Review noisy logs and stack trace exposure.
  - [x] Decide what to fix now versus document as known modernization work.

- [x] Code polish pass
  - [x] Fix low-risk spelling/path issues where safe.
  - [x] Avoid broad refactors until tests are trustworthy.

- [x] API documentation
  - [x] Group routes by account, campaign, reporting, provider integration, and consent workflows.
  - [x] Include auth/header/body notes where useful.

- [x] Final portfolio readiness check
  - [x] Run secret scan.
  - [x] Run build.
  - [x] Run default tests.
  - [x] Run dependency audit.
  - [x] Review README and database docs.
  - [x] Summarize polished areas, intentional legacy areas, and future modernization work.
