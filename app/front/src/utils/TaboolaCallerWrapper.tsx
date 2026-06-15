"use server";

import { cookies } from "next/headers";
import { TaboolaApi } from "@/app/(DataAccessLayer)/(appServices)/callTaboolaApi";
import { encrypt } from "@/app/(DataAccessLayer)/(appServices)/calls/encrypt/callEncrypt";
import { verifySession, SessionData } from "@/lib/session";
import { getSessionCookieOptions } from "@/lib/sessionCookie";
import { SessionPayload } from "@/models/SessionPayload";

function getSessionCookie(cookieHeader: string) {
    return cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("session="))
        ?.slice("session=".length);
}

function stripJwtClaims(session: SessionData): SessionPayload {
    return {
        accessToken: session.accessToken,
        userData: session.userData,
        taboolaData: session.taboolaData,
        contract: session.contract,
        ...(session.metaData ? { metaData: session.metaData } : {}),
    };
}

function mergeTaboolaToken(taboolaData: string, accessToken: string) {
    const parsedTaboolaData =
        typeof taboolaData === "string" ? JSON.parse(taboolaData || "{}") : taboolaData;

    return JSON.stringify({
        ...parsedTaboolaData,
        access_token: accessToken,
    });
}

export async function TaboolaCallerWrapper<T>(
    caller: Promise<T>,
    cookieHeader: string
): Promise<T> {
    try {
        return await caller;
    } catch (err: unknown) {
        const error = err as Error & { name?: string; message?: string };

        if (error.message?.includes("Invalid") || error.message?.includes("401")) {
            const sessionCookie = getSessionCookie(cookieHeader);
            const verifiedSession = await verifySession(sessionCookie);
            if (!verifiedSession?.accessToken) {
                return Promise.reject(new Error("401"));
            }

            const payload = stripJwtClaims(verifiedSession);

            try {
                // 1. Renova o token Taboola
                const taboolaData = await TaboolaApi(verifiedSession.accessToken);
                // 2. Atualiza o access_token no payload
                payload.taboolaData = mergeTaboolaToken(payload.taboolaData, taboolaData.access_token);
                // 3. Recria o JWT assinado
                const session = await encrypt(payload);
                // 4. Atualiza o cookie de sessão
                const cookieStore = await cookies();
                const expireAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
                cookieStore.set("session", session, getSessionCookieOptions(expireAt));
            } catch (refreshError) {
                console.error("Failed to refresh Taboola session token:", refreshError);
            }

            return Promise.reject(new Error("401"));
        }

        console.error(error);
        throw error;
    }
}
