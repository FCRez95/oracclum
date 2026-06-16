import { badRequest, forbidden, ok, serverError } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse, Validation } from "../../protocols";
import { AddMetaInfo } from "../../../domain/usecases/integrations/add-meta-info";
import { ProviderAccountInUseError } from "../../errors";

export class AddMetaInfoController implements Controller {
  private readonly validation: Validation
  private readonly addMetaInfo: AddMetaInfo

  constructor (addMetaInfo: AddMetaInfo, validation: Validation) {
    this.validation = validation
    this.addMetaInfo = addMetaInfo
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { idUser, metaAccessToken, allowedAccounts } = httpRequest.body

      await this.addMetaInfo.addInfo(idUser, metaAccessToken, allowedAccounts)

      return ok('Informações adicionadas com sucesso!')
    } catch (error) {
      if (error instanceof ProviderAccountInUseError) {
        return forbidden(error)
      }
      return serverError(error)
    }
  }
}
