import { LoadAccountByToken } from '../../domain/usecases/account/load-account-by-token'
import { AccessDeniedError } from '../errors'
import { forbidden, ok, serverError } from '../helpers/http-helper'
import { HttpRequest, HttpResponse, Middleware } from '../protocols'
import { backendDemoData } from '../../demo/demo-data'
import { isBackendDemoAccessToken } from '../../demo/demo-mode'

export class AuthMiddleware implements Middleware {
  private readonly loadAccountByToken: LoadAccountByToken
  private readonly role?: string

  constructor (loadAccountByToken: LoadAccountByToken, role?:string) {
    this.loadAccountByToken = loadAccountByToken
    this.role = role
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const accessToken = httpRequest.headers?.['x-access-token']
      if (accessToken) {
        if (isBackendDemoAccessToken(accessToken)) {
          if (this.role) {
            return forbidden(new AccessDeniedError())
          }

          return ok({ idUser: backendDemoData.user().id, isBackendDemo: true })
        }

        const user = await this.loadAccountByToken.load(accessToken, this.role)

        if (user) {
          return ok({ idUser: user.id })
        }
      }
      return forbidden(new AccessDeniedError())
    } catch (error) {
      return serverError(error)
    }
  }
}
