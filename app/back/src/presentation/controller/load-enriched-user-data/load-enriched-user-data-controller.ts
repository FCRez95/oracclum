import { LoadEnrichedUserData } from '../../../domain/usecases/account/load-enriched-user-data'
import { ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoadEnrichedUserDataController implements Controller {
  private readonly loadEnrichedUserData: LoadEnrichedUserData

  constructor (loadEnrichedUserData: LoadEnrichedUserData) {
    this.loadEnrichedUserData = loadEnrichedUserData
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body
      const userData = await this.loadEnrichedUserData.load(idUser)
      return ok(userData)
    } catch (error) {
      return serverError(error)
    }
  }
}
