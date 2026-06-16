import { Pool } from "mysql2"
import { DeleteAllowedMetaAccountsRepository } from "../../../../data/protocols/db/allowed-meta-account/delete-allowed-meta-accounts-repository"
import { LoadAllowedMetaAccountsRepository } from "../../../../data/protocols/db/allowed-meta-account/load-allowed-meta-accounts-repository"
import { SaveAllowedMetaAccountsRepository } from "../../../../data/protocols/db/allowed-meta-account/save-allowed-meta-accounts-repository"
import { AllowedMetaAccount } from "../../../../domain/usecases/integrations/add-meta-info"
import { deleteById, insertOne, runQuery } from "../mysql-helper"

export class AllowedMetaAccountMySqlRepository implements SaveAllowedMetaAccountsRepository, DeleteAllowedMetaAccountsRepository, LoadAllowedMetaAccountsRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async save (idUser: number, accounts: AllowedMetaAccount[]): Promise<void> {
    await deleteById(this.connectionPool, 'allowed_meta_account', 'id_user', idUser)
    for (const account of accounts) {
      await insertOne(this.connectionPool, 'allowed_meta_account', {
        id_user: idUser,
        account_id: account.account_id,
        name: account.name
      })
    }
  }

  async deleteByUser (idUser: number): Promise<void> {
    await deleteById(this.connectionPool, 'allowed_meta_account', 'id_user', idUser)
  }

  async loadByUser (idUser: number): Promise<AllowedMetaAccount[]> {
    return await runQuery(this.connectionPool, 'SELECT account_id, name FROM allowed_meta_account WHERE id_user = ?', [idUser])
  }
}
