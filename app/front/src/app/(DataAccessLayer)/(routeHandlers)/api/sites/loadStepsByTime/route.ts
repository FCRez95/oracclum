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

        const campaign_id = request.nextUrl.searchParams.get("campaign_id");
        const id_site = request.nextUrl.searchParams.get("id_site");
        const days = request.nextUrl.searchParams.get("days");

        if (!campaign_id || !days || !id_site) {
            console.warn("Missing query params!");
            return NextResponse.json(
                { message: 'Missing required query parameters: campaign_id and days' },
                { status: 400 }
            );
        }

        if (!accessToken) {
            console.warn("Missing access token!");
            return NextResponse.json(
                { message: 'Authorization token is missing or invalid' },
                { status: 401 }
            );
        }
        const backendUrl = `${ExternalURL}/load-site-steps-by-time/${campaign_id}/${id_site}/${days}/`;

        const { controller, timeoutId } = abortTimeout();

        const backendResponse = await fetch(backendUrl, {
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
            console.error("Backend returned error:", backendResponse.status, responseBody);
            return upstreamErrorResponse('Failed to fetch optimized data from backend', backendResponse.status);
        }

        const parsedResponse = JSON.parse(responseBody);

        return NextResponse.json(parsedResponse, { status: 200 });

    } catch (error) {
        console.error("Error details:", error);
        return NextResponse.json(
            { message: 'Failed to load user campaign optimization data due to internal server error.' },
            { status: 500 }
        );
    }
}
