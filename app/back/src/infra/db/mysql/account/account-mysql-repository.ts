import { AddAccountRepository } from '../../../../data/protocols/db/account/add-account-repository'
import { AddAccountModel } from '../../../../domain/usecases/account/add-account'
import { AccountModel } from '../../../../domain/models/account'
import { EnrichedAccountModel } from '../../../../domain/models/enriched-account'
import { insertOne, getOne, updateById, runQuery } from '../mysql-helper'
import { mapCreatedAccount } from './account-mysql-repository-helper'
import { Pool } from 'mysql2'
import { LoadAccountByEmailRepository } from '../../../../data/protocols/db/account/load-account-by-email-repository'
import { UpdateAccessTokenRepository } from '../../../../data/protocols/db/account/update-access-token-repository'
import { LoadAccountByTokenRepository } from '../../../../data/protocols/db/account/load-account-by-token-repository'
import { ChangePassRepository } from '../../../../data/protocols/db/account/change-pass-repository'
import { AddTaboolaInfoRepository } from '../../../../data/protocols/db/account/add-taboola-info-repository'
import { UpdateByIdRepository } from '../../../../data/protocols/db/account/update-by-id-repository'
import { LoadAllAccountsRepository } from '../../../../data/protocols/db/account/load-all-accounts-repository'
import { LoadEnrichedAccountByIdRepository } from '../../../../data/protocols/db/account/load-enriched-account-by-id-repository'
import { LoadAccountByIdRepository } from '../../../../data/protocols/db/account/load-account-by-id-repository'
import { DeleteAccountRepository } from '../../../../data/protocols/db/account/delete-account-repository'

export class AccountMySqlRepository implements AddAccountRepository, LoadAccountByEmailRepository,
  UpdateAccessTokenRepository, LoadAccountByTokenRepository, ChangePassRepository, AddTaboolaInfoRepository,
  UpdateByIdRepository, LoadAllAccountsRepository, LoadEnrichedAccountByIdRepository, LoadAccountByIdRepository,
  DeleteAccountRepository {
  public readonly connectionPool: Pool

  constructor (pool: Pool) {
    this.connectionPool = pool
  }

  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const result = await insertOne(this.connectionPool, 'Users', accountData)
    return mapCreatedAccount(accountData, result.insertId)
  }

  async changePassword(id_user: number, hashedPassword: string): Promise<void> {
    await updateById(this.connectionPool, 'Users', 'password', id_user, hashedPassword)
  }

  async loadByEmail (email: string): Promise<AccountModel> {
    const result = await getOne(this.connectionPool, 'Users', 'email', email)
    return result[0]
  }

  async loadById (id: number): Promise<AccountModel> {
    const result = await getOne(this.connectionPool, 'Users', 'id', id)
    return result[0]
  }

  async updateById(id: number, columnToUpdate: string, value: string): Promise<void> {
    await updateById(this.connectionPool, 'Users', columnToUpdate, id, value)
  }

  async updateAccessToken (id: number, accessToken: string): Promise<void> {
    await updateById(this.connectionPool, 'Users', 'access_token', id, accessToken)
  }

  async loadByToken (token: string, role?: string): Promise<AccountModel> {
    const result = await getOne(this.connectionPool, 'Users', 'access_token', token)
    if (!role || role === result[0].user_type) {
      return result[0]
    }
    return null
  }

  async addTaboolaInfo(id_user: number, encryptedInfo: string): Promise<void> {
    await updateById(this.connectionPool, 'Users', 'taboola_info', id_user, encryptedInfo)
  }

  async loadAccounts(): Promise<EnrichedAccountModel[]> {
    const query = `
      WITH user_periods AS (
        SELECT
          u.id, u.name, u.email, u.phone, u.cpfcnpj, u.user_type, u.allow_clicks,
          COALESCE(uc.contract_signed, 0) AS contract_signed,
          uc.signed_at,
          uc.ip_address,
          CASE
            WHEN uc.signed_at IS NULL THEN NULL
            WHEN CURDATE() >= DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0')))
            THEN DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0')))
            ELSE DATE(CONCAT(YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), '-',
              LPAD(MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))), 2, '0')))
          END AS period_start,
          CASE
            WHEN uc.signed_at IS NULL THEN NULL
            WHEN CURDATE() >= DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0')))
            THEN DATE_SUB(DATE(CONCAT(YEAR(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)), '-',
              LPAD(MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)))), 2, '0'))), INTERVAL 1 DAY)
            ELSE DATE_SUB(DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0'))), INTERVAL 1 DAY)
          END AS period_end
        FROM Users u
        LEFT JOIN user_consents uc ON u.id = uc.id_user
      )
      SELECT
        up.id, up.name, up.email, up.phone, up.cpfcnpj, up.user_type, up.allow_clicks,
        up.contract_signed, up.signed_at, up.ip_address,
        (
          SELECT COALESCE(SUM(sub.clicks), 0) FROM (
            SELECT COUNT(*) as clicks FROM campaigns c
            JOIN clicks_taboola ct ON c.id = ct.id_campaign
            WHERE c.id_user = up.id AND ct.created_at >= up.period_start AND ct.created_at <= up.period_end
            UNION ALL
            SELECT COUNT(*) FROM campaigns c
            JOIN clicks_meta cm ON c.id = cm.id_campaign
            WHERE c.id_user = up.id AND cm.created_at >= up.period_start AND cm.created_at <= up.period_end
          ) sub
        ) AS total_clicks,
        (
          SELECT COALESCE(SUM(sub.revenue), 0) FROM (
            SELECT COALESCE(SUM(ct.revenue), 0) as revenue FROM campaigns c
            JOIN clicks_taboola ct ON c.id = ct.id_campaign
            WHERE c.id_user = up.id AND ct.created_at >= up.period_start AND ct.created_at <= up.period_end
            UNION ALL
            SELECT COALESCE(SUM(cm.revenue), 0) FROM campaigns c
            JOIN clicks_meta cm ON c.id = cm.id_campaign
            WHERE c.id_user = up.id AND cm.created_at >= up.period_start AND cm.created_at <= up.period_end
          ) sub
        ) AS total_revenue,
        (
          SELECT COALESCE(SUM(sub.sales), 0) FROM (
            SELECT COUNT(*) as sales FROM campaigns c
            JOIN clicks_taboola ct ON c.id = ct.id_campaign
            WHERE c.id_user = up.id AND ct.created_at >= up.period_start AND ct.created_at <= up.period_end AND ct.revenue > 0
            UNION ALL
            SELECT COUNT(*) FROM campaigns c
            JOIN clicks_meta cm ON c.id = cm.id_campaign
            WHERE c.id_user = up.id AND cm.created_at >= up.period_start AND cm.created_at <= up.period_end AND cm.revenue > 0
          ) sub
        ) AS total_sales
      FROM user_periods up
    `
    const results = await runQuery(this.connectionPool, query)
    return results.map(row => ({
      ...row,
      contract_signed: Boolean(row.contract_signed)
    }))
  }

  async loadEnrichedAccountById(id: number): Promise<EnrichedAccountModel> {
    const query = `
      WITH user_periods AS (
        SELECT
          u.id, u.name, u.email, u.phone, u.cpfcnpj, u.user_type, u.allow_clicks,
          COALESCE(uc.contract_signed, 0) AS contract_signed,
          uc.signed_at,
          uc.ip_address,
          CASE
            WHEN uc.signed_at IS NULL THEN NULL
            WHEN CURDATE() >= DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0')))
            THEN DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0')))
            ELSE DATE(CONCAT(YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), '-',
              LPAD(MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))), 2, '0')))
          END AS period_start,
          CASE
            WHEN uc.signed_at IS NULL THEN NULL
            WHEN CURDATE() >= DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0')))
            THEN DATE_SUB(DATE(CONCAT(YEAR(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)), '-',
              LPAD(MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)))), 2, '0'))), INTERVAL 1 DAY)
            ELSE DATE_SUB(DATE(CONCAT(YEAR(CURDATE()), '-',
              LPAD(MONTH(CURDATE()), 2, '0'), '-',
              LPAD(LEAST(DAY(uc.signed_at), DAY(LAST_DAY(CURDATE()))), 2, '0'))), INTERVAL 1 DAY)
          END AS period_end
        FROM Users u
        LEFT JOIN user_consents uc ON u.id = uc.id_user
        WHERE u.id = ?
      )
      SELECT
        up.id, up.name, up.email, up.phone, up.cpfcnpj, up.user_type, up.allow_clicks,
        up.contract_signed, up.signed_at, up.ip_address,
        (
          SELECT COALESCE(SUM(sub.clicks), 0) FROM (
            SELECT COUNT(*) as clicks FROM campaigns c
            JOIN clicks_taboola ct ON c.id = ct.id_campaign
            WHERE c.id_user = up.id AND ct.created_at >= up.period_start AND ct.created_at <= up.period_end
            UNION ALL
            SELECT COUNT(*) FROM campaigns c
            JOIN clicks_meta cm ON c.id = cm.id_campaign
            WHERE c.id_user = up.id AND cm.created_at >= up.period_start AND cm.created_at <= up.period_end
          ) sub
        ) AS total_clicks,
        (
          SELECT COALESCE(SUM(sub.revenue), 0) FROM (
            SELECT COALESCE(SUM(ct.revenue), 0) as revenue FROM campaigns c
            JOIN clicks_taboola ct ON c.id = ct.id_campaign
            WHERE c.id_user = up.id AND ct.created_at >= up.period_start AND ct.created_at <= up.period_end
            UNION ALL
            SELECT COALESCE(SUM(cm.revenue), 0) FROM campaigns c
            JOIN clicks_meta cm ON c.id = cm.id_campaign
            WHERE c.id_user = up.id AND cm.created_at >= up.period_start AND cm.created_at <= up.period_end
          ) sub
        ) AS total_revenue,
        (
          SELECT COALESCE(SUM(sub.sales), 0) FROM (
            SELECT COUNT(*) as sales FROM campaigns c
            JOIN clicks_taboola ct ON c.id = ct.id_campaign
            WHERE c.id_user = up.id AND ct.created_at >= up.period_start AND ct.created_at <= up.period_end AND ct.revenue > 0
            UNION ALL
            SELECT COUNT(*) FROM campaigns c
            JOIN clicks_meta cm ON c.id = cm.id_campaign
            WHERE c.id_user = up.id AND cm.created_at >= up.period_start AND cm.created_at <= up.period_end AND cm.revenue > 0
          ) sub
        ) AS total_sales
      FROM user_periods up
    `
    const results = await runQuery(this.connectionPool, query, [id])
    if (!results.length) return null
    return {
      ...results[0],
      contract_signed: Boolean(results[0].contract_signed)
    }
  }

  async deleteAccount (idUser: number): Promise<void> {
    await runQuery(this.connectionPool, 'DELETE FROM Users WHERE id = ?', [idUser])
  }
}
