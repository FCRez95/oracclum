# Security Hygiene Review

This document tracks the security review work for the portfolio backend. It is intentionally split into small passes so behavior can be verified after each change.

## Current Risk Surface

Routes are mounted under `/api` from every non-test file in `src/main/routes`. Global middleware is registered before routes:

- JSON body parser.
- CORS middleware.
- JSON content-type middleware.

Authentication uses the `x-access-token` request header. The auth middleware loads the user from that token and merges `idUser` into the request body for downstream controllers. The user-consents middleware depends on that `idUser` and requires `contract_signed === 1`.

### Public Routes

These routes do not use the auth middleware:

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/signup` | Intended public account creation route. |
| `POST` | `/login` | Intended public authentication route. |
| `POST` | `/add-wait-list` | Intended public wait-list registration route. |

### Authenticated Routes

These routes require `x-access-token` but do not require signed user consent:

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/logout` | Account session lifecycle. |
| `GET` | `/loadUserData` | Token-validated account lookup using `x-access-token`. |
| `GET` | `/load-enriched-user-data` | Account/profile data. |
| `POST` | `/delete-meta-info` | Removes Meta integration data. |
| `POST` | `/delete-my-data` | Clears the authenticated user's account data. |
| `GET` | `/load-meta-info` | Loads Meta integration data. |
| `POST` | `/accept-terms` | Allows a user to accept terms before consent-gated routes. |

### Admin Routes

These routes require `x-access-token` for an account with the `admin` role:

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/load-all-users` | Admin user listing. |
| `POST` | `/delete-user` | Admin account deletion. |
| `POST` | `/deactivate-user` | Admin account deactivation. |
| `POST` | `/activate-user` | Admin account activation. |

### Authenticated And Consent-Gated Routes

These routes require `x-access-token` and accepted user consent:

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/change-pass` | Account credential workflow. |
| `POST` | `/add-taboola-info` | Stores Taboola integration data. |
| `POST` | `/add-meta-info` | Stores Meta integration data. |
| `GET` | `/load-taboola-info` | Loads Taboola integration data using `x-access-token`. |
| `POST` | `/add-campaign` | Campaign write. |
| `GET` | `/load-user-campaigns` | Campaign read. |
| `GET` | `/load-user-campaigns/:days` | Campaign read. |
| `POST` | `/edit-campaign` | Campaign write. |
| `POST` | `/edit-campaign-link` | Campaign write. |
| `POST` | `/save-pixel-info` | Campaign pixel write. |
| `POST` | `/update-integration-status` | Campaign integration status write. |
| `POST` | `/delete-campaign` | Campaign deletion. |
| `GET` | `/click/:id_click` | Taboola click lookup. |
| `GET` | `/click-meta/:id_click` | Meta click lookup. |
| `GET` | `/load-campaign-optimization-data/:id_campaign/:days` | Reporting read. |
| `GET` | `/load-campaign-steps-by-time/:id_campaign/:days` | Reporting read. |
| `GET` | `/load-campaign-sites-summary/:id_campaign/:days` | Reporting read. |
| `GET` | `/load-integration-status/:id_campaign` | Integration status read. |
| `GET` | `/load-one-site-summary/:id_campaign/:id_site/:days` | Reporting read. |
| `GET` | `/load-site-steps-by-time/:id_campaign/:id_site/:days` | Reporting read. |
| `GET` | `/load-ads-summary/:id_campaign/:days` | Reporting read. |
| `GET` | `/load-ad-summary/:id_campaign/:id_ads_taboola/:days` | Reporting read. |
| `GET` | `/load-all-meta-adsets/:id_campaign/:days` | Meta reporting read. |
| `GET` | `/load-all-meta-ads/:id_campaign/:days` | Meta reporting read. |
| `GET` | `/load-one-meta-ad/:id_campaign/:id_ad_meta/:days` | Meta reporting read. |
| `GET` | `/load-user-consents` | Consent record read. |

### Removed Or Inactive Surface

The portfolio backend no longer registers postback endpoints. No active route file defines:

- `/postback-cartpanda`
- `/postback-payt`
- `/postback-unipag`

## Completed Security Hygiene Passes

- Token-in-URL scan: current active routes no longer pass access tokens in URL paths.
- Postback endpoints: unauthenticated postback routes and their backend write path were removed from the portfolio backend.
- Dynamic SQL review: direct value interpolation in `deleteById` was replaced with parameter binding, the unused unsafe `updateAllFields` helper was removed, `loadUserCampaigns` now uses a parameterized query, and campaign external-ID batch updates now bind values instead of interpolating them.
- Logging review: non-startup `console.log` and `console.error` calls were removed from request, repository, and provider paths.
- Error exposure review: route adapter behavior is covered by a regression test that returns only the public error message, not stack traces.
- Public write route review: `/signup`, `/login`, and `/add-wait-list` remain intentionally public for account creation, authentication, and wait-list capture.

## Remaining Known Tradeoffs

- SQL helper methods still accept table and column names as strings. Current call sites use internal constants, but a future deeper persistence refactor should replace the generic helper style with repository-specific parameterized queries or a constrained query builder.
- Some provider API URLs include provider access tokens as query parameters because those external APIs expect that shape in the current implementation. These are outbound provider calls, not backend route URLs.
- `setUpRoutes` dynamically imports route modules without awaiting the resulting promises. This is primarily reliability-oriented, but should be cleaned up during a low-risk infrastructure pass.
