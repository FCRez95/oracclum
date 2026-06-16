import { CampaignModel } from "../../models/campaign";

export interface EditCampaignData {
    name: string
    link: string
    ad_provider: string
    conversion_name: string
    checkout_provider: string
    external_id: string
    sub_account?: string
}

export interface EditCampaign {
    edit(id_campaign: number, data: EditCampaignData, id_user: number): Promise<CampaignModel | null>
}
export interface EditCampaignLink {
    edit(id_campaign: number, link: string, id_user: number): Promise<CampaignModel | null>
}

