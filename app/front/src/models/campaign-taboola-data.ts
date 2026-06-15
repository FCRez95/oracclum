export interface TargetSite {
  target: string;
  cpc_modification: number;
}

export interface CampaignTaboolaData {
  cpc?: number | string;
  daily_cap?: number | string;
  is_active?: boolean;
  publisher_bid_modifier: TargetSite[];
  publisher_targeting: string[];
}

export interface EditTaboolaData {
  cpc: number | string;
  daily_cap: number | string;
  status: string;
  active: boolean;
}