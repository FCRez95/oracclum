import { UserDataApi } from '../callUserDataApi';

describe('UserDataApi', () => {
    const mockAccessToken = 'test-token';
    const mockUserData = { id: 1, name: 'John Doe' };
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        (console.error as jest.Mock).mockRestore();
        jest.clearAllMocks();
    });

    it('should return user data when fetch is successful', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce(mockUserData),
        });

        const result = await UserDataApi(mockAccessToken);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/user/getUserData',
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${mockAccessToken}`,
                },
            }
        );
        expect(result).toEqual(mockUserData);
    });

    it('should throw error when response is not ok', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn(),
        });

        const result = await UserDataApi(mockAccessToken);

        expect(console.error).toHaveBeenCalledWith(
            'Erro ao buscar dados do usuário via BFF:',
            expect.any(Error)
        );
        expect(result).toEqual({ "errors": { "form": ["Falha ao obter dados do usuário."] }, "success": false });
    });

    it('should handle fetch throwing an error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await UserDataApi(mockAccessToken);

        expect(console.error).toHaveBeenCalledWith(
            'Erro ao buscar dados do usuário via BFF:',
            expect.any(Error)
        );
        expect(result).toEqual({ "errors": { "form": ["Network error"] }, "success": false });
    });
});
