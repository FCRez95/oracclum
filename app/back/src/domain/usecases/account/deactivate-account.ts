export interface DeactivateAccount {
  deactivate (idUser: number): Promise<void | null>
}
