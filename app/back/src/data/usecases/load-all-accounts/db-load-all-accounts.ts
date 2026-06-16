import { LoadAllAccounts } from "../../../domain/usecases/account/load-all-accounts";
import { LoadAllAccountsRepository } from "../../protocols/db/account/load-all-accounts-repository";
import { EnrichedAccountModel } from "../../../domain/models/enriched-account";

export class DbLoadAllAccounts implements LoadAllAccounts {
  private readonly loadAllAccountsRepository: LoadAllAccountsRepository

  constructor (loadAllAccountsRepository: LoadAllAccountsRepository) {
    this.loadAllAccountsRepository = loadAllAccountsRepository
  }

  async loadAll(): Promise<EnrichedAccountModel[]> {
    const allAccounts = await this.loadAllAccountsRepository.loadAccounts()
    return allAccounts
  }
}