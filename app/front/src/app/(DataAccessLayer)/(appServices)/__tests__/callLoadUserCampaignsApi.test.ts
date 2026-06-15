import { loadUserCampaigns } from '../calls/loadUserCampaign/callLoadUserCampaignsApi';

describe('loadUserCampaigns', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
        global.fetch = originalFetch;
        jest.clearAllMocks();
    });

    it('should call fetch with correct parameters and return data on success', async () => {
        const mockData = [{ id: 1, name: 'Campaign 1' }];
        const mockJson = jest.fn().mockResolvedValue(mockData);
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: mockJson,
        } as unknown);

        const result = await loadUserCampaigns();

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/campaign/loadUserCampaigns?days=7',
            expect.objectContaining({
                method: 'GET',
                cache: 'no-store',
                credentials: 'include',
            })
        );
        expect(result).toEqual(mockData);
    });

    it('should throw an error if response is not ok', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            status: 401,
        } as unknown);

        await expect(loadUserCampaigns()).rejects.toThrow(
            'Erro ao buscar campanhas: 401'
        );
    });

    it('should pass the signal to fetch if provided', async () => {
        const mockJson = jest.fn().mockResolvedValue([]);
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: mockJson,
        } as unknown);

        const signal = new AbortController().signal;
        await loadUserCampaigns(signal, 14);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/campaign/loadUserCampaigns?days=14',
            expect.objectContaining({ signal, credentials: 'include' })
        );
    });

    it('should rethrow fetch errors', async () => {
        const error = new Error('Network error');
        global.fetch = jest.fn().mockRejectedValue(error);

        await expect(loadUserCampaigns()).rejects.toThrow('Network error');
    });
});
