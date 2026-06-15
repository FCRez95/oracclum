import { cookies } from 'next/headers';
import { verifySession } from '@/lib/session';

export async function getSessionData() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  const payload = await verifySession(session);
  return payload;
}
