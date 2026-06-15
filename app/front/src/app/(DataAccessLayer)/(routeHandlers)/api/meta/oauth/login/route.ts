import { NextResponse } from "next/server";
import { metaApiVersion, metaOauthRedirectUri } from "@/config/appConfig";

const FB_APP_ID = process.env.FB_APP_ID;

const SCOPES = ['ads_read', 'ads_management', 'public_profile'];

export async function GET() {
  try {
    if (!FB_APP_ID) {
      return NextResponse.json(
        { error: "FB_APP_ID not configured" },
        { status: 500 }
      );
    }

    const authParams = new URLSearchParams({
      client_id: FB_APP_ID,
      redirect_uri: metaOauthRedirectUri,
      scope: SCOPES.join(','),
      response_type: 'code',
    });

    const authUrl = `https://www.facebook.com/${metaApiVersion}/dialog/oauth?${authParams.toString()}`;

    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error("[Meta OAuth Login] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
