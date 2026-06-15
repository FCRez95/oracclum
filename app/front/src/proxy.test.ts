/**
 * @jest-environment node
 */

import { proxy } from "./proxy";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as session from "./lib/session";

jest.mock("./lib/session");
jest.spyOn(session, "verifySession");
jest.mock("next/headers");
jest.mock("next/server", () => {
    const original = jest.requireActual("next/server");
    return {
        ...original,
        NextResponse: {
            redirect: jest.fn((url) => ({ type: "redirect", url })),
            next: jest.fn(() => ({ type: "next" })),
            json: jest.fn((body, init) => ({ type: "json", body, status: init?.status })),
        },
    };
});

describe("proxy", () => {
    const getMockReq = (pathname: string, options?: { method?: string; origin?: string; referer?: string; requestOrigin?: string }) => {
        const headers = new Map<string, string>();
        if (options?.origin) headers.set("origin", options.origin);
        if (options?.referer) headers.set("referer", options.referer);
        const requestOrigin = options?.requestOrigin ?? "http://localhost:3000";
        return {
            nextUrl: {
                pathname,
                origin: requestOrigin,
                href: `${requestOrigin}${pathname}`,
            },
            method: options?.method ?? "GET",
            headers: { get: (key: string) => headers.get(key.toLowerCase()) ?? null },
        } as unknown as NextRequest;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("allows access to protected route with session", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue({ value: "cookie" }),
        });
        (session.verifySession as jest.Mock).mockResolvedValue({
            user: "test",
            contract: { contract_signed: true }
        });

        const req = getMockReq("/dashboard");
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("redirects to /login if accessing protected route without session", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(''),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/main/campaign");
        const res = await proxy(req);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
            new URL("/login", req.nextUrl.origin)
        );
        expect(res).toEqual({ type: "redirect", url: new URL("/login", req.nextUrl.origin) });
    });

    it("redirects to /main/campaign if accessing /login with session", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue({ value: "cookie" }),
        });
        (session.verifySession as jest.Mock).mockResolvedValue({
            user: "test",
            contract: { contract_signed: true }
        });

        const req = getMockReq("/login");
        const res = await proxy(req);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
            new URL("/main/campaign", req.nextUrl.origin)
        );
        expect(res).toEqual({
            type: "redirect",
            url: new URL("/main/campaign", req.nextUrl.origin),
        });
    });

    it("allows access to /login without session", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/login");
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("allows access to public route", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/public");
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("redirects to /main/configs if contract not signed", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue({ value: "cookie" }),
        });
        (session.verifySession as jest.Mock).mockResolvedValue({
            user: "test",
            contract: { contract_signed: false }
        });

        const req = getMockReq("/main/campaign");
        await proxy(req);

        expect(NextResponse.redirect).toHaveBeenCalledWith(
            new URL("/main/configs", req.nextUrl.origin)
        );
    });

    it("allows access to /main/configs when contract not signed", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue({ value: "cookie" }),
        });
        (session.verifySession as jest.Mock).mockResolvedValue({
            user: "test",
            contract: { contract_signed: false }
        });

        const req = getMockReq("/main/configs");
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    // CSRF protection tests
    it("blocks POST to API with cross-origin request", async () => {
        const req = getMockReq("/api/auth/login", { method: "POST", origin: "https://evil.com" });
        const res = await proxy(req);

        expect(NextResponse.json).toHaveBeenCalledWith({ error: "Forbidden" }, { status: 403 });
        expect(res).toEqual({ type: "json", body: { error: "Forbidden" }, status: 403 });
    });

    it("allows POST to API with no origin (server-side call)", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/auth/login", { method: "POST" });
        await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
    });

    it("allows POST to API with same-origin request", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/auth/login", { method: "POST", origin: "http://localhost:3000" });
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("allows GET to API without origin check", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/user/getUserData", { method: "GET" });
        await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
    });

    it("allows same-origin POST to delete session in production", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/session/deleteSession", {
            method: "POST",
            origin: "https://portfolio.example",
            requestOrigin: "https://portfolio.example",
        });
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("allows www origin when request host is non-www", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/session/deleteSession", {
            method: "POST",
            origin: "https://www.portfolio.example",
            requestOrigin: "https://portfolio.example",
        });
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("allows non-www origin when request host is www", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/session/deleteSession", {
            method: "POST",
            origin: "https://portfolio.example",
            requestOrigin: "https://www.portfolio.example",
        });
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("rejects unknown external origin for state-changing API request", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/session/deleteSession", {
            method: "POST",
            origin: "https://evil.example.com",
            requestOrigin: "https://portfolio.example",
        });
        const res = await proxy(req);

        expect(NextResponse.json).toHaveBeenCalledWith({ error: "Forbidden" }, { status: 403 });
        expect(res).toEqual({ type: "json", body: { error: "Forbidden" }, status: 403 });
    });

    it("allows POST to API when origin and referer are absent", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/session/deleteSession", {
            method: "POST",
            requestOrigin: "https://portfolio.example",
        });
        const res = await proxy(req);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(res).toEqual({ type: "next" });
    });

    it("rejects malformed origin for state-changing API request", async () => {
        (cookies as jest.Mock).mockReturnValue({
            get: jest.fn().mockReturnValue(undefined),
        });
        (session.verifySession as jest.Mock).mockResolvedValue(null);

        const req = getMockReq("/api/session/deleteSession", {
            method: "POST",
            origin: "not-a-valid-origin",
            requestOrigin: "https://portfolio.example",
        });
        const res = await proxy(req);

        expect(NextResponse.json).toHaveBeenCalledWith({ error: "Forbidden" }, { status: 403 });
        expect(res).toEqual({ type: "json", body: { error: "Forbidden" }, status: 403 });
    });
});
