import { LoadEnrichedUserData } from '../../../domain/usecases/account/load-enriched-user-data'
import { EnrichedAccountModel } from '../../../domain/models/enriched-account'
import { LoadEnrichedAccountByIdRepository } from '../../protocols/db/account/load-enriched-account-by-id-repository'

export class DbLoadEnrichedUserData implements LoadEnrichedUserData {
  constructor (private readonly loadEnrichedAccountByIdRepository: LoadEnrichedAccountByIdRepository) {}

  async load (id: number): Promise<EnrichedAccountModel> {
    return this.loadEnrichedAccountByIdRepository.loadEnrichedAccountById(id)
  }
}
