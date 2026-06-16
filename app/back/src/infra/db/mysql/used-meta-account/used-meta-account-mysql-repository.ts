import { Pool } from "mysql2"
import { LoadUsedMetaAccountsByIdsRepository, UsedMetaAccountModel } from "../../../../data/protocols/db/used-meta-account/load-used-meta-accounts-by-ids-repository"
import { SaveUsedMetaAccountsRepository } from "../../../../data/protocols/db/used-meta-account/save-used-meta-accounts-repository"
import { insertOne, runQuery } from "../mysql-helper"

export class UsedMetaAccountMySqlRepository implements LoadUsedMetaAccountsByIdsRepository, SaveUsedMetaAccountsRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async loadByMetaIds (metaIds: string[]): Promise<UsedMetaAccountModel[]> {
    if (!metaIds.length) return []

    const placeholders = metaIds.map(() => '?').join(', ')
    return await runQuery(
      this.connectionPool,
      `SELECT id_user, meta_id FROM used_meta_accounts WHERE meta_id IN (${placeholders})`,
      metaIds
    )
  }

  async saveMany (idUser: number, metaIds: string[]): Promise<void> {
    const uniqueMetaIds = [...new Set(metaIds)]
    for (const metaId of uniqueMetaIds) {
      await insertOne(this.connectionPool, 'used_meta_accounts', {
        id_user: idUser,
        meta_id: metaId
      })
    }
  }
}
