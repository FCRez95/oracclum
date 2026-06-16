import { DeactivateAccount } from "../../../domain/usecases/account/deactivate-account"
import { MissingParamError, NotFoundError } from "../../errors"
import { badRequest, ok, serverError } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse } from "../../protocols"

export class DeactivateAccountController implements Controller {
  private readonly deactivateAccount: DeactivateAccount

  constructor (deactivateAccount: DeactivateAccount) {
    this.deactivateAccount = deactivateAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { userToDeactivate } = httpRequest.body
      if (!userToDeactivate) return badRequest(new MissingParamError('userToDeactivate'))
      const result = await this.deactivateAccount.deactivate(userToDeactivate)
      if (result === null) return badRequest(new NotFoundError('User'))

      return ok('User deactivated!')
    } catch (error) {
      return serverError(error)
    }
  }
}
