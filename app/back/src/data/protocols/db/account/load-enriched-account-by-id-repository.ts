import { EnrichedAccountModel } from '../../../../domain/models/enriched-account'

export interface LoadEnrichedAccountByIdRepository {
  loadEnrichedAccountById(id: number): Promise<EnrichedAccountModel>
}
