import { ChangePass } from "../../../domain/usecases/account/change-password";
import { ok, serverError } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class ChangePassController implements Controller {
  private readonly changePass: ChangePass

  constructor(changePass: ChangePass) {
    this.changePass = changePass
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { idUser, newPassword } = httpRequest.body

      await this.changePass.change(idUser, newPassword)
      return ok('Password changed!')
    } catch (error) {
      return serverError(error)
    }
  }
}
