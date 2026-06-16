# API Documentation

All routes are mounted under `/api`.

Authenticated routes require:

```text
x-access-token: <token returned by /api/login>
```

Routes marked `Auth + consent` require both a valid token and an accepted terms/contract record. Admin routes require an account whose role matches the backend admin check.

Response examples below describe the intended shape. Some legacy controllers return strings or full model objects directly; detailed field-level contracts should be tightened in a future API hardening pass.

## Account And Auth

### `POST /signup`

- Auth: public
- Purpose: create a new account.
- Body: `name`, `email`, `password`, `passwordConfirmation`, optional account profile fields.
- Success: created account model.
- Errors: validation error, email already in use, server error.

### `POST /login`

- Auth: public
- Purpose: authenticate an account.
- Body: `email`, `password`.
- Success: `{ "accessToken": "..." }`.
- Errors: validation error, unauthorized credentials, server error.

### `POST /logout`

- Auth: token
- Purpose: clear the authenticated account token.
- Body: no explicit body required by the client; auth middleware adds `idUser`.
- Success: logout result.

### `GET /loadUserData`

- Auth: token validated by controller
- Purpose: load the account associated with `x-access-token`.
- Headers: `x-access-token`.
- Success: account model.
- Errors: unauthorized when token is missing or invalid.

### `GET /load-enriched-user-data`

- Auth: token
- Purpose: load enriched account summary data for the authenticated account.
- Success: account summary model including usage/reporting information.

### `GET /load-all-users`

- Auth: admin token
- Purpose: list all users for admin views.
- Success: array of user/account records.

### `POST /delete-my-data`

- Auth: token
- Purpose: clear the authenticated user's stored account/provider data.
- Success: operation result.

### `POST /delete-user`

- Auth: admin token
- Purpose: delete a user account by admin action.
- Body: target user identifier.
- Success: operation result.

### `POST /deactivate-user`

- Auth: admin token
- Purpose: disable a user's click/campaign activity.
- Body: target user identifier.
- Success: operation result.

### `POST /activate-user`

- Auth: admin token
- Purpose: re-enable a user's click/campaign activity.
- Body: target user identifier.
- Success: operation result.

### `POST /change-pass`

- Auth: Auth + consent
- Purpose: change the authenticated user's password.
- Body: `newPassword`.
- Success: confirmation string.

## Provider Integrations

### `POST /add-taboola-info`

- Auth: Auth + consent
- Purpose: save Taboola account credentials/configuration.
- Body: `accountId`, `clientId`, `clientSecret`.
- Success: saved integration result.

### `GET /load-taboola-info`

- Auth: Auth + consent
- Purpose: load Taboola integration data for the authenticated account.
- Success: Taboola account info or `204` when no info exists.

### `POST /add-meta-info`

- Auth: Auth + consent
- Purpose: save Meta access token and allowed account selections.
- Body: `metaAccessToken`, `allowedAccounts`.
- Success: saved integration result.

### `GET /load-meta-info`

- Auth: token
- Purpose: load Meta integration data for the authenticated account.
- Success: Meta integration info.

### `POST /delete-meta-info`

- Auth: token
- Purpose: disconnect Meta integration data.
- Success: operation result.

## Campaign Management

### `POST /add-campaign`

- Auth: Auth + consent
- Purpose: create a campaign.
- Body: `name`, `link`, `ad_provider`, `external_id`, optional provider/setup fields.
- Success: created campaign model.

### `GET /load-user-campaigns`

- Auth: Auth + consent
- Purpose: list campaigns for the authenticated account using the default reporting window.
- Success: array of campaign summaries.

### `GET /load-user-campaigns/:days`

- Auth: Auth + consent
- Purpose: list campaigns for the authenticated account for a given reporting window.
- Params: `days`, where `0` means today and `1` means yesterday in repository date filters.
- Success: array of campaign summaries.

### `POST /edit-campaign`

- Auth: Auth + consent
- Purpose: edit campaign metadata.
- Body: campaign identifier and editable campaign fields.
- Success: operation result.

### `POST /edit-campaign-link`

- Auth: Auth + consent
- Purpose: edit a campaign destination/tracking link.
- Body: campaign identifier and new link.
- Success: operation result.

### `POST /delete-campaign`

- Auth: Auth + consent
- Purpose: delete a campaign.
- Body: campaign identifier.
- Success: operation result.

### `POST /save-pixel-info`

- Auth: Auth + consent
- Purpose: save Meta campaign pixel/access metadata.
- Body: campaign identifier, access token, and pixel id.
- Success: operation result.

### `POST /update-integration-status`

- Auth: Auth + consent
- Purpose: update campaign setup checklist state.
- Body: campaign identifier, step name, and status value.
- Success: operation result.

### `GET /load-integration-status/:id_campaign`

- Auth: Auth + consent
- Purpose: load setup checklist state for a campaign.
- Params: `id_campaign`.
- Success: integration status model.

## Reporting

### `GET /load-campaign-optimization-data/:id_campaign/:days`

- Auth: Auth + consent
- Purpose: load campaign-level optimization summary.
- Params: `id_campaign`, `days`.
- Success: revenue, sales, checkout, spend/click metrics where available.

### `GET /load-campaign-steps-by-time/:id_campaign/:days`

- Auth: Auth + consent
- Purpose: load funnel-step metrics over time for a campaign.
- Params: `id_campaign`, `days`.
- Success: time-series campaign step summary.

### `GET /load-campaign-sites-summary/:id_campaign/:days`

- Auth: Auth + consent
- Purpose: load site-level summaries for a campaign.
- Params: `id_campaign`, `days`.
- Success: array of site summary records.

### `GET /load-one-site-summary/:id_campaign/:id_site/:days`

- Auth: Auth + consent
- Purpose: load one site's summary in a campaign.
- Params: `id_campaign`, `id_site`, `days`.
- Success: site summary record.

### `GET /load-site-steps-by-time/:id_campaign/:id_site/:days`

- Auth: Auth + consent
- Purpose: load funnel-step metrics over time for one site.
- Params: `id_campaign`, `id_site`, `days`.
- Success: time-series site step summary.

### `GET /load-ads-summary/:id_campaign/:days`

- Auth: Auth + consent
- Purpose: load Taboola ad summaries for a campaign.
- Params: `id_campaign`, `days`.
- Success: array of ad summary records.

### `GET /load-ad-summary/:id_campaign/:id_ads_taboola/:days`

- Auth: Auth + consent
- Purpose: load one Taboola ad summary.
- Params: `id_campaign`, `id_ads_taboola`, `days`.
- Success: ad summary record.

### `GET /load-all-meta-adsets/:id_campaign/:days`

- Auth: Auth + consent
- Purpose: load Meta ad set summaries for a campaign.
- Params: `id_campaign`, `days`.
- Success: array of Meta ad set records.

### `GET /load-all-meta-ads/:id_campaign/:days`

- Auth: Auth + consent
- Purpose: load Meta ad summaries for a campaign.
- Params: `id_campaign`, `days`.
- Success: array of Meta ad records.

### `GET /load-one-meta-ad/:id_campaign/:id_ad_meta/:days`

- Auth: Auth + consent
- Purpose: load one Meta ad summary.
- Params: `id_campaign`, `id_ad_meta`, `days`.
- Success: Meta ad summary record.

### `GET /click/:id_click`

- Auth: Auth + consent
- Purpose: load one Taboola click by click id.
- Params: `id_click`.
- Success: click record.

### `GET /click-meta/:id_click`

- Auth: Auth + consent
- Purpose: load one Meta click by click id.
- Params: `id_click`.
- Success: Meta click record.

## Consent

### `POST /accept-terms`

- Auth: token
- Purpose: record accepted terms/contract state for the authenticated user.
- Success: confirmation string.

### `GET /load-user-consents`

- Auth: Auth + consent
- Purpose: load consent records for the authenticated user.
- Success: consent model or list depending on repository result.

## Wait List

### `POST /add-wait-list`

- Auth: public
- Purpose: create a public wait-list registration.
- Body: `name`, `email`, `cel`.
- Success: wait-list model.
- Errors: email already registered, server error.

## Removed Endpoints

The portfolio backend intentionally does not expose postback endpoints. These routes are not registered:

- `/postback-cartpanda`
- `/postback-payt`
- `/postback-unipag`
