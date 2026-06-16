export interface CreateAsaasClient {
  create(name: string, email: string, cpfcnpj: string, phone: string): Promise<void>
}