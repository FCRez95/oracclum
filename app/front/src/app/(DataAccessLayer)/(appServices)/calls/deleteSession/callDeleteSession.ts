import { InternalURL } from '@/utils/apiRouter';

import 'server-only';

export async function deleteSessionApi(cookiesHeader: string) {
    try {
        const response = await fetch(`${InternalURL}/deleteSession`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookiesHeader,
            },
        });
        if (response.status === 401 || response.status === 403) {
            return true;
        }

        if (!response.ok) {
            throw new Error('Error deleting session');
        }
        return true;
    } catch (error) {
        console.error('Error deleting session:', error);
        return false;
    }
}
