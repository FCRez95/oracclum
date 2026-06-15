export interface CampaignOptimizationSummary {
  checkout: number;
  clicks: number;
  cpa: number;
  cpc: number;
  expenses: number;
  revenue: number;
  roas: number;
  sales: number;
  vcpm: number;
  vctr: number;
  visible_impressions?: number;
}

export interface CampaignOptimizationModel {
  id: number;
  external_id?: string;
  id_user: number;
  name: string;
  link?: string;
  sub_account?: string | null;
  ad_provider: string;
  checkout_provider: string;
  conversion_name: string;
  click_auth?: string;
  summary: CampaignOptimizationSummary;
}
