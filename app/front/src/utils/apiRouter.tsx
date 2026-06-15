import { appBaseUrl, backendApiUrl, taboolaApiBaseUrl } from "@/config/appConfig";

export const ExternalURL = backendApiUrl;
export const InternalURL =
  typeof window === "undefined" ? `${appBaseUrl}/api/` : "/api/";
export const TaboolaURL = taboolaApiBaseUrl;

export function internalApiUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${InternalURL}${normalizedPath}`;
}
