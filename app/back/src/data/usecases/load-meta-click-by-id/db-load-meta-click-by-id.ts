import { LoadMetaClickById } from "../../../domain/usecases/clicks/load-meta-click-by-id"
import { MetaClickModel } from "../../../domain/models/meta-click"
import { LoadMetaClickByIdRepository } from "../../protocols/db/clicks-meta/load-click-by-id-repository"

export class DbLoadMetaClickById implements LoadMetaClickById {
  private readonly loadMetaClickByIdRepository: LoadMetaClickByIdRepository

  constructor (loadMetaClickByIdRepository: LoadMetaClickByIdRepository) {
    this.loadMetaClickByIdRepository = loadMetaClickByIdRepository
  }

  async load (idClick: string): Promise<MetaClickModel | null> {
    return await this.loadMetaClickByIdRepository.loadByIdClick(idClick)
  }
}
