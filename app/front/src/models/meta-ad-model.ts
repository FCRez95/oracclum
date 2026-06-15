import { OptimizationData } from "./optimization-data"

export interface MetaAdModel {
  id: string
  name: string
  status: string
  effective_status?: string
  adset_id: string
  thumbnail?: string
  title?: string
  body?: string
  summary?: OptimizationData
}
