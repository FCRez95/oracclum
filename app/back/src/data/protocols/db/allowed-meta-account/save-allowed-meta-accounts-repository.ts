import { AllowedMetaAccount } from "../../../../domain/usecases/integrations/add-meta-info"

export interface SaveAllowedMetaAccountsRepository {
  save (idUser: number, accounts: AllowedMetaAccount[]): Promise<void>
}
