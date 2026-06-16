import { ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse, AcceptTerms } from './accept-terms-controller-protocols'

export class AcceptTermsController implements Controller {
  private readonly acceptTerms: AcceptTerms

  constructor (acceptTerms: AcceptTerms) {
    this.acceptTerms = acceptTerms
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body
      await this.acceptTerms.acceptTerms(idUser, httpRequest.ip)
      return ok('Terms accepted')
    } catch (error) {
      return serverError(error)
    }
  } 
}
