import { LoadAccountByToken } from "../../../domain/usecases/account/load-account-by-token";
import { ok, serverError, unauthorized } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class LoadUserDataController implements Controller {
  private readonly loadAccountByToken: LoadAccountByToken;

  constructor(loadAccountByToken: LoadAccountByToken) {
    this.loadAccountByToken = loadAccountByToken;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const accessTokenHeader = httpRequest.headers?.['x-access-token'];
      const accessToken = Array.isArray(accessTokenHeader) ? accessTokenHeader[0] : accessTokenHeader;
      if (!accessToken) {
        return unauthorized();
      }
      const user = await this.loadAccountByToken.load(accessToken);
      if (!user) {
        return unauthorized();
      }
      return ok(user);
    } catch (error) {
      return serverError(error);
    }
  }
}
