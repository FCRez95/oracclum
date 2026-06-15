'server-only'
import { cookies } from "next/headers";
import { encrypt } from "@/app/(DataAccessLayer)/(appServices)/calls/encrypt/callEncrypt";
import { getSessionCookieOptions } from "@/lib/sessionCookie";

type ContractProps = {
    id_user: number;
    contract_signed: boolean;
    signed_at?: string | null;
};

export async function createSession(accessToken: string, userData: string, taboolaData: string, contract: ContractProps, metaData?: string) {

    const payload = {
        accessToken,
        userData,
        taboolaData,
        contract,
        ...(metaData && { metaData })
    };

    const session = await encrypt(payload);

    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    const cookieStore = cookies();

    (await cookieStore).set("session", session, getSessionCookieOptions(expireAt));
}
