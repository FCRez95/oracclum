export interface DeleteAllowedMetaAccountsRepository {
  deleteByUser (idUser: number): Promise<void>
}
