import { AccountModel } from '../../models/account'

export interface Logout {
  logout (id_user: number, access_token: string): Promise<null>
}