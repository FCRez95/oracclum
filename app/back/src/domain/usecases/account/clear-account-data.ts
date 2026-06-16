export interface ClearAccountData {
  clear (idUser: number): Promise<void | null>
}
