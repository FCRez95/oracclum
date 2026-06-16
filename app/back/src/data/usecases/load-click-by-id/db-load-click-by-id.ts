import { ClickModel } from '../../../domain/models/click'
import { LoadClickById } from '../../../domain/usecases/clicks/load-click-by-id'
import { LoadClickByIdRepository } from '../../protocols/db/clicks-taboola/load-click-by-id-repository'

export class DbLoadClickById implements LoadClickById {
  private readonly loadClickByIdRepository: LoadClickByIdRepository

  constructor (loadClickByIdRepository: LoadClickByIdRepository) {
    this.loadClickByIdRepository = loadClickByIdRepository
  }

  async load (idClick: string): Promise<ClickModel | null> {
    const click = await this.loadClickByIdRepository.loadByIdClick(idClick)
    return click
  }
}
