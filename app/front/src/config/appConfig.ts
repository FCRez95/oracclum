const LOCAL_APP_URL = "http://localhost:3000";
const LOCAL_BACKEND_API_URL = "http://localhost:5050/api";
const DEFAULT_META_API_VERSION = "v24.0";
const DEFAULT_TABOOLA_API_BASE_URL = "https://backstage.taboola.com/backstage/api/1.0/";

export function removeTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function ensureTrailingSlash(value: string) {
  return `${removeTrailingSlash(value)}/`;
}

export function ensureAbsoluteUrl(value: string) {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return removeTrailingSlash(value);
  return removeTrailingSlash(`https://${value}`);
}

function readList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const configuredAppUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  process.env.VERCEL_URL ||
  LOCAL_APP_URL;

export const appBaseUrl = ensureAbsoluteUrl(configuredAppUrl);

export const backendApiUrl = ensureTrailingSlash(
  ensureAbsoluteUrl(
    process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      LOCAL_BACKEND_API_URL
  )
);

export const postbackBaseUrl = removeTrailingSlash(
  ensureAbsoluteUrl(
    process.env.POSTBACK_BASE_URL ||
      process.env.NEXT_PUBLIC_POSTBACK_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      LOCAL_BACKEND_API_URL
  )
);

export const landingUrl = ensureAbsoluteUrl(
  process.env.NEXT_PUBLIC_LANDING_URL ||
    process.env.LANDING_URL ||
    appBaseUrl
);

export const metaApiVersion =
  process.env.META_API_VERSION || DEFAULT_META_API_VERSION;

export const metaOauthRedirectUri = ensureAbsoluteUrl(
  process.env.META_OAUTH_REDIRECT_URI ||
    process.env.FB_REDIRECT_URI ||
    `${appBaseUrl}/api/meta/oauth/callback`
);

export const taboolaApiBaseUrl = ensureTrailingSlash(
  ensureAbsoluteUrl(
    process.env.TABOOLA_API_BASE_URL || DEFAULT_TABOOLA_API_BASE_URL
  )
);

export const allowedOrigins = Array.from(
  new Set([
    LOCAL_APP_URL,
    "https://localhost:3000",
    appBaseUrl,
    ...readList(process.env.ALLOWED_ORIGINS),
    ...readList(process.env.CSRF_ALLOWED_ORIGINS),
  ])
);

export function buildPostbackUrl(checkoutProvider?: string | null) {
  if (!checkoutProvider) return null;
  return `${postbackBaseUrl}/postback-${checkoutProvider}`;
}
