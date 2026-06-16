import { RegisterWaitList } from "../../../domain/usecases/wait-list/register-wait-list";
import { EmailInUseError } from "../../errors";
import { forbidden, ok, serverError, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class RegisterWaitListController implements Controller {
  private readonly registerWaitList: RegisterWaitList

  constructor(registerWaitList: RegisterWaitList) {
      this.registerWaitList = registerWaitList
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { name, email, cel, prom_code } = httpRequest.body

      const client = await this.registerWaitList.register({name, email, cel, prom_code})
      if (client) return ok(client)
      return forbidden(new EmailInUseError())
    } catch (error) {
      return serverError(error)
    }
  }
}
