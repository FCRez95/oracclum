/* eslint-disable no-undef */
import { ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadOneAdSummaryController } from './load-one-summary-controller'
import { LoadOneAdSummary } from '../../../domain/usecases/ads/load-one-add-summary'
import { AdsSummaryModel } from '../../../domain/models/ads-summary'
import { HttpRequest } from '../../protocols'
import { OptimizationData } from '../../../domain/models/optimization-data'

const makeFakeOptimizationData= () => ({
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
})

const makeLoadOneAdSummary = (): LoadOneAdSummary => {
  class LoadOneAdSummaryStub implements LoadOneAdSummary {
    async loadOne(idUser: number, id_campaign: number, id_ads_taboola: number, days: number): Promise<OptimizationData | null> {
      return new Promise(resolve => resolve(makeFakeOptimizationData()))
    }
  }
  return new LoadOneAdSummaryStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: 1,
    id_ads_taboola: 1,
    days: 0
  },
  body: {
    idUser: 1,
  }
})

interface SutTypes {
  sut: LoadOneAdSummaryController,
  loadOneAdSummaryStub: LoadOneAdSummary,
}

const makeSut = (): SutTypes => {
  const loadOneAdSummaryStub = makeLoadOneAdSummary()
  const sut = new LoadOneAdSummaryController(loadOneAdSummaryStub)
  return {
    sut,
    loadOneAdSummaryStub
  }
}

describe('LoadAdsSummaryController', () => {
  test('Should call LoadAllAdsSummary with correct values', async () => {
    const { sut, loadOneAdSummaryStub } = makeSut()
    const authSpy = jest.spyOn(loadOneAdSummaryStub, 'loadOne')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 1, 1, 0)
  })

  test('Should return 500 if LoadAllAdsSummary throws', async () => {
    const { sut, loadOneAdSummaryStub } = makeSut()
    jest.spyOn(loadOneAdSummaryStub, 'loadOne').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if LoadFunnelsByTime returns null', async () => {
    const { sut, loadOneAdSummaryStub } = makeSut()
    jest.spyOn(loadOneAdSummaryStub, 'loadOne').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadAllAdsSummary returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeOptimizationData()))
  })

  test('Should return 504 if taboola takes to long to answer', async () => {
    const { sut, loadOneAdSummaryStub } = makeSut()
    jest.spyOn(loadOneAdSummaryStub, 'loadOne').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  })

  test('Should return 429 if LoadAllAdsSummary returns a Taboola too many requests', async () => {
    const { sut, loadOneAdSummaryStub } = makeSut()
    jest.spyOn(loadOneAdSummaryStub, 'loadOne').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola too many requests')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(429)
  })
})
