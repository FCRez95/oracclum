import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { SessionPayload } from '@/models/SessionPayload';
import { encrypt } from '@/app/(DataAccessLayer)/(appServices)/calls/encrypt/callEncrypt';

export async function POST(request: NextRequest) {
    try {
        const payload: SessionPayload = await request.json();

        const token = await encrypt(payload);

        return NextResponse.json({ token });
    } catch (error) {
        console.error('Erro ao gerar token:', error);
        return NextResponse.json({ error: 'Falha ao gerar token' }, { status: 500 });
    }
}
