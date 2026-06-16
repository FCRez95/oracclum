import { EditCampaignLink } from "../../../domain/usecases/campaign/edit-campaign";
import { serverError, ok } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "./edit-campaign-controller-protocols";


export class EditCampaignLinkController implements Controller {
    private readonly editCampaignLink: EditCampaignLink


    constructor(editCampaignLink: EditCampaignLink) {
        this.editCampaignLink = editCampaignLink

    }

    async handle(httpRequest: HttpRequest): Promise<any> {
        try {

            const { idCampaign, link, id_user } = httpRequest.body
            const editedCampaign = await this.editCampaignLink.edit(idCampaign, link, id_user)

            return ok({ ...editedCampaign })


        } catch (error) {
            return serverError(error)
        }
    }
}