import { ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse, LoadUserConsents } from './load-user-consents-controller-protocols'

export class LoadUserConsentsController implements Controller {
  private readonly loadUserConsents: LoadUserConsents

  constructor(loadUserConsents: LoadUserConsents) {
    this.loadUserConsents = loadUserConsents
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body

      const user_consents = await this.loadUserConsents.load(idUser)
      if (!user_consents) {
        return ok({
          id_user: idUser,
          contract_signed: false,
          signed_at: null,
          ip_address: null,
          subpaid: false
        });
      }
      return ok(user_consents)
    } catch (error) {
      return serverError(error)
    }
  }
}
