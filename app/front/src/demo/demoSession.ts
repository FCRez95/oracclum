import "server-only";

import { cookies } from "next/headers";

import { encrypt } from "@/app/(DataAccessLayer)/(appServices)/calls/encrypt/callEncrypt";
import { getSessionCookieOptions } from "@/lib/sessionCookie";
import { getDemoSessionPayload } from "./demoData";

export async function createDemoSession() {
  const session = await encrypt(getDemoSessionPayload());
  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set("session", session, getSessionCookieOptions(expireAt));
}
