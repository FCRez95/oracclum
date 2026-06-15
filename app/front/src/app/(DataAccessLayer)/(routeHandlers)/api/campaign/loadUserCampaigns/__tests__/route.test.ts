/**
 * @jest-environment node
 */

import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

jest.mock('@/utils/apiRouter', () => ({
    ExternalURL: 'https://mock-backend.com'
}));
jest.mock('@/lib/session', () => ({
    verifySession: jest.fn()
}));

global.fetch = jest.fn();

describe('GET /loadUserCampaigns', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    function mockRequest({
        sessionCookie = 'mock-session',
        days = '7'
    }: { sessionCookie?: string | null; days?: string | null } = {}) {
        return {
            cookies: {
                get: jest.fn((key: string) =>
                    key === 'session' && sessionCookie
                        ? { value: sessionCookie }
                        : undefined
                )
            },
            nextUrl: {
                searchParams: {
                    get: jest.fn((key: string) => (key === 'days' ? days : null))
                }
            }
        } as unknown as NextRequest;
    }

    it('returns 401 if the session cookie is missing', async () => {
        const response = await GET(mockRequest({ sessionCookie: null }));
        const data = await response.json();
        expect(response).toBeInstanceOf(NextResponse);
        expect(response.status).toBe(401);
        expect(data).toEqual({ message: 'Authorization token is missing or invalid' });
    });

    it('returns 401 if the session does not contain an access token', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce(null);
        const response = await GET(mockRequest());
        const data = await response.json();
        expect(response.status).toBe(401);
        expect(data).toEqual({ message: 'Authorization token is missing or invalid' });
    });

    it('returns 401 if days is missing', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'validtoken' });
        const response = await GET(mockRequest({ days: null }));
        const data = await response.json();
        expect(response.status).toBe(401);
        expect(data).toEqual({ message: 'missing' });
    });

    it('returns 200 and campaign data on success', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'validtoken' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            text: async () => JSON.stringify({ campaigns: ['a', 'b'] })
        });
        const response = await GET(mockRequest({ days: '14' }));
        const data = await response.json();
        expect(global.fetch).toHaveBeenCalledWith(
            'https://mock-backend.com/load-user-campaigns/14',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'x-access-token': 'validtoken',
                    'Content-Type': 'application/json'
                }),
                cache: 'no-store'
            })
        );
        expect(response.status).toBe(200);
        expect(data).toEqual({ campaigns: ['a', 'b'] });
    });

    it('returns local campaign fixtures for frontend demo sessions', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({
            accessToken: 'demo-access-token',
            demoMode: 'frontend-mock'
        });

        const response = await GET(mockRequest({ days: '7' }));
        const data = await response.json();

        expect(global.fetch).not.toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: 101,
                    ad_provider: 'taboola',
                    external_id: 'tb-demo-101'
                }),
                expect.objectContaining({
                    id: 202,
                    ad_provider: 'meta',
                    external_id: 'mt-demo-202'
                })
            ])
        );
    });

    it('returns a sanitized backend error if backend responds with error', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'validtoken' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 403,
            text: async () => 'Forbidden'
        });
        const response = await GET(mockRequest());
        const data = await response.json();
        expect(response.status).toBe(403);
        expect(data).toEqual({
            message: 'Failed to fetch campaigns from backend'
        });
    });

    it('returns a sanitized backend error if backend error body is not JSON', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'validtoken' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: async () => 'not json'
        });
        const response = await GET(mockRequest());
        const data = await response.json();
        expect(response.status).toBe(500);
        expect(data).toEqual({
            message: 'Failed to fetch campaigns from backend'
        });
    });

    it('returns 500 if fetch throws', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'validtoken' });
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'));
        const response = await GET(mockRequest());
        const data = await response.json();
        expect(response.status).toBe(500);
        expect(data).toEqual({ message: 'Failed to load user campaigns due to internal server error.' });
    });
});
