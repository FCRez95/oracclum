import { DisconnectMeta } from "../../../domain/usecases/integrations/disconnect-meta"
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { DeleteAllowedMetaAccountsRepository } from "../../protocols/db/allowed-meta-account/delete-allowed-meta-accounts-repository"

export class DbDisconnectMeta implements DisconnectMeta {
  private readonly updateByIdRepository: UpdateByIdRepository
  private readonly deleteAllowedMetaAccountsRepository: DeleteAllowedMetaAccountsRepository

  constructor (updateByIdRepository: UpdateByIdRepository, deleteAllowedMetaAccountsRepository: DeleteAllowedMetaAccountsRepository) {
    this.updateByIdRepository = updateByIdRepository
    this.deleteAllowedMetaAccountsRepository = deleteAllowedMetaAccountsRepository
  }

  async disconnect (idUser: number): Promise<void> {
    await Promise.all([
      this.updateByIdRepository.updateById(idUser, 'meta_access_token', null),
      this.deleteAllowedMetaAccountsRepository.deleteByUser(idUser)
    ])
  }
}
