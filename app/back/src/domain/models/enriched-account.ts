export interface EnrichedAccountModel {
  id: number
  name: string
  email: string
  phone?: string
  cpfcnpj?: string
  user_type: string
  allow_clicks: boolean
  contract_signed: boolean
  signed_at?: string
  signed_ip?: string
  total_clicks: number
  total_revenue: number
  total_sales: number
}
