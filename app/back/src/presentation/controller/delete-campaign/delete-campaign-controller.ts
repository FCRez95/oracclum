import { DeleteCampaign } from "../../../domain/usecases/campaign/delete-campaign";
import { ok, serverError, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class DeleteCampaignController implements Controller {
  private readonly deleteCampaign: DeleteCampaign

  constructor (deleteCampaign: DeleteCampaign) {
    this.deleteCampaign = deleteCampaign
  }
  
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser, idCampaign } = httpRequest.body

      const deleted = await this.deleteCampaign.delete(idUser, idCampaign)
      if (deleted === null) return unauthorized()
      
      return ok('Campaign deleted!')
    } catch (error) {
      return serverError(error)
    }
  }
} 