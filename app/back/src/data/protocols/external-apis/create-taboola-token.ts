export interface CreateTbToken {
  createAccessToken (id_user: number, decryptedTaboola: any): Promise<string>
}