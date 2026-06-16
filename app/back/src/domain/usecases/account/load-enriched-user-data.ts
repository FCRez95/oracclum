import { EnrichedAccountModel } from '../../models/enriched-account'

export interface LoadEnrichedUserData {
  load(id: number): Promise<EnrichedAccountModel>
}
