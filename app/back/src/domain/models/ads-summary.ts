import { OptimizationData } from "./optimization-data"

export interface AdsSummaryModel {
  id_ads_taboola: number
  title: string
  thumbnail: string
  summary?: OptimizationData
}