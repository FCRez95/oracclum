export interface SaveUsedMetaAccountsRepository {
  saveMany (idUser: number, metaIds: string[]): Promise<void>
}
