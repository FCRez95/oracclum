import { badRequest, ok, serverError } from '../../helpers/http-helper'
import { Controller, HttpRequest, HttpResponse, Validation, AddCampaign } from './add-campaign-controller-protocols'

export class AddCampaignController implements Controller {
  private readonly validation: Validation
  private readonly addCampaign: AddCampaign

  constructor (addCampaign: AddCampaign, validation: Validation) {
    this.validation = validation
    this.addCampaign = addCampaign
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { name, link, idUser, ad_provider, sub_account, conversion_name, checkout_provider, external_id } = httpRequest.body
      const newCampaign = await this.addCampaign.add(name, link, idUser, ad_provider, conversion_name, checkout_provider, external_id, sub_account)
      return ok({ ...newCampaign })
    } catch (error) {
      return serverError(error)
    }
  }
}
