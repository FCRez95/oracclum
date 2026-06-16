import { ClearAccountData } from "../../../domain/usecases/account/clear-account-data"
import { NotFoundError } from "../../errors"
import { badRequest, ok, serverError } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse } from "../../protocols"

export class ClearAccountDataController implements Controller {
  constructor (private readonly clearAccountData: ClearAccountData) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body
      const result = await this.clearAccountData.clear(idUser)

      if (result === null) return badRequest(new NotFoundError('User'))

      return ok('Account data deleted!')
    } catch (error) {
      return serverError(error)
    }
  }
}
