import { EnrichedAccountModel } from "../../../../domain/models/enriched-account";

export interface LoadAllAccountsRepository {
  loadAccounts(): Promise<EnrichedAccountModel[]>
}