import { NextRequest, NextResponse } from 'next/server';
import { ExternalURL } from "@/utils/apiRouter";
import { verifySession } from '@/lib/session';
import { isFrontendMockDemoSession } from '@/demo/demoMode';
import { getDemoCampaignSummaries } from '@/demo/demoData';
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

export async function GET(request: NextRequest) {
    try {
        const sessionCookie = request.cookies.get("session")?.value;

        const session = sessionCookie ? await verifySession(sessionCookie) : null;
        const accessToken = session?.accessToken as string;

        const days = request.nextUrl.searchParams.get("days");

        if (!accessToken) {
            return NextResponse.json(
                { message: 'Authorization token is missing or invalid' },
                { status: 401 }
            );
        }
        if (!days) {
            return NextResponse.json(
                { message: 'missing' },
                { status: 401 }
            );
        }

        if (isFrontendMockDemoSession(session)) {
            return NextResponse.json(getDemoCampaignSummaries(), { status: 200 });
        }

        const backendResponse = await fetch(`${ExternalURL}/load-user-campaigns/${encodeURIComponent(days)}`, {
            method: "GET",
            headers: {
                'x-access-token': accessToken,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        const responseBody = await backendResponse.text();

        if (!backendResponse.ok) {
            console.error("Backend returned error loading campaigns:", backendResponse.status, responseBody);
            return upstreamErrorResponse('Failed to fetch campaigns from backend', backendResponse.status);
        }

        return NextResponse.json(JSON.parse(responseBody), { status: 200 });

    } catch (error) {
        console.error("Error in BFF /api/campaign (loadUserCampaigns):", error);
        return NextResponse.json(
            { message: 'Failed to load user campaigns due to internal server error.' },
            { status: 500 }
        );
    }
}
