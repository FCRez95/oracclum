export interface MetaClickModel {
  id: number
  id_click: string
  id_campaign: number
  id_campaign_meta?: string
  id_ad_set?: string
  id_ad_meta?: string
  step_1: number
  step_2: number
  step_3: number
  checkout: number
  revenue: number
  payment_type?: string
  id_order?: string
  created_at: Date
}
