export interface ActivateAccount {
  activate (idUser: number): Promise<void | null>
}
