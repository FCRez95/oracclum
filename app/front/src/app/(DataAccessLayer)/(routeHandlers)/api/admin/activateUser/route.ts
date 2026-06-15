import { NextRequest, NextResponse } from 'next/server';
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { verifySession } from '@/lib/session';
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function POST(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get("session")?.value;
        const session = sessionCookie ? await verifySession(sessionCookie) : null;
        const accessToken = session?.accessToken as string;

        if (!accessToken) {
            return NextResponse.json(
                { message: 'Authorization token is missing or invalid' },
                { status: 401 }
            );
        }

        const userData = typeof session?.userData === "string"
            ? JSON.parse(session.userData)
            : session?.userData;
        if (userData?.user_type !== "admin") {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        const { userToActivate } = await request.json();

        const { controller, timeoutId } = abortTimeout();
        const backendResponse = await fetch(`${ExternalURL}/activate-user`, {
            method: "POST",
            headers: {
                'x-access-token': accessToken,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userToActivate }),
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeoutId);

        const responseBody = await backendResponse.text();

        if (!backendResponse.ok) {
            console.error("Backend returned error activating user:", backendResponse.status, responseBody);
            return upstreamErrorResponse('Failed to activate user', backendResponse.status);
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error in BFF /api/admin/activateUser:", error);
        return NextResponse.json(
            { message: 'Failed to activate user due to internal server error.' },
            { status: 500 }
        );
    }
}
