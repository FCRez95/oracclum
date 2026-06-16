export interface SaveUsedTaboolaAccountRepository {
  save (idUser: number, taboolaId: string): Promise<void>
}
