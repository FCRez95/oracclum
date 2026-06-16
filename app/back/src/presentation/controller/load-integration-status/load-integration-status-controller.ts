import { LoadIntegrationStatus } from "../../../domain/usecases/campaign/load-integration-status"
import { noContent, ok, serverError, unauthorized } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse } from "../../protocols"

export class LoadIntegrationStatusController implements Controller {
  constructor (private readonly loadIntegrationStatus: LoadIntegrationStatus) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id_campaign } = httpRequest.params
      const { idUser } = httpRequest.body

      const result = await this.loadIntegrationStatus.load(idUser, Number(id_campaign))

      if (!result.authorized) return unauthorized()
      if (!result.status) return noContent()

      return ok(result.status)
    } catch (error) {
      return serverError(error)
    }
  }
}
