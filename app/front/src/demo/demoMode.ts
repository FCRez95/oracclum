import type { SessionData } from "@/lib/session";

export const FRONTEND_DEMO_MODE = "frontend-mock" as const;
export const BACKEND_DEMO_MODE = "backend-demo" as const;
export const FRONTEND_DEMO_ACCESS_TOKEN = "demo-access-token" as const;
export const BACKEND_DEMO_EMAIL = "demo@oracclum.local" as const;
export const BACKEND_DEMO_PASSWORD = "oracclum-demo" as const;

export type DemoMode = typeof FRONTEND_DEMO_MODE | typeof BACKEND_DEMO_MODE;

export function isFrontendMockDemoSession(
  session: Pick<SessionData, "demoMode"> | null | undefined
) {
  return session?.demoMode === FRONTEND_DEMO_MODE;
}

export function isBackendDemoSession(
  session: Pick<SessionData, "demoMode"> | null | undefined
) {
  return session?.demoMode === BACKEND_DEMO_MODE;
}

export function isAnyDemoSession(
  session: Pick<SessionData, "demoMode"> | null | undefined
) {
  return session?.demoMode === FRONTEND_DEMO_MODE || session?.demoMode === BACKEND_DEMO_MODE;
}

export function isDemoAccessToken(accessToken: string | null | undefined) {
  return accessToken === FRONTEND_DEMO_ACCESS_TOKEN;
}
