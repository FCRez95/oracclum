export interface DecryptedClick {
  idUser: number
  domain: string
  createdAt: string
}

export interface ClickDecrypter {
  decryptClick (value: string): Promise<DecryptedClick | null>
}
