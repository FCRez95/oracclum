import { AddMetaInfo, AllowedMetaAccount } from "../../../domain/usecases/integrations/add-meta-info";
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository";
import { SaveAllowedMetaAccountsRepository } from "../../protocols/db/allowed-meta-account/save-allowed-meta-accounts-repository";
import { LoadUsedMetaAccountsByIdsRepository } from "../../protocols/db/used-meta-account/load-used-meta-accounts-by-ids-repository";
import { SaveUsedMetaAccountsRepository } from "../../protocols/db/used-meta-account/save-used-meta-accounts-repository";
import { ProviderAccountInUseError } from "../../../presentation/errors";

export class DbAddMetaInfo implements AddMetaInfo {
  private readonly updateByIdRepository: UpdateByIdRepository
  private readonly saveAllowedMetaAccountsRepository: SaveAllowedMetaAccountsRepository
  private readonly loadUsedMetaAccountsByIdsRepository: LoadUsedMetaAccountsByIdsRepository
  private readonly saveUsedMetaAccountsRepository: SaveUsedMetaAccountsRepository

  constructor (
    updateByIdRepository: UpdateByIdRepository,
    saveAllowedMetaAccountsRepository: SaveAllowedMetaAccountsRepository,
    loadUsedMetaAccountsByIdsRepository: LoadUsedMetaAccountsByIdsRepository,
    saveUsedMetaAccountsRepository: SaveUsedMetaAccountsRepository
  ) {
    this.updateByIdRepository = updateByIdRepository
    this.saveAllowedMetaAccountsRepository = saveAllowedMetaAccountsRepository
    this.loadUsedMetaAccountsByIdsRepository = loadUsedMetaAccountsByIdsRepository
    this.saveUsedMetaAccountsRepository = saveUsedMetaAccountsRepository
  }

  async addInfo(idUser: number, metaAccessToken: string, allowedAccounts: AllowedMetaAccount[]): Promise<void> {
    const metaIds = allowedAccounts.map(account => account.account_id)
    const usedMetaAccounts = await this.loadUsedMetaAccountsByIdsRepository.loadByMetaIds(metaIds)
    const hasConflict = usedMetaAccounts.some(account => account.id_user !== idUser)

    if (hasConflict) {
      await this.updateByIdRepository.updateById(idUser, 'allow_clicks', '0')
      throw new ProviderAccountInUseError()
    }

    await Promise.all([
      this.updateByIdRepository.updateById(idUser, 'meta_access_token', metaAccessToken),
      this.saveAllowedMetaAccountsRepository.save(idUser, allowedAccounts),
      this.saveUsedMetaAccountsRepository.saveMany(idUser, metaIds.filter(metaId => !usedMetaAccounts.some(account => account.meta_id === metaId)))
    ])
  }
}
