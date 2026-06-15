export interface CampaignSummaryModel {
  id: number,
  external_id?: string
  id_user: number,
  name: string,
  link?: string,
  sub_account?: string,
  ad_provider: string,
  checkout_provider?: string,
  conversion?: string,
  expenses: number,
  revenue: number,
  clicks: number,
  sales: number
  checkout: number,
  roas?: number
}
