import 'server-only';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    const cookieStore = cookies();
    (await cookieStore).delete('session');

    return NextResponse.json({ success: true });
}
