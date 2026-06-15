export interface MetaCampaignData {
  status: string
  effective_status?: string
  issues_info?: { error_code: number; error_summary: string; error_message: string; level: string }[]
  objective?: string
  daily_budget?: string
  lifetime_budget?: string
  buying_type?: string
}
