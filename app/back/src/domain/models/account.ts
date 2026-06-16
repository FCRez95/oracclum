export interface AccountModel {
  id: number
  name: string
  email: string
  password: string
  cpfcnpj: string
  phone: string
  user_type: string
  allow_clicks: boolean
  taboola_info?: string
  taboola_access_token?: string
  meta_access_token?: string
}
