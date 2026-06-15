import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { NextResponse } from "next/server";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { ExternalURL } from "@/utils/apiRouter";
import { upstreamErrorResponse } from "@/app/(DataAccessLayer)/(routeHandlers)/api/errorResponses";

interface SessionPayload {
  userData?: {
    access_token?: string;
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Missing session" }, { status: 401 });
  }

  const payload = (await verifySession(session)) as SessionPayload | null;
  const accessToken = payload?.userData?.access_token;

  if (!accessToken) {
    return NextResponse.json({ message: "Invalid user token" }, { status: 401 });
  }

  try {
    const { controller, timeoutId } = abortTimeout();

    const response = await fetch(`${ExternalURL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": String(accessToken),
      },
      body: JSON.stringify({ accessToken }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { message: "Sessão já inválida" },
          { status: 200 }
        );
      }
      const errorText = await response.text();
      console.error("Logout error:", response.status, errorText);
      return upstreamErrorResponse("Falha no logout.", response.status);
    }

    const finalResponse = NextResponse.json({ message: "Logout bem-sucedido" }, { status: 200 });

    return finalResponse;
  } catch (error) {
    console.error("Error in BFF /api/session/logout route:", error);

    return NextResponse.json(
      { message: "Falha no logout devido a um erro interno do servidor." },
      { status: 500 }
    );
  }
}
