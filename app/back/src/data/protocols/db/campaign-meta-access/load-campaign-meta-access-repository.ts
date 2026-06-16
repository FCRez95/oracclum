export interface CampaignMetaAccessRow {
  id_campaign: number
  access_token: string
  pixel_id: string
}

export interface LoadCampaignMetaAccessRepository {
  loadByCampaignId (idCampaign: number): Promise<CampaignMetaAccessRow | null>
}
