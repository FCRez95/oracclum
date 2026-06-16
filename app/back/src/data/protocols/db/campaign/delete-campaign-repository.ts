
export interface DeleteCampaignRepository {
    delete (id_campaign: number): Promise<void>
}