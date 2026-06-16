import { AcceptTerms } from "../../../domain/usecases/user-consents/accept-terms"
import { AcceptTermsRepository } from "../../protocols/db/user-consents/accept-terms-repository"

export class DbAcceptTerms implements AcceptTerms {
    private readonly acceptTermsRepository: AcceptTermsRepository

    constructor (acceptTermsRepository: AcceptTermsRepository) {
        this.acceptTermsRepository = acceptTermsRepository
    }

    async acceptTerms (id_user: number, ip_address: string): Promise<void> {
        await this.acceptTermsRepository.acceptTerms(id_user, ip_address)
    }
}