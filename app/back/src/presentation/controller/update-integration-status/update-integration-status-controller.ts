import { UpdateIntegrationStatus } from "../../../domain/usecases/campaign/update-integration-status"
import { InvalidParamError } from "../../errors"
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http-helper"
import { Controller, HttpRequest, HttpResponse, Validation } from "../../protocols"

const ALLOWED_STEPS = ['ad_provider', 'funnel', 'checkout', 'test']

export class UpdateIntegrationStatusController implements Controller {
  constructor (
    private readonly updateIntegrationStatus: UpdateIntegrationStatus,
    private readonly validation: Validation
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { idUser, idCampaign, step, status } = httpRequest.body

      if (!ALLOWED_STEPS.includes(step)) {
        return badRequest(new InvalidParamError('step'))
      }

      if (![0, 1].includes(status)) {
        return badRequest(new InvalidParamError('status'))
      }

      const result = await this.updateIntegrationStatus.update(idUser, {
        idCampaign,
        step,
        status
      })

      if (!result) {
        return unauthorized()
      }

      return ok(result)
    } catch (error) {
      return serverError(error)
    }
  }
}
