import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";

interface SessionPayload {
    userData?: {
        access_token?: string;
    };
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
        return NextResponse.json({ message: "Sessão ausente" }, { status: 401 });
    }

    const payload = (await verifySession(session)) as SessionPayload | null;

    if (!payload?.userData?.access_token) {
        return NextResponse.json(
            { message: "User access token not found in session" },
            { status: 400 }
        );
    }

    const { idCampaign } = await req.json();

    if (!idCampaign) {
        return NextResponse.json(
            { message: "ID of campaign not provided" },
            { status: 400 }
        );
    }

    const access_token = payload.userData.access_token;

    try {
        const response = await fetch(`${ExternalURL}/delete-campaign`, {
        method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": String(access_token),
            },
            body: JSON.stringify({ idCampaign }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("Error calling /delete-campaign:", err);
        return NextResponse.json(
            { message: "Internal error processing request" },
            { status: 500 }
        );
    }
}
