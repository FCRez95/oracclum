import { HttpRequest, HttpResponse, Controller, AddAccount, Validation } from './signup-controller-protocols'
import { badRequest, serverError, ok, forbidden } from '../../helpers/http-helper'
import { EmailInUseError } from '../../errors'

export class SignUpController implements Controller {
  private readonly addAccount: AddAccount
  private readonly validation: Validation

  constructor (addAccount: AddAccount, validation: Validation) {
    this.addAccount = addAccount
    this.validation = validation
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const { name, email, password, cpfcnpj, phone, user_type } = httpRequest.body
      const account = await this.addAccount.add({
        name: name || '',
        email,
        password,
        cpfcnpj: cpfcnpj || '',
        phone: phone,
        user_type: user_type || 'ancient'
      })
      if (!account) {
        return forbidden(new EmailInUseError())
      }
      return ok(account)
    } catch (error) {
      return serverError(error)
    }
  }
}
