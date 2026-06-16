import { deleteById, getOne, insertOne } from '../mysql-helper'
import { Pool } from 'mysql2'
import { AcceptTermsRepository } from '../../../../data/protocols/db/user-consents/accept-terms-repository'
import { DeleteUserConsentsRepository } from '../../../../data/protocols/db/user-consents/delete-user-consents-repository'
import { LoadUserConsentsRepository } from '../../../../data/protocols/db/user-consents/load-user-consents-repository'
import { UserConsentsModel } from '../../../../domain/models/user-consents'

export class UserConsentsMySqlRepository implements AcceptTermsRepository, LoadUserConsentsRepository, DeleteUserConsentsRepository {
    public readonly connectionPool: Pool

    constructor(pool: Pool) {
        this.connectionPool = pool
    }

    async loadUserConsents(id_user: number): Promise<UserConsentsModel | null> {
        const result = await getOne(this.connectionPool, 'user_consents', 'id_user', id_user);

        if (!result || result.length === 0) {
            return null;
        }

        return result[0] as UserConsentsModel;
    }

    async acceptTerms(id_user: number, ip_address: string): Promise<void> {
        await insertOne(this.connectionPool, "user_consents", {
            id_user,
            contract_signed: 1,
            signed_at: new Date(),
            ip_address,
            subpaid: 0
        });
    }

    async deleteByUser(idUser: number): Promise<void> {
        await deleteById(this.connectionPool, 'user_consents', 'id_user', idUser)
    }

}
