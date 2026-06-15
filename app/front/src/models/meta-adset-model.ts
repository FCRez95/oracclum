import { OptimizationData } from "./optimization-data"

export interface MetaAdsetModel {
  id: string
  name: string
  status?: string
  effective_status?: string
  daily_budget?: string
  lifetime_budget?: string
  bid_amount?: string
  bid_strategy?: string
  optimization_goal?: string
  summary?: OptimizationData
}
