import { NextRequest, NextResponse } from "next/server";
import { appBaseUrl, metaApiVersion, metaOauthRedirectUri } from "@/config/appConfig";
import { getShortLivedSecureCookieOptions } from "@/lib/sessionCookie";
import { META_OAUTH_TOKEN_COOKIE } from "@/lib/metaOauth";

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      const errorUrl = new URL('/main/integration', appBaseUrl);
      errorUrl.searchParams.set('tab', 'meta');
      errorUrl.searchParams.set('meta_error', error);
      errorUrl.searchParams.set('meta_error_description', errorDescription || 'Unknown error');
      return NextResponse.redirect(errorUrl);
    }

    if (!code) {
      const errorUrl = new URL('/main/integration', appBaseUrl);
      errorUrl.searchParams.set('tab', 'meta');
      errorUrl.searchParams.set('meta_error', 'missing_code');
      errorUrl.searchParams.set('meta_error_description', 'Authorization code not received');
      return NextResponse.redirect(errorUrl);
    }

    if (!FB_APP_ID || !FB_APP_SECRET) {
      const errorUrl = new URL('/main/integration', appBaseUrl);
      errorUrl.searchParams.set('tab', 'meta');
      errorUrl.searchParams.set('meta_error', 'config_error');
      errorUrl.searchParams.set('meta_error_description', 'Server configuration incomplete');
      return NextResponse.redirect(errorUrl);
    }

    // Exchange code for short-lived token
    const tokenParams = new URLSearchParams({
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      redirect_uri: metaOauthRedirectUri,
      code: code,
    });

    const tokenResponse = await fetch(
      `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?${tokenParams.toString()}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      const errorMsg = tokenData.error?.message || 'Failed to obtain token';
      const errorUrl = new URL('/main/integration', appBaseUrl);
      errorUrl.searchParams.set('tab', 'meta');
      errorUrl.searchParams.set('meta_error', 'token_exchange_failed');
      errorUrl.searchParams.set('meta_error_description', errorMsg);
      return NextResponse.redirect(errorUrl);
    }

    // Attempt short-lived -> long-lived conversion (~60 days)
    let finalToken = tokenData.access_token;

    try {
      const exchangeParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: FB_APP_ID,
        client_secret: FB_APP_SECRET,
        fb_exchange_token: tokenData.access_token,
      });

      const exchangeResponse = await fetch(
        `https://graph.facebook.com/${metaApiVersion}/oauth/access_token?${exchangeParams.toString()}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      const exchangeData = await exchangeResponse.json();

      if (exchangeResponse.ok && exchangeData.access_token) {
        finalToken = exchangeData.access_token;
      } else {
        console.warn('[Meta OAuth] Long-lived conversion failed, using short-lived fallback');
      }
    } catch (exchangeError) {
      console.error('[Meta OAuth] Long-lived conversion error, using short-lived fallback:', exchangeError);
    }

    const successUrl = new URL('/main/integration', appBaseUrl);
    successUrl.searchParams.set('tab', 'meta');
    successUrl.searchParams.set('meta_success', 'true');

    const response = NextResponse.redirect(successUrl);
    response.cookies.set(
      META_OAUTH_TOKEN_COOKIE,
      finalToken,
      getShortLivedSecureCookieOptions(5 * 60)
    );

    return response;
  } catch (error) {
    console.error("[Meta OAuth Callback] Error:", error);
    const errorUrl = new URL('/main/integration', appBaseUrl);
    errorUrl.searchParams.set('tab', 'meta');
    errorUrl.searchParams.set('meta_error', 'internal_error');
    errorUrl.searchParams.set('meta_error_description', 'Internal server error');
    return NextResponse.redirect(errorUrl);
  }
}
