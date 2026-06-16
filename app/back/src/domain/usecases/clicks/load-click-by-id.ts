import { ClickModel } from '../../models/click'

export interface LoadClickById {
  load(idClick: string): Promise<ClickModel | null>
}
