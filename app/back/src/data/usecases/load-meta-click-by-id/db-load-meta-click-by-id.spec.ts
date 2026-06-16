import { DbLoadMetaClickById } from "./db-load-meta-click-by-id"
import { LoadMetaClickByIdRepository } from "../../protocols/db/clicks-meta/load-click-by-id-repository"
import { MetaClickModel } from "../../../domain/models/meta-click"

const makeLoadMetaClickByIdRepository = (): LoadMetaClickByIdRepository => {
  class LoadMetaClickByIdRepositoryStub implements LoadMetaClickByIdRepository {
    async loadByIdClick (idClick: string): Promise<MetaClickModel | null> {
      return {
        id: 1,
        id_click: idClick,
        id_campaign: 1,
        id_campaign_meta: 'meta_campaign_1',
        id_ad_set: 'ad_set_1',
        id_ad_meta: 'ad_meta_1',
        step_1: 1,
        step_2: 0,
        step_3: 0,
        checkout: 1,
        revenue: 10,
        payment_type: 'pix',
        id_order: 'order_1',
        created_at: new Date('2026-05-04T12:00:00Z')
      }
    }
  }

  return new LoadMetaClickByIdRepositoryStub()
}

type SutTypes = {
  sut: DbLoadMetaClickById
  loadMetaClickByIdRepositoryStub: LoadMetaClickByIdRepository
}

const makeSut = (): SutTypes => {
  const loadMetaClickByIdRepositoryStub = makeLoadMetaClickByIdRepository()
  const sut = new DbLoadMetaClickById(loadMetaClickByIdRepositoryStub)

  return {
    sut,
    loadMetaClickByIdRepositoryStub
  }
}

describe('DbLoadMetaClickById', () => {
  test('Should call repository with correct click id', async () => {
    const { sut, loadMetaClickByIdRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadMetaClickByIdRepositoryStub, 'loadByIdClick')

    await sut.load('any_click')

    expect(loadSpy).toHaveBeenCalledWith('any_click')
  })

  test('Should return meta click on success', async () => {
    const { sut } = makeSut()

    const click = await sut.load('any_click')

    expect(click).toBeTruthy()
    expect(click.id_click).toBe('any_click')
    expect(click.id_campaign_meta).toBe('meta_campaign_1')
  })

  test('Should propagate repository errors', async () => {
    const { sut, loadMetaClickByIdRepositoryStub } = makeSut()
    jest.spyOn(loadMetaClickByIdRepositoryStub, 'loadByIdClick').mockRejectedValueOnce(new Error('db error'))

    await expect(sut.load('any_click')).rejects.toThrow('db error')
  })
})
