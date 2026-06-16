export interface AcceptTermsRepository {
    acceptTerms (id_user: number, ip_address: string): Promise<void>
}