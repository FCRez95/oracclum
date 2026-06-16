import { CreateAsaasClient } from "../../../domain/usecases/asaas/create-asaas-client";
import { ok, serverError } from "../../helpers/http-helper";
import { Controller, HttpRequest, HttpResponse } from "../../protocols";

export class CreateAsaasClientController implements Controller {
  private readonly createAsaasClient: CreateAsaasClient

  constructor (createAsaasClient: CreateAsaasClient) {
    this.createAsaasClient = createAsaasClient
  }
  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { name, email, cpfcnpj, phone } = httpRequest.body
      await this.createAsaasClient.create(name, email, cpfcnpj, phone)
      
      return ok('Client created')
    } catch (error) {
      serverError(error)      
    }    
  }
}