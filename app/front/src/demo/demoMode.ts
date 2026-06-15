import type { SessionData } from "@/lib/session";

export const FRONTEND_DEMO_MODE = "frontend-mock" as const;
export const BACKEND_DEMO_MODE = "backend-demo" as const;

export type DemoMode = typeof FRONTEND_DEMO_MODE | typeof BACKEND_DEMO_MODE;

export function isFrontendMockDemoSession(
  session: Pick<SessionData, "demoMode"> | null | undefined
) {
  return session?.demoMode === FRONTEND_DEMO_MODE;
}

export function isDemoAccessToken(accessToken: string | null | undefined) {
  return accessToken === "demo-access-token";
}
