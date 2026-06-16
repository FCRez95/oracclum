import { AddAccountModel } from '../../../../domain/usecases/account/add-account'
import { AccountModel } from '../../../../domain/models/account'

export const mapCreatedAccount = (addedAccount: AddAccountModel, addedAccountId: number): AccountModel => {
  return Object.assign({}, addedAccount, { id: addedAccountId, allow_clicks: true })
}
