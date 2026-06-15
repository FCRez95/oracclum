import 'server-only';
import { SignJWT } from 'jose'
import { SessionPayload } from '@/models/SessionPayload';
import { getSessionSigningKey } from '@/lib/sessionSecret';


export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getSessionSigningKey())
}
