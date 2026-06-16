import { HttpRequest, HttpResponse, Middleware } from '../protocols'
import { forbidden, ok, serverError } from '../helpers/http-helper'
import { AccessDeniedError, TermsNotAcceptedError } from '../errors'
import { LoadUserConsents } from '../../domain/usecases/user-consents/load-user-consents'

export class UserConsentsMiddleware implements Middleware {
  constructor(
    private readonly loadUserConsents: LoadUserConsents
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const idUser = httpRequest.body?.idUser
      if (!idUser) {
        return forbidden(new AccessDeniedError())
      }

      const consents = await this.loadUserConsents.load(idUser)

      if (!consents || consents.contract_signed !== 1) {
        return forbidden(new TermsNotAcceptedError())
      }

      return ok({})
    } catch (error) {
      return serverError(error)
    }
  }
}
