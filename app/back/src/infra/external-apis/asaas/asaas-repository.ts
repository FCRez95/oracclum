import { CreateClient } from "../../../data/protocols/external-apis/asaas";

export class AsaasRepository implements CreateClient {
  private readonly APIkey: string

  constructor (APIkey: string) {
    this.APIkey = APIkey
  }

  async create(name: string, cpfCnpj: string, email: string, phoneNumber: string): Promise<string> {
    const url = 'https://sandbox.asaas.com/api/v3/customers';

    const client = {
      name: name,
      cpfCnpj: cpfCnpj,
      email: email,
      phone: phoneNumber
    }

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: this.APIkey
      },
      body: JSON.stringify(client)
    }

    let custId: string
    fetch(url, options)
    .then(res => res.json())
    .then(json => {
      custId = json
    })
    .catch(() => undefined)

    return custId
  }
}
