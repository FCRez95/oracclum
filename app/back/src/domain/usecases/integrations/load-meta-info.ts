import { AllowedMetaAccount } from './add-meta-info'

export interface LoadMetaInfoResult {
  access_token: string
  allowed_accounts: AllowedMetaAccount[]
}

export interface LoadMetaInfo {
  load (idUser: number): Promise<LoadMetaInfoResult | null>
}
