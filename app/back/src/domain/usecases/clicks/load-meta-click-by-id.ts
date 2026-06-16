import { MetaClickModel } from "../../models/meta-click"

export interface LoadMetaClickById {
  load(idClick: string): Promise<MetaClickModel | null>
}
