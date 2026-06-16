export interface AddTaboolaInfo {
  addInfo (idUser: number, accoutId: string, clientId: string, clientSecret: string) : Promise<string>
}