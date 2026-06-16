export interface AllowedMetaAccount {
  account_id: string
  name: string
}

export interface AddMetaInfo {
  addInfo (idUser: number, metaAccessToken: string, allowedAccounts: AllowedMetaAccount[]) : Promise<void>
}