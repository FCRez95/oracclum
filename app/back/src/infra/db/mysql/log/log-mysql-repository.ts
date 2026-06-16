import { Pool } from 'mysql2'
import { LogErrorRepository } from '../../../../data/protocols/db/log/log-error-repository'
import { insertOne } from '../mysql-helper'

export class LogMysqlRepository implements LogErrorRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async logError (stack: string): Promise<void> {
    await insertOne(this.connectionPool, 'logs', { stack: stack })
  }
}
