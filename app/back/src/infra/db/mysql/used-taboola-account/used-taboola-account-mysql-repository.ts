import { Pool } from "mysql2"
import { LoadUsedTaboolaAccountByIdRepository, UsedTaboolaAccountModel } from "../../../../data/protocols/db/used-taboola-account/load-used-taboola-account-by-id-repository"
import { SaveUsedTaboolaAccountRepository } from "../../../../data/protocols/db/used-taboola-account/save-used-taboola-account-repository"
import { getOne, insertOne } from "../mysql-helper"

export class UsedTaboolaAccountMySqlRepository implements LoadUsedTaboolaAccountByIdRepository, SaveUsedTaboolaAccountRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async loadByTaboolaId (taboolaId: string): Promise<UsedTaboolaAccountModel | null> {
    const result = await getOne(this.connectionPool, 'used_taboola_accounts', 'taboola_id', taboolaId)
    return result[0] || null
  }

  async save (idUser: number, taboolaId: string): Promise<void> {
    await insertOne(this.connectionPool, 'used_taboola_accounts', {
      id_user: idUser,
      taboola_id: taboolaId
    })
  }
}
