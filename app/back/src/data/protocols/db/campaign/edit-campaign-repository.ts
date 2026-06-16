import { EditCampaignData } from "../../../../domain/usecases/campaign/edit-campaign"

export interface EditCampaignRepository {
    editCampaign(id_campaign: number, data: EditCampaignData): Promise<void | null>
}
export interface EditCampaignLinkRepository {
    editCampaignLink(id_campaign: number, new_link: string): Promise<void | null>
}
