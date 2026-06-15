import { NextResponse } from "next/server";

function normalizeStatus(status: number) {
  return status >= 400 && status < 600 ? status : 500;
}

export function upstreamErrorResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status: normalizeStatus(status) });
}
