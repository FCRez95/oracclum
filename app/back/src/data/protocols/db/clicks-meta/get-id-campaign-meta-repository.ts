export interface GetIdCampaignMetaRepository {
  getMetaId (id_campaign: number): Promise<number | null>
  getMetaIds (id_campaigns: number[]): Promise<Array<{ id_campaign: number, id_campaign_meta: number | string }>>
}
  