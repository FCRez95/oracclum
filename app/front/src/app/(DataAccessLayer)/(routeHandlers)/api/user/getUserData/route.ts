import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
        return NextResponse.json(
            { message: 'Authorization token is missing' },
            { status: 401 }
        );
    }

    try {
        const { controller, timeoutId } = abortTimeout();

        const response = await fetch(`${ExternalURL}/loadUserData`, {
            method: "GET",
            headers: {
                'x-access-token': accessToken,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorData: unknown = {};
            try {
                errorData = await response.json();
            } catch (jsonError) {
                console.warn(jsonError, "Backend error response was not JSON:", await response.text().catch(() => 'No body'));
                errorData = { message: `Backend error: ${response.statusText || 'Unknown error'}` };
            }

            return NextResponse.json(
                errorData,
                { status: response.status }
            );
        }

        const userData = await response.json();
        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        console.error("Error in BFF /api/user-data route:", error);
        return NextResponse.json(
            { message: 'Failed to load user data due to an internal server error.' },
            { status: 500 }
        );
    }
}
