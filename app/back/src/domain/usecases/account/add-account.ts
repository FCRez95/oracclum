import { AccountModel } from '../../models/account'

export interface AddAccountModel {
  name: string,
  email: string,
  password: string,
  cpfcnpj: string,
  phone: string,
  user_type: string
}

export interface AddAccount {
  add (account : AddAccountModel): Promise<AccountModel | null>
}
