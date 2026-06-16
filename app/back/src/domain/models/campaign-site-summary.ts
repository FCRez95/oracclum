import { OptimizationData } from "./optimization-data"

export interface CampaignSiteSummaryModel {
  id_campaign: number
  id_campaign_taboola: number
  id_site: string
  site: string
  target: string
  summary?: OptimizationData
}