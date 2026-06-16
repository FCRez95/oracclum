import { DeleteAccount } from "../../../domain/usecases/account/delete-account";
import { MissingParamError, NotFoundError } from "../../errors";
import { badRequest, ok, serverError } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class DeleteAccountController implements Controller {
  private readonly deleteAccount: DeleteAccount

  constructor (deleteAccount: DeleteAccount) {
    this.deleteAccount = deleteAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { userToDelete } = httpRequest.body
      if (!userToDelete) return badRequest(new MissingParamError('userToDelete'))
      const result = await this.deleteAccount.delete(userToDelete)
      if (result === null) return badRequest(new NotFoundError('User'))

      return ok('User deleted!')
    } catch (error) {
      return serverError(error)
    }
  }
}
