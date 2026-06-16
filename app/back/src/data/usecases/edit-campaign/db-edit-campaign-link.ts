import { EditCampaignLink } from "../../../domain/usecases/campaign/edit-campaign";
import { UnauthorizedError } from "../../../presentation/errors";
import { serverError } from "../../../presentation/helpers/http-helper";
import { EditCampaignLinkRepository } from "../../protocols/db/campaign/edit-campaign-repository";
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign";
import { CampaignModel } from "../add-campaign/db-add-campaign-protocols";

export class DbEditCampaignLink implements EditCampaignLink {
    private readonly loadCampaignByIdRepository: LoadCampaignRepository
    private readonly editCampaignLinkRepository: EditCampaignLinkRepository

    constructor(loadCampaignByIdRepository: LoadCampaignRepository, editCampaignLinkRepository: EditCampaignLinkRepository) {
        this.loadCampaignByIdRepository = loadCampaignByIdRepository
        this.editCampaignLinkRepository = editCampaignLinkRepository
    }

    async edit(id_campaign: number, new_link: string, user_id: number): Promise<CampaignModel> {
        try {

            const campaign = await this.loadCampaignByIdRepository.loadCampaign(id_campaign)
            if (!campaign) throw serverError
            if (campaign.id_user !== user_id) throw new UnauthorizedError()

            await this.editCampaignLinkRepository.editCampaignLink(campaign.id, new_link)
            return campaign
        }
        catch (e) {
            throw e
        }
    }

}