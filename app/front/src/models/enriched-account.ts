export interface EnrichedAccount {
  id: number;
  name: string;
  email: string;
  telephone?: string | null;
  phone?: string | null;
  user_type: string;
  allow_clicks: boolean;
  contract_signed: boolean;
  signed_at: string | null;
  ip_address: string | null;
  total_clicks: number;
  total_revenue: number;
  total_sales: number;
}
