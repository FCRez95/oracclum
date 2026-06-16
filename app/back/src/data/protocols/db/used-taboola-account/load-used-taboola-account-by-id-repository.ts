export interface UsedTaboolaAccountModel {
  id_user: number
  taboola_id: string
}

export interface LoadUsedTaboolaAccountByIdRepository {
  loadByTaboolaId (taboolaId: string): Promise<UsedTaboolaAccountModel | null>
}
