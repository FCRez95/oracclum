import { jwtVerify, JWTPayload } from 'jose';
import { getSessionSecret } from './sessionSecret';

export interface SessionData extends JWTPayload {
  accessToken: string;
  userData: string;
  taboolaData: string;
  contract: { id_user: number; contract_signed: boolean; signed_at?: string | null };
  metaData?: string;
  demoMode?: "frontend-mock" | "backend-demo";
}

export async function verifySession(token: string | undefined): Promise<SessionData | null> {
  if (!token) return null;

  const secretKey = getSessionSecret();
  if (!secretKey) return null;

  try {
    const encodedKey = new TextEncoder().encode(secretKey);
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ['HS256'] });
    return payload as SessionData;
  } catch {
    return null;
  }
}
