import { LoadMetaInfo } from '../../../domain/usecases/integrations/load-meta-info'
import { noContent, ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'

export class LoadMetaInfoController implements Controller {
  private readonly loadMetaInfo: LoadMetaInfo

  constructor (loadMetaInfo: LoadMetaInfo) {
    this.loadMetaInfo = loadMetaInfo
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser } = httpRequest.body
      const result = await this.loadMetaInfo.load(idUser)
      if (!result) {
        return noContent()
      }
      return ok(result)
    } catch (error) {
      return serverError(error)
    }
  }
}
