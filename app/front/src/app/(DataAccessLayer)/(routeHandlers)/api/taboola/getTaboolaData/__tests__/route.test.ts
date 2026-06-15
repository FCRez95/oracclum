/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @jest-environment node
 */
import { GET } from '../route';
import { NextRequest, NextResponse } from 'next/server';


jest.mock('@/utils/apiRouter', () => ({
    ExternalURL: 'https://mocked-external-url.com'
}));
jest.mock('@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout', () => ({
    abortTimeout: jest.fn(() => ({
        controller: { signal: 'mock-signal' },
        timeoutId: 123
    }))
}));

const mockClearTimeout = jest.spyOn(global, 'clearTimeout');

describe('GET /api/taboola-data', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 401 if Authorization header is missing', async () => {
        const req = {
            headers: {
                get: jest.fn().mockReturnValue(null)
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        expect(res).toBeInstanceOf(NextResponse);
        const json = await res.json();
        expect(res.status).toBe(401);
        expect(json).toEqual({ message: 'Authorization token is missing' });
    });

    it('returns 401 if Authorization header does not contain token', async () => {
        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json).toEqual({ message: 'Authorization token is missing' });
    });

    it('returns 200 and data on successful fetch', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ foo: 'bar' })
        } as any);

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer testtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        expect(global.fetch).toHaveBeenCalledWith(
            'https://mocked-external-url.com/load-taboola-info/testtoken',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'x-access-token': 'testtoken',
                    'Content-Type': 'application/json'
                }),
                signal: 'mock-signal'
            })
        );
        expect(mockClearTimeout).toHaveBeenCalledWith(123);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ foo: 'bar' });
    });

    it('returns error and status from backend if fetch not ok and error is JSON', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue({ message: 'forbidden' })
        } as any);

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer testtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json).toEqual({ message: 'forbidden' });
    });

    it('returns default error if fetch not ok and error is not JSON', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockRejectedValue(new Error('not json'))
        } as any);

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer testtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json).toEqual({ message: 'Failed to fetch Taboola data from backend (non-JSON error)' });
    });

    it('returns 500 on fetch/network error', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });

        global.fetch = jest.fn().mockRejectedValue(new Error('network error'));

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer testtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json).toEqual({ message: 'Failed to load Taboola data due to internal server error.' });
    });
});
