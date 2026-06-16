import { NextRequest, NextResponse } from 'next/server';
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
        const backendUrl = `${ExternalURL}/load-taboola-info/${encodeURIComponent(accessToken)}`;

        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                'x-access-token': accessToken,
                "Content-Type": "application/json",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch Taboola data from backend (non-JSON error)' }));
            return NextResponse.json(
                errorData,
                { status: response.status }
            );
        }
        const taboolaData = await response.json();
        return NextResponse.json(taboolaData, { status: 200 });


    } catch (error) {
        console.error("Error in BFF /api/taboola-data:", error);
        return NextResponse.json(
            { message: 'Failed to load Taboola data due to internal server error.' },
            { status: 500 }
        );
    }
}
