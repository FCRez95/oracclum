import { badRequest, forbidden, ok, serverError } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse, Validation } from "../../protocols";
import { AddTaboolaInfo } from "../../../domain/usecases/integrations/add-taboola-info";
import { ProviderAccountInUseError } from "../../errors";

export class AddTaboolaInfoController implements Controller {
  private readonly validation: Validation
  private readonly addTaboolaInfo: AddTaboolaInfo
  
  constructor (addTaboolaInfo: AddTaboolaInfo, validation: Validation) {
    this.validation = validation
    this.addTaboolaInfo = addTaboolaInfo
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { idUser, accountId, clientId, clientSecret } = httpRequest.body

      const tb_access_token = await this.addTaboolaInfo.addInfo(idUser, accountId, clientId, clientSecret)

      return ok(tb_access_token)
    } catch (error) {
      if (error instanceof ProviderAccountInUseError) {
        return forbidden(error)
      }
      return serverError(error)
    }
  }
}
