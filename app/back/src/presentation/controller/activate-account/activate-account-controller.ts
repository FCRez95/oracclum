import { ActivateAccount } from "../../../domain/usecases/account/activate-account"
import { MissingParamError, NotFoundError } from "../../errors"
import { badRequest, ok, serverError } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse } from "../../protocols"

export class ActivateAccountController implements Controller {
  private readonly activateAccount: ActivateAccount

  constructor (activateAccount: ActivateAccount) {
    this.activateAccount = activateAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { userToActivate } = httpRequest.body
      if (!userToActivate) return badRequest(new MissingParamError('userToActivate'))
      const result = await this.activateAccount.activate(userToActivate)
      if (result === null) return badRequest(new NotFoundError('User'))

      return ok('User activated!')
    } catch (error) {
      return serverError(error)
    }
  }
}
