import { AllowedMetaAccount } from '../../../../domain/usecases/integrations/add-meta-info'

export interface LoadAllowedMetaAccountsRepository {
  loadByUser (idUser: number): Promise<AllowedMetaAccount[]>
}
