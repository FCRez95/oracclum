export interface DeleteAccount {
  delete (idUser: number): Promise<void | null>
}
