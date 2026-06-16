export interface CreateClient {
  create(name: string, cpfCnpj: string, email: string, phoneNumber: string): Promise<string>
}