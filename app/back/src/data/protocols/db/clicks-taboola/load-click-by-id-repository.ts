import { ClickModel } from '../../../../domain/models/click'

export interface LoadClickByIdRepository {
  loadByIdClick(idClick: string): Promise<ClickModel | null>
}
