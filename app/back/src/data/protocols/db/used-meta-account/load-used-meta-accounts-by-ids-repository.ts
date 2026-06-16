export interface UsedMetaAccountModel {
  id_user: number
  meta_id: string
}

export interface LoadUsedMetaAccountsByIdsRepository {
  loadByMetaIds (metaIds: string[]): Promise<UsedMetaAccountModel[]>
}
