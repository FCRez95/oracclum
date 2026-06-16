import { LoadAccountByToken } from '../../../domain/usecases/account/load-account-by-token'
import { LoadAllAccounts } from '../../../domain/usecases/account/load-all-accounts'
import { ok, serverError, unauthorized } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoadAllUsersController implements Controller {
  private readonly loadAllAccounts: LoadAllAccounts

  constructor (loadAllAccounts: LoadAllAccounts) {
    this.loadAllAccounts = loadAllAccounts
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const allUsers = await this.loadAllAccounts.loadAll()
      return ok(allUsers)
    } catch (error) {
      return serverError(error)
    }
  }
}
