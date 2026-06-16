import { EditCampaign } from "../../../domain/usecases/campaign/edit-campaign";
import { badRequest, serverError, ok } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse, Validation } from "./edit-campaign-controller-protocols";


export class EditCampaignController implements Controller {
    private readonly editCampaign: EditCampaign
    private readonly validation: Validation


    constructor(editCampaign: EditCampaign, validation: Validation) {
        this.editCampaign = editCampaign
        this.validation = validation
    }

    async handle(httpRequest: HttpRequest): Promise<any> {
        try {
            const error = this.validation.validate(httpRequest.body)
            if (error) {
                return badRequest(error)
            }

            const { idCampaign, name, link, ad_provider, sub_account, conversion_name, checkout_provider, external_id, id_user } = httpRequest.body
            const editedCampaign = await this.editCampaign.edit(idCampaign, { name, link, ad_provider, conversion_name, checkout_provider, external_id, sub_account }, id_user)

            return ok({ ...editedCampaign })

        } catch (error) {
            return serverError(error)
        }
    }
}
