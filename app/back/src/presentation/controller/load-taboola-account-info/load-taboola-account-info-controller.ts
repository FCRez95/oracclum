import { LoadTaboolaAccountInfo } from '../../../domain/usecases/account/load-taboola-account-info'
import { noContent, ok, serverError, taboolaTimeOut, taboolaTooMany } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoadTaboolaAccountInfoController implements Controller {
  private readonly loadTaboolaAccountInfo: LoadTaboolaAccountInfo

  constructor (loadTaboolaAccountInfo: LoadTaboolaAccountInfo) {
    this.loadTaboolaAccountInfo = loadTaboolaAccountInfo
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const accessTokenHeader = httpRequest.headers?.['x-access-token']
      const accessToken = Array.isArray(accessTokenHeader) ? accessTokenHeader[0] : accessTokenHeader
      
      const taboolaAccountInfo = await this.loadTaboolaAccountInfo.loadInfo(accessToken)
      if (!taboolaAccountInfo) {
        return noContent()
      }
      return ok(taboolaAccountInfo)
    } catch (error) {
      if (error.message === 'Taboola timeout') {
        return taboolaTimeOut(error)
      }
      return serverError(error)
    }
  }
}
