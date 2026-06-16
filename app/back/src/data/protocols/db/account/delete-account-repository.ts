export interface DeleteAccountRepository {
  deleteAccount (idUser: number): Promise<void>
}
