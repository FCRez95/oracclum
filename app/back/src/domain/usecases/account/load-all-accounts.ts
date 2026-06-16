import { EnrichedAccountModel } from "../../models/enriched-account";

export interface LoadAllAccounts {
  loadAll(): Promise<EnrichedAccountModel[]>
}