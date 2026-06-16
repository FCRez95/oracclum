export interface ChangePass {
  change (id_user: number, password: string): Promise<void>
}
