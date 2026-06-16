import { EditCampaign, EditCampaignData } from "../../../domain/usecases/campaign/edit-campaign";
import { UnauthorizedError } from "../../../presentation/errors";
import { serverError } from "../../../presentation/helpers/http-helper";
import { EditCampaignRepository } from "../../protocols/db/campaign/edit-campaign-repository";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { CampaignModel } from "../add-campaign/db-add-campaign-protocols";

export class DbEditCampaign implements EditCampaign {
    private readonly loadCampaignByIdRepository: LoadCampaignRepository
    private readonly editCampaignRepository: EditCampaignRepository

    constructor(loadCampaignByIdRepository: LoadCampaignRepository, editCampaignRepository: EditCampaignRepository) {
        this.loadCampaignByIdRepository = loadCampaignByIdRepository
        this.editCampaignRepository = editCampaignRepository
    }

    async edit(id_campaign: number, data: EditCampaignData, user_id: number): Promise<CampaignModel> {
        try {
            const campaign = await this.loadCampaignByIdRepository.loadCampaign(id_campaign)
            if (!campaign) throw serverError
            if (campaign.id_user !== user_id) throw new UnauthorizedError()

            await this.editCampaignRepository.editCampaign(campaign.id, data)

            return { ...campaign, ...data }
        }
        catch (e) {
            throw e
        }
    }

}