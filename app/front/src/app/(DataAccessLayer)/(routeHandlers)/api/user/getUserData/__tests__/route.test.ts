/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from '../route';
import { NextRequest } from 'next/server';

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

describe('GET /api/user/getUserData', () => {
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
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json).toEqual({ message: 'Authorization token is missing' });
    });

    it('returns 200 and user data on success', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ name: 'John Doe' })
        } as any);

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer validtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        const json = await res.json();

        expect(global.fetch).toHaveBeenCalledWith(
            'https://mocked-external-url.com/loadUserData/validtoken',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'x-access-token': 'validtoken',
                    'Content-Type': 'application/json'
                }),
                signal: 'mock-signal'
            })
        );
        expect(mockClearTimeout).toHaveBeenCalledWith(123);
        expect(res.status).toBe(200);
        expect(json).toEqual({ name: 'John Doe' });
    });

    it('returns backend error json if response is not ok and body is JSON', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 403,
            statusText: 'Forbidden',
            json: jest.fn().mockResolvedValue({ message: 'Access denied' })
        } as any);

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer badtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(403);
        expect(json).toEqual({ message: 'Access denied' });
    });

    it('returns backend error text if response is not ok and body is not JSON', async () => {
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        const mockJson = jest.fn().mockRejectedValue(new Error('Not JSON'));
        const mockText = jest.fn().mockResolvedValue('Not a JSON body');
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: mockJson,
            text: mockText
        } as any);

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer badtoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ message: 'Backend error: Internal Server Error' });
        expect(mockJson).toHaveBeenCalled();
        expect(mockText).toHaveBeenCalled();
    });

    it('returns 500 if fetch throws', async () => {

        jest.spyOn(console, 'error').mockImplementation(() => { });
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        const req = {
            headers: {
                get: jest.fn().mockReturnValue('Bearer sometoken')
            }
        } as unknown as NextRequest;

        const res = await GET(req);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json).toEqual({ message: 'Failed to load user data due to an internal server error.' });
    });
});