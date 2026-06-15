import { TaboolaApi } from '../callTaboolaApi';

describe('TaboolaApi', () => {
    const mockAccessToken = 'test-token';
    const mockUrl = "/api/taboola/getTaboolaData";
    const mockTaboolaData = { foo: 'bar' };

    beforeEach(() => {
        global.fetch = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch Taboola data and return it when response is ok', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce(mockTaboolaData),
        });

        const result = await TaboolaApi(mockAccessToken);

        expect(global.fetch).toHaveBeenCalledWith(
            mockUrl,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${mockAccessToken}`,
                },
            }
        );
        expect(result).toEqual(mockTaboolaData);
    });

    it('should throw an error when response is not ok', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn(),
        });

        const result = await TaboolaApi(mockAccessToken);

        expect(global.fetch).toHaveBeenCalled();
        expect(result).toEqual({
            errors: { form: ["Falha ao obter dados da Taboola."] },
            success: false,
        });
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Erro ao buscar dados da Taboola via BFF:"),
            expect.any(Error)
        );
    });

    it('should handle fetch throwing an error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const result = await TaboolaApi(mockAccessToken);

        expect(global.fetch).toHaveBeenCalled();
        expect(result).toEqual({
            errors: { form: ["Network error"] },
            success: false,
        });
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining("Erro ao buscar dados da Taboola via BFF:"),
            expect.any(Error)
        );
    });
});
