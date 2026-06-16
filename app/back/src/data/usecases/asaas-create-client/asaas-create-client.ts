import { CreateAsaasClient } from "../../../domain/usecases/asaas/create-asaas-client";
import { SaveAsaasCustomerId } from "../../protocols/db/account/save-asaas-customer-id";
import { CreateClient } from "../../protocols/external-apis/asaas";

export class AsaasCreateClient implements CreateAsaasClient {
  private readonly createClient: CreateClient
  private readonly saveAsaasCustomerId: SaveAsaasCustomerId

  constructor(createClient: CreateClient, saveAsaasCustomerId: SaveAsaasCustomerId) {
    this.createClient = createClient;
    this.saveAsaasCustomerId = saveAsaasCustomerId;
  }

  async create(name: string, email: string, cpfcnpj: string, phone: string): Promise<void> {
    const customerId = await this.createClient.create(name, email, cpfcnpj, phone)
    if (customerId) await this.saveAsaasCustomerId.saveCustomerId(customerId)
  }
}