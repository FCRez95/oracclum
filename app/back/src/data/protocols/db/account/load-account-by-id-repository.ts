import { AccountModel } from '../../../../domain/models/account'

export interface LoadAccountByIdRepository {
  loadById (id: number): Promise<AccountModel>
}
