import { LoadMetaClickById } from "../../../domain/usecases/clicks/load-meta-click-by-id"
import { NotFoundError } from "../../errors"
import { badRequest, ok } from "../../helpers/http-helper"
import { HttpRequest } from "../../protocols"
import { LoadMetaClickByIdController } from "./load-meta-click-by-id-controller"

const makeLoadMetaClickById = (): LoadMetaClickById => {
  class LoadMetaClickByIdStub implements LoadMetaClickById {
    async load (idClick: string) {
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

  return new LoadMetaClickByIdStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_click: 'any_click'
  }
})

type SutTypes = {
  sut: LoadMetaClickByIdController
  loadMetaClickByIdStub: LoadMetaClickById
}

const makeSut = (): SutTypes => {
  const loadMetaClickByIdStub = makeLoadMetaClickById()
  const sut = new LoadMetaClickByIdController(loadMetaClickByIdStub)

  return {
    sut,
    loadMetaClickByIdStub
  }
}

describe('LoadMetaClickByIdController', () => {
  test('Should return 400 if id_click is missing', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle({ params: {} })

    expect(httpResponse).toEqual(badRequest(new Error('Missing param: id_click')))
  })

  test('Should call use case with correct click id', async () => {
    const { sut, loadMetaClickByIdStub } = makeSut()
    const loadSpy = jest.spyOn(loadMetaClickByIdStub, 'load')

    await sut.handle(makeFakeRequest())

    expect(loadSpy).toHaveBeenCalledWith('any_click')
  })

  test('Should return 400 when click is not found', async () => {
    const { sut, loadMetaClickByIdStub } = makeSut()
    jest.spyOn(loadMetaClickByIdStub, 'load').mockResolvedValueOnce(null)

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(new NotFoundError('Click')))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({
      id: 1,
      id_click: 'any_click',
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
    }))
  })

  test('Should return 500 if use case throws', async () => {
    const { sut, loadMetaClickByIdStub } = makeSut()
    jest.spyOn(loadMetaClickByIdStub, 'load').mockRejectedValueOnce(new Error('db error'))

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse.statusCode).toBe(500)
  })
})
