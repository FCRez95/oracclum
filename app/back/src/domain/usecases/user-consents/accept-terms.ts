export interface AcceptTerms {
    acceptTerms (idUser: number, ip_address: string): Promise<void>
}