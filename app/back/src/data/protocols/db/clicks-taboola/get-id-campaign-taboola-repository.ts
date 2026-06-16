export interface GetIdCampaignTaboolaRepository {
  getTaboolaId (id_campaign: number): Promise<number | null>
  getTaboolaIds (id_campaigns: number[]): Promise<Array<{ id_campaign: number, id_campaign_taboola: number | string }>>
}
  