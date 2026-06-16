import { DeleteAccount } from "../../../domain/usecases/account/delete-account";
import { DeleteAccountRepository } from "../../protocols/db/account/delete-account-repository";
import { LoadAccountByIdRepository } from "../../protocols/db/account/load-account-by-id-repository";

export class DbDeleteAccount implements DeleteAccount {
  private readonly loadAccountByIdRepository: LoadAccountByIdRepository
  private readonly deleteAccountRepository: DeleteAccountRepository

  constructor (loadAccountByIdRepository: LoadAccountByIdRepository, deleteAccountRepository: DeleteAccountRepository) {
    this.loadAccountByIdRepository = loadAccountByIdRepository
    this.deleteAccountRepository = deleteAccountRepository
  }

  async delete (idUser: number): Promise<void | null> {
    const account = await this.loadAccountByIdRepository.loadById(idUser)
    if (!account) return null

    await this.deleteAccountRepository.deleteAccount(idUser)
  }
}
