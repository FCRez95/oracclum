# API Reference

This document describes the HTTP API exposed by `tbl-ingestion-api`.

The examples assume the service is running locally:

```text
http://localhost:8080
```

## Conventions

- Requests and responses use JSON unless noted otherwise.
- Timestamps are returned as Unix milliseconds.
- Public ingestion requests are accepted asynchronously. A `202 Accepted` response means the event entered the local in-process batcher, not that SQS has already acknowledged the final batch.
- Error responses from application handlers use a stable public shape:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "invalid request body"
  }
}
```

Public ingestion can be called from funnel pages running on many origins, so the request origin is not the authorization boundary. Every tracked campaign has a `click_auth` token generated when the campaign is created in the main backend. Incoming events must include that token, and the ingestion API accepts the event only when `click_auth` resolves to a campaign tracked by the system.

Admin routes are registered only when `ADMIN_TOKEN` is configured. When registered, they require:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Admin routes are not part of the public CORS group.

## GET /health

Returns a lightweight process health response.

### Request

```bash
curl -i http://localhost:8080/health
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
```

```text
ok
```

## POST /clicks

Submits a click event for validation, enrichment, and asynchronous queue delivery.

The API validates `click_auth` against the in-memory campaign map loaded from MySQL at startup and updated by admin routes during runtime.

### Request Headers

| Header | Required | Description |
| --- | --- | --- |
| `Content-Type: application/json` | Yes | Request body format. |

### Request Body

| Field | Type | Required | Validation | Description |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Trimmed and must be non-empty. | Client-provided click ID. Events with the same ID can be composed into the same final click state before queue flush. |
| `click_auth` | string | Yes | Trimmed, must be non-empty, and must resolve to a campaign ID. | Public token used to authorize and enrich the click. |
| `tbl_campaign_id` | string | No | No strict format validation. | Optional campaign identifier from the incoming payload. |
| `site_id` | string | No | No strict format validation. | Optional site identifier from the incoming payload. |
| `ad_id` | string | No | No strict format validation. | Optional ad identifier from the incoming payload. |
| `step_1` | string | No | When present, trimmed and must be a non-negative integer string. | Optional progress value. |
| `step_2` | string | No | When present, trimmed and must be a non-negative integer string. | Optional progress value. |
| `step_3` | string | No | When present, trimmed and must be a non-negative integer string. | Optional progress value. |
| `checkout` | string | No | When present, trimmed and must be a non-negative integer string. | Optional checkout progress value. |

### Example Request

```bash
curl -i -X POST http://localhost:8080/clicks \
  -H "Content-Type: application/json" \
  -d '{
    "id": "click-001",
    "click_auth": "demo-token",
    "tbl_campaign_id": "tbl-campaign-001",
    "site_id": "site-001",
    "ad_id": "ad-001",
    "step_1": "1",
    "step_2": "0",
    "step_3": "0",
    "checkout": "0"
  }'
```

### Successful Response

```http
HTTP/1.1 202 Accepted
Content-Type: application/json; charset=utf-8
X-Path: queued
```

```json
{
  "id": "click-001",
  "click_auth": "demo-token",
  "campaign_id": "campaign-001",
  "tbl_campaign_id": "tbl-campaign-001",
  "site_id": "site-001",
  "ad_id": "ad-001",
  "step_1": "1",
  "step_2": "0",
  "step_3": "0",
  "checkout": "0",
  "ingest_ts": 1720000000000,
  "path": "queued"
}
```

### Response Body

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Normalized click ID. |
| `click_auth` | string | Normalized click auth token. |
| `campaign_id` | string | Campaign ID resolved from the in-memory auth map. |
| `tbl_campaign_id` | string | Optional campaign identifier from the request. |
| `site_id` | string | Optional site identifier from the request. |
| `ad_id` | string | Optional ad identifier from the request. |
| `step_1` | string | Optional progress value from the request. |
| `step_2` | string | Optional progress value from the request. |
| `step_3` | string | Optional progress value from the request. |
| `checkout` | string | Optional checkout progress value from the request. |
| `ingest_ts` | integer | Server-side ingestion timestamp in Unix milliseconds. |
| `path` | string | Current delivery path. Successful responses return `queued`. |

### Error Responses

Invalid JSON, missing required fields, blank required fields, or invalid progress fields:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "invalid_request",
    "message": "invalid request body"
  }
}
```

Unknown `click_auth`:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "invalid_click_auth",
    "message": "invalid click_auth"
  }
}
```

The event could not be accepted into the local batcher before the request timeout, or the sink returned an enqueue error:

```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "queue_unavailable",
    "message": "unable to queue click event"
  }
}
```

## PUT /admin/clickauth

Adds or replaces one `click_auth -> campaign_id` mapping in the in-memory resolver.

When a campaign is created in the main backend, that system persists the campaign to the database and calls this endpoint so the running ingestion API can accept events for the new campaign without waiting for a restart.

This endpoint updates only the in-memory resolver. It does not write to MySQL directly; persistence belongs to the main backend. On restart, the ingestion API reloads the campaign map from MySQL, so campaigns already saved by the main backend are restored into memory.

### Request Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization: Bearer <ADMIN_TOKEN>` | Yes | Admin bearer token configured through `ADMIN_TOKEN`. |
| `Content-Type: application/json` | Yes | Request body format. |

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `token` | string | Yes | `click_auth` token to add or replace. |
| `campaign_id` | string | Yes | Campaign ID returned for future clicks using this token. |

### Example Request

```bash
curl -i -X PUT http://localhost:8080/admin/clickauth \
  -H "Authorization: Bearer local-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "demo-token",
    "campaign_id": "campaign-001"
  }'
```

### Successful Response

```http
HTTP/1.1 204 No Content
```

The response body is empty.

### Error Responses

Missing, malformed, or invalid bearer token:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "unauthorized",
    "message": "admin authorization required"
  }
}
```

Invalid JSON or missing required body fields:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "invalid_request",
    "message": "invalid request body"
  }
}
```

## DELETE /admin/clickauth/{token}

Removes one `click_auth` mapping from the in-memory resolver.

Deleting a token that is not present still returns `204 No Content`.

### Request Headers

| Header | Required | Description |
| --- | --- | --- |
| `Authorization: Bearer <ADMIN_TOKEN>` | Yes | Admin bearer token configured through `ADMIN_TOKEN`. |

### Path Parameters

| Parameter | Required | Description |
| --- | --- | --- |
| `token` | Yes | `click_auth` token to remove. |

### Example Request

```bash
curl -i -X DELETE http://localhost:8080/admin/clickauth/demo-token \
  -H "Authorization: Bearer local-admin-token"
```

### Successful Response

```http
HTTP/1.1 204 No Content
```

The response body is empty.

### Error Response

Missing, malformed, or invalid bearer token:

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```

```json
{
  "error": {
    "code": "unauthorized",
    "message": "admin authorization required"
  }
}
```

## Status Codes

| Status | Code | Meaning |
| --- | --- | --- |
| `200 OK` | none | `GET /health` succeeded. |
| `202 Accepted` | none | `POST /clicks` accepted the event into the local batcher. |
| `204 No Content` | none | Admin update or delete succeeded. |
| `400 Bad Request` | `invalid_request` | Request body is malformed, required fields are missing or blank, or progress fields are invalid. |
| `400 Bad Request` | `invalid_click_auth` | `click_auth` did not resolve to a known campaign. |
| `401 Unauthorized` | `unauthorized` | Admin bearer token is missing, malformed, or invalid. |
| `503 Service Unavailable` | `queue_unavailable` | The event could not be queued before the request timeout or the sink rejected the enqueue. |

Routes not registered or not matched return Gin's default `404 Not Found` response. This includes admin routes when `ADMIN_TOKEN` is not configured at startup.
