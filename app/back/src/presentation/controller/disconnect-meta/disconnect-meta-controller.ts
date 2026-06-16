import { badRequest, ok, serverError } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse, Validation } from "../../protocols"
import { DisconnectMeta } from "../../../domain/usecases/integrations/disconnect-meta"

export class DisconnectMetaController implements Controller {
  private readonly validation: Validation
  private readonly disconnectMeta: DisconnectMeta

  constructor (disconnectMeta: DisconnectMeta, validation: Validation) {
    this.validation = validation
    this.disconnectMeta = disconnectMeta
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { idUser } = httpRequest.body

      await this.disconnectMeta.disconnect(idUser)

      return ok('Conta Meta desconectada com sucesso!')
    } catch (error) {
      return serverError(error)
    }
  }
}
