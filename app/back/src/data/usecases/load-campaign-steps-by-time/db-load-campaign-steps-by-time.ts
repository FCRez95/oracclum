import { CampaignModel } from "../../../domain/models/campaign";
import { CampaignStepsSummary } from "../../../domain/models/campaign-summary";
import { LoadCampaignByTime } from "../../../domain/usecases/campaign/load-campaign-by-time";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { CampaignStepsData, LoadCampaignStepsSummaryByClicksRepository } from "../../protocols/db/campaign/load-campaign-steps-summary-by-clicks-repository";

export class DbLoadCampaignStepsByTime implements LoadCampaignByTime {
  private readonly loadCampaignRepository: LoadCampaignRepository;
  private readonly loadCampaignStepsSummaryByClicksRepository: LoadCampaignStepsSummaryByClicksRepository;

  constructor(
    loadCampaignRepository: LoadCampaignRepository,
    loadCampaignStepsSummaryByClicksRepository: LoadCampaignStepsSummaryByClicksRepository
  ) {
    this.loadCampaignRepository = loadCampaignRepository;
    this.loadCampaignStepsSummaryByClicksRepository =
      loadCampaignStepsSummaryByClicksRepository;
  }

  private async getCampaign(idUser: number, id_campaign: number): Promise<CampaignModel | null> {
    const campaign = await this.loadCampaignRepository.loadCampaign(id_campaign);
    if (!campaign || campaign.id_user !== idUser) {
      return null;
    }
    return campaign;
  }

  private async buildCampaignStepsSummary(campaign: CampaignModel, internalData: CampaignStepsData): Promise<CampaignStepsSummary | null> {
    if (!campaign) {
      return null;
    }

    const {
      id = 0,
      name = '',
      link = '',
    } = campaign;

    const {
      total_clicks = 0,
      total_sales = 0,
      revenue = 0,
      total_step_1 = 0,
      step_1_views = 0,
      total_step_2 = 0,
      step_2_views = 0,
      total_step_3 = 0,
      step_3_views = 0,
      total_checkout = 0,
      checkout_views = 0,
    } = internalData || {};

    const campaignStepsSummary: CampaignStepsSummary = {
      id,
      name,
      link,
      total_clicks,
      total_sales,
      revenue,
      total_step_1,
      step_1_views,
      total_step_2,
      step_2_views,
      total_step_3,
      step_3_views,
      total_checkout,
      checkout_views,
    };

    return campaignStepsSummary;
  }

  async load(id_campaign: number, idUser: number, days: number): Promise<CampaignStepsSummary | null> {
    const campaign = await this.getCampaign(idUser, id_campaign);

    const campaignStepsSummary =
      await this.loadCampaignStepsSummaryByClicksRepository.loadCampaignSummaryByClick(
        id_campaign,
        days
      );

    const stepsSummary = await this.buildCampaignStepsSummary(campaign, campaignStepsSummary);
    return stepsSummary;
  }

  async loadByDateRange(
    id_campaign: number,
    idUser: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignStepsSummary | null> {
    const campaign = await this.getCampaign(idUser, id_campaign);

    const campaignStepsSummary =
      await this.loadCampaignStepsSummaryByClicksRepository.loadCampaignSummaryByClickByDateRange(
        id_campaign,
        dateRange
      );

    const stepsSummary = await this.buildCampaignStepsSummary(campaign, campaignStepsSummary);
    return stepsSummary;
  }
}
