import { NextRequest, NextResponse } from 'next/server';
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { verifySession } from '@/lib/session';
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function GET(request: NextRequest) {
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

        // Double-check admin (defense in depth)
        const userData = typeof session?.userData === "string"
            ? JSON.parse(session.userData)
            : session?.userData;
        if (userData?.user_type !== "admin") {
            return NextResponse.json(
                { message: 'Forbidden' },
                { status: 403 }
            );
        }

        const { controller, timeoutId } = abortTimeout();
        const backendResponse = await fetch(`${ExternalURL}/load-all-users`, {
            method: "GET",
            headers: {
                'x-access-token': accessToken,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
            cache: "no-store",
        });
        clearTimeout(timeoutId);

        const responseBody = await backendResponse.text();

        if (!backendResponse.ok) {
            console.error("Backend returned error loading users:", backendResponse.status, responseBody);
            return upstreamErrorResponse('Failed to fetch users from backend', backendResponse.status);
        }

        return NextResponse.json(JSON.parse(responseBody), { status: 200 });

    } catch (error) {
        console.error("Error in BFF /api/admin/users:", error);
        return NextResponse.json(
            { message: 'Failed to load users due to internal server error.' },
            { status: 500 }
        );
    }
}
