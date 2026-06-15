/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * @jest-environment node
 */
import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

jest.mock('@/utils/apiRouter', () => ({
    ExternalURL: 'https://mock-backend.com'
}));
jest.mock('@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout', () => ({
    abortTimeout: jest.fn(() => ({
        controller: { signal: 'mock-signal' },
        timeoutId: 123
    }))
}));
jest.mock('@/lib/session', () => ({
    verifySession: jest.fn()
}));


describe('GET', () => {
    const mockJson = jest.spyOn(NextResponse, 'json');

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        mockJson.mockClear();
    });

    function createMockRequest({
        sessionCookie = 'mock-session',
        campaign_id = '123',
        days = '7'
    }: { sessionCookie?: string | null, campaign_id?: string | null, days?: string | null }) {
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
                    get: jest.fn((key: string) => {
                        if (key === 'campaign_id') return campaign_id;
                        if (key === 'days') return days;
                        return null;
                    })
                }
            }
        } as unknown as NextRequest;
    }

    it('returns 400 if campaign_id or days is missing', async () => {
        const req = createMockRequest({ campaign_id: null, days: null });
        const res = await GET(req);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Missing required query parameters: campaign_id and days' },
            { status: 400 }
        );
    });

    it('returns 401 if access token is missing', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce(null);
        const req = createMockRequest({});
        const res = await GET(req);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Authorization token is missing or invalid' },
            { status: 401 }
        );
    });

    it('returns backend error if backend responds with error', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'token' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            text: jest.fn().mockResolvedValue('backend error')
        });
        const req = createMockRequest({});
        const res = await GET(req);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Failed to fetch optimized data from backend' },
            { status: 500 }
        );
    });

    it('returns parsed backend response if successful', async () => {
        (verifySession as jest.Mock).mockResolvedValueOnce({ accessToken: 'token' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            text: jest.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' }))
        });
        const req = createMockRequest({});
        const res = await GET(req);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { foo: 'bar' },
            { status: 200 }
        );
    });

    it('returns 500 if an exception is thrown', async () => {
        (verifySession as jest.Mock).mockImplementationOnce(() => { throw new Error('fail'); });
        const req = createMockRequest({});
        const res = await GET(req);
        expect(NextResponse.json).toHaveBeenCalledWith(
            { message: 'Failed to load user campaign optimization data due to internal server error.' },
            { status: 500 }
        );
    });
});
