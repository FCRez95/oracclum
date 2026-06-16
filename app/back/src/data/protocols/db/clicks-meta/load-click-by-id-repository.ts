import { MetaClickModel } from "../../../../domain/models/meta-click"

export interface LoadMetaClickByIdRepository {
  loadByIdClick(idClick: string): Promise<MetaClickModel | null>
}
