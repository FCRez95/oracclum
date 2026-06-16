import { SavePixelInfo } from "../../../domain/usecases/campaign/save-pixel-info"
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse, Validation } from "../../protocols"

export class SavePixelInfoController implements Controller {
  constructor (
    private readonly savePixelInfo: SavePixelInfo,
    private readonly validation: Validation
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { idUser, id_campaign, access_token, pixel_id } = httpRequest.body
      const result = await this.savePixelInfo.save(idUser, { id_campaign, access_token, pixel_id })

      if (!result) {
        return unauthorized()
      }

      return ok(result)
    } catch (error) {
      return serverError(error)
    }
  }
}
