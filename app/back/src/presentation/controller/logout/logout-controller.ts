import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse, Logout } from './logout-controller-protocols'

export class LogoutController implements Controller {
  private readonly logout: Logout

  constructor (logout: Logout) {
    this.logout = logout
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser, accessToken } = httpRequest.body
      await this.logout.logout(idUser, accessToken)
      
      return ok('Logout complete!')
    } catch (error) {
      return serverError(error)
    }
  }
}
