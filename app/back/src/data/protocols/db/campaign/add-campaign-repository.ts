import { CampaignModel } from "../../../../domain/models/campaign";

export interface AddCampaignRepository {
    add (name: string, link: string, idUser: number, clickAuth: string, ad_provider: string, conversion_name: string, checkout_provider: string, external_id: string, sub_account?: string): Promise<CampaignModel>
}