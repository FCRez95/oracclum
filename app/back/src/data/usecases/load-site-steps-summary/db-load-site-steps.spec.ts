import { DbLoadSiteStepsSummary } from './db-load-site-steps-summary';
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign';
import { LoadSiteStepsRepository } from '../../protocols/db/clicks-taboola/load-site-steps-repository';
import { GetExternalSiteInfo } from '../../protocols/external-apis/external-info';

describe('DbLoadSiteStepsSummary', () => {
  let loadCampaignRepo: jest.Mocked<LoadCampaignRepository>;
  let loadStepsRepo: jest.Mocked<LoadSiteStepsRepository>;
  let getExternalInfo: jest.Mocked<GetExternalSiteInfo>;
  let sut: DbLoadSiteStepsSummary;

  beforeEach(() => {
    loadCampaignRepo = {
      loadCampaign: jest.fn().mockResolvedValue({ id_user: 1, external_id: 'taboola-123' })
    };

    loadStepsRepo = {
      loadSiteSteps: jest.fn().mockResolvedValue({
        total_sales: 5,
        revenue: 1000,
        total_clicks: 20,
        total_step_1: 15,
        step_1_views: 10,
        total_step_2: 8,
        step_2_views: 5,
        total_step_3: 4,
        step_3_views: 2,
        total_checkout: 1,
        checkout_views: 1
      }),
      loadSiteStepsByDateRange: jest.fn().mockResolvedValue({
        total_sales: 3,
        revenue: 500,
        total_clicks: 10,
        total_step_1: 7,
        step_1_views: 4,
        total_step_2: 2,
        step_2_views: 1,
        total_step_3: 1,
        step_3_views: 1,
        total_checkout: 1,
        checkout_views: 1
      })
    };

    getExternalInfo = {
      getExternalSiteInfo: jest.fn().mockResolvedValue({ clicks: 50 }),
      getExternalSiteInfoByDateRange: jest.fn().mockResolvedValue({ clicks: 30 })
    };

    sut = new DbLoadSiteStepsSummary(
      loadCampaignRepo,
      loadStepsRepo,
      getExternalInfo
    );
  });

  it('should return aggregated data correctly for load()', async () => {
    const result = await sut.load(1, 99, 123, 7);

    expect(loadCampaignRepo.loadCampaign).toHaveBeenCalledWith(99);
    expect(loadStepsRepo.loadSiteSteps).toHaveBeenCalledWith(99, 123, 7);
    expect(getExternalInfo.getExternalSiteInfo).toHaveBeenCalledWith(1, 'taboola-123', 123, 7);

    expect(result).toEqual({
      id: 123,
      sales: 5,
      revenue: 1000,
      total_step_1: 50,
      step_1_views: 20,
      total_step_2: 15,
      step_2_views: 10,
      total_step_3: 8,
      step_3_views: 5,
      total_step_4: 4,
      step_4_views: 2,
      total_checkout: 1,
      checkout_views: 1
    });
  });

  it('should return aggregated data correctly for loadByDateRange()', async () => {
    const result = await sut.loadByDateRange(1, 99, 123, {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });

    expect(loadCampaignRepo.loadCampaign).toHaveBeenCalledWith(99);
    expect(loadStepsRepo.loadSiteStepsByDateRange).toHaveBeenCalledWith(99, 123, {
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
    expect(getExternalInfo.getExternalSiteInfoByDateRange).toHaveBeenCalledWith(
      1,
      'taboola-123',
      123,
      { startDate: '2024-01-01', endDate: '2024-01-31' }
    );

    expect(result).toEqual({
      id: 123,
      sales: 3,
      revenue: 500,
      total_step_1: 30,
      step_1_views: 10,
      total_step_2: 7,
      step_2_views: 4,
      total_step_3: 2,
      step_3_views: 1,
      total_step_4: 1,
      step_4_views: 1,
      total_checkout: 1,
      checkout_views: 1
    });
  });

  it('should return null if campaign does not belong to the user', async () => {
    loadCampaignRepo.loadCampaign.mockResolvedValueOnce({
      id: 99,
      id_user: 2,
      name: 'Mock Campaign',
      link: '',
      click_auth: 'any_token',
      ad_provider: 'taboola'
    });

    const result = await sut.load(1, 99, 123, 7);
    expect(result).toBeNull();
  });
});
