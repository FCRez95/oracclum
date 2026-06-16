/**
 * @jest-environment node
 */


import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockAbortTimeout = require('@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout').abortTimeout;

jest.mock('@/utils/apiRouter', () => ({
    ExternalURL: 'https://mock-backend.com'
}));
jest.mock('@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout', () => ({
    abortTimeout: jest.fn()
}));
jest.mock('@/utils/rateLimit', () => ({
    rateLimit: () => ({ allowed: true, remaining: 4, retryAfterMs: 0 }),
    getClientIp: () => '127.0.0.1'
}));


describe('POST /api/auth/login', () => {
    const mockController = { signal: 'mock-signal' };
    let clearTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        mockAbortTimeout.mockReturnValue({ controller: mockController, timeoutId: 123 });
        clearTimeoutSpy = jest.spyOn(global, 'clearTimeout').mockImplementation(() => { });
    });

    afterEach(() => {
        clearTimeoutSpy.mockRestore();
    });

    it('should return accessToken on successful login', async () => {
        const credentials = { username: 'user', password: 'pass' };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(credentials)
        } as unknown as NextRequest;

        const backendResponse = {
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ accessToken: 'token123' })
        };
        global.fetch = jest.fn().mockResolvedValue(backendResponse as unknown);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(mockAbortTimeout).toHaveBeenCalled();
        expect(global.fetch).toHaveBeenCalledWith(
            'https://mock-backend.com/login',
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                signal: mockController.signal
            })
        );
        expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
        expect(response).toBeInstanceOf(NextResponse);
        expect(data).toEqual({ accessToken: 'token123' });
        expect(response.status).toBe(200);
    });

    it('should return a sanitized backend error response if backend returns error', async () => {
        const credentials = { username: 'user', password: 'wrong' };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(credentials)
        } as unknown as NextRequest;

        const backendResponse = {
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue({ message: 'Invalid credentials' })
        };
        global.fetch = jest.fn().mockResolvedValue(backendResponse as unknown);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data).toEqual({ message: 'Invalid login credentials.' });
    });

    it('should return a sanitized error if backend returns a non-JSON response', async () => {
        const credentials = { username: 'user', password: 'wrong' };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(credentials)
        } as unknown as NextRequest;

        const backendResponse = {
            ok: false,
            status: 404,
            headers: new Headers({ 'content-type': 'text/html' }),
            json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token <'))
        };
        global.fetch = jest.fn().mockResolvedValue(backendResponse as unknown);

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ message: 'Unable to complete login.' });
    });

    it('should return 500 if an exception is thrown', async () => {
        const mockRequest = {
            json: jest.fn().mockRejectedValue(new Error('fail'))
        } as unknown as NextRequest;

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ message: 'Internal server error during login process.' });
    });
});
