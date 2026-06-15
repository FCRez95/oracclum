import { LoginApi } from "../callLoginApi";

describe("LoginApi", () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it("should return success and accessToken on successful login", async () => {
        const mockAccessToken = "mocked-token";
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ accessToken: mockAccessToken }),
        } as unknown);

        const result = await LoginApi("test@example.com", "password123");
        expect(result).toEqual({
            success: true,
            accessToken: mockAccessToken,
        });
        expect(global.fetch).toHaveBeenCalledWith(
            "/api/auth/login",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "test@example.com", password: "password123" }),
            })
        );
    });

    it("should return errors from API on failed login", async () => {
        const apiErrors = { email: ["Invalid email"] };
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({ errors: apiErrors }),
        } as unknown);

        const result = await LoginApi("wrong@example.com", "wrongpass");
        expect(result).toEqual({
            success: false,
            errors: apiErrors,
        });
    });

    it("should return default error message if API does not provide treated errors", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({}),
        } as unknown);

        const result = await LoginApi("wrong@example.com", "wrongpass");
        expect(result).toEqual({
            success: false,
            errors: {
                form: ["Falha no login. Verifique suas credenciais."],
            },
        });
    });

    it("should handle fetch/network errors gracefully", async () => {
        const errorMessage = "Network error";
        global.fetch = jest.fn().mockRejectedValue(new Error(errorMessage));
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        const result = await LoginApi("test@example.com", "password123");
        expect(result).toEqual({
            success: false,
            errors: {
                form: [errorMessage],
            },
        });
        expect(consoleSpy).toHaveBeenCalledWith(
            "Erro na ação de login:",
            expect.any(Error)
        );
        consoleSpy.mockRestore();
    });

    it("should handle non-Error thrown values in catch", async () => {
        global.fetch = jest.fn().mockRejectedValue("some string error");
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        const result = await LoginApi("test@example.com", "password123");
        expect(result).toEqual({
            success: false,
            errors: {
                form: ["Ocorreu um erro inesperado durante o login."],
            },
        });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
