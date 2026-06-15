import { NextRequest, NextResponse } from "next/server";
import { ExternalURL } from "@/utils/apiRouter";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { getDemoEnrichedUserData } from "@/demo/demoData";
import { isDemoAccessToken } from "@/demo/demoMode";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
        return NextResponse.json(
            { message: 'Authorization token is missing' },
            { status: 401 }
        );
    }

    if (isDemoAccessToken(accessToken)) {
        return NextResponse.json(
            getDemoEnrichedUserData(),
            { status: 200 }
        );
    }

    try {
        const { controller, timeoutId } = abortTimeout();

        const response = await fetch(`${ExternalURL}/load-enriched-user-data`, {
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

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error in BFF /api/user/loadEnrichedUserData route:", error);
        return NextResponse.json(
            { message: 'Failed to load enriched user data due to an internal server error.' },
            { status: 500 }
        );
    }
}
