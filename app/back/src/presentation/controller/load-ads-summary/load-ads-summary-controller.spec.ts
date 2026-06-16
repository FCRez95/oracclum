/* eslint-disable no-undef */
import { ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadAdsSummaryController } from './load-ads-summary-controller'
import { LoadAllAdsSummary } from '../../../domain/usecases/ads/load-all-ads-summary'
import { AdsSummaryModel } from '../../../domain/models/ads-summary'
import { HttpRequest } from '../../protocols'

const makeFakeAddSummary = () => ({
  id_ads_taboola: 1,
  title: 'any_title',
  thumbnail: 'any_thumb',
  summary: {
    revenue: 1,
    expenses: 1,
    cpc: 1,
    vcpm: 1,
    cpa: 1,
    vctr: 1,
    clicks: 1,
    checkout: 1,
    sales: 1,
    roas: 1
  }
})

const makeLoadAllAdsSummary = (): LoadAllAdsSummary => {
  class LoadAllAdsSummaryStub implements LoadAllAdsSummary {
    async loadAll(idUser: number, id_campaign: number, days: number): Promise<AdsSummaryModel[] | null> {
      return new Promise(resolve => resolve([makeFakeAddSummary()]))
    }
  }
  return new LoadAllAdsSummaryStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: 1,
    days: 0
  },
  body: {
    idUser: 1,
  }
})

interface SutTypes {
  sut: LoadAdsSummaryController,
  loadAllAdsSummaryStub: LoadAllAdsSummary,
}

const makeSut = (): SutTypes => {
  const loadAllAdsSummaryStub = makeLoadAllAdsSummary()
  const sut = new LoadAdsSummaryController(loadAllAdsSummaryStub)
  return {
    sut,
    loadAllAdsSummaryStub
  }
}

describe('LoadAdsSummaryController', () => {
  test('Should call LoadAllAdsSummary with correct values', async () => {
    const { sut, loadAllAdsSummaryStub } = makeSut()
    const authSpy = jest.spyOn(loadAllAdsSummaryStub, 'loadAll')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 1, 0)
  })

  test('Should return 500 if LoadAllAdsSummary throws', async () => {
    const { sut, loadAllAdsSummaryStub } = makeSut()
    jest.spyOn(loadAllAdsSummaryStub, 'loadAll').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if LoadFunnelsByTime returns null', async () => {
    const { sut, loadAllAdsSummaryStub } = makeSut()
    jest.spyOn(loadAllAdsSummaryStub, 'loadAll').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadAllAdsSummary returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok([makeFakeAddSummary()]))
  })

  test('Should return 429 if taboola recive too many requests', async () => {
    const { sut, loadAllAdsSummaryStub } = makeSut()

    jest.spyOn(loadAllAdsSummaryStub, 'loadAll').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola too many requests')))
    })

  const httpResponse = await sut.handle(makeFakeRequest())
  expect(httpResponse.statusCode).toBe(429)

  })

  test('Should return 504 if taboola takes to long to answer', async () => {
    const { sut, loadAllAdsSummaryStub } = makeSut()

    jest.spyOn(loadAllAdsSummaryStub, 'loadAll').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })

    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  })  
})
