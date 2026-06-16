import { LoadMetaInfo, LoadMetaInfoResult } from '../../../domain/usecases/integrations/load-meta-info'
import { LoadAccountByIdRepository } from '../../protocols/db/account/load-account-by-id-repository'
import { LoadAllowedMetaAccountsRepository } from '../../protocols/db/allowed-meta-account/load-allowed-meta-accounts-repository'

export class DbLoadMetaInfo implements LoadMetaInfo {
  private readonly loadAccountByIdRepository: LoadAccountByIdRepository
  private readonly loadAllowedMetaAccountsRepository: LoadAllowedMetaAccountsRepository

  constructor (loadAccountByIdRepository: LoadAccountByIdRepository, loadAllowedMetaAccountsRepository: LoadAllowedMetaAccountsRepository) {
    this.loadAccountByIdRepository = loadAccountByIdRepository
    this.loadAllowedMetaAccountsRepository = loadAllowedMetaAccountsRepository
  }

  async load (idUser: number): Promise<LoadMetaInfoResult | null> {
    const account = await this.loadAccountByIdRepository.loadById(idUser)
    if (!account?.meta_access_token) {
      return null
    }
    const allowedAccounts = await this.loadAllowedMetaAccountsRepository.loadByUser(idUser)
    return {
      access_token: account.meta_access_token,
      allowed_accounts: allowedAccounts
    }
  }
}
