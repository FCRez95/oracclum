import { OptimizationData } from "./optimization-data"

export interface CampaignSiteSummaryModel {
  id_campaign: string
  id_site: string
  site: string
  target: string
  bid?: number
  is_active?: boolean
  summary: OptimizationData
}
