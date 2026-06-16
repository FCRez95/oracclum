/* eslint-disable no-undef */
import { ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadOneSiteSummaryController } from './load-one-site-summary-controller'
import { LoadOneSiteSummary } from '../../../domain/usecases/campaign/load-one-site-summary'
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

const makeLoadOneSiteSummary = (): LoadOneSiteSummary => {
  class LoadOneSiteSummaryStub implements LoadOneSiteSummary {
    async loadOne(idUser: number, id_campaign: number, id_ads_taboola: number, days: number): Promise<OptimizationData | null> {
      return new Promise(resolve => resolve(makeFakeOptimizationData()))
    }
    async loadOneByDateRange(idUser: number, id_campaign: number, id_ads_taboola: number, dateRange: { startDate: string; endDate: string }): Promise<OptimizationData | null> {
      return new Promise(resolve => resolve(makeFakeOptimizationData()))
    }
  }
  return new LoadOneSiteSummaryStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: 1,
    id_ads_taboola: 1,
    id_site: 1,
    days: 0
  },
  body: {
    idUser: 1,
  }
})

interface SutTypes {
  sut: LoadOneSiteSummaryController,
  loadOneSiteSummarySutb: LoadOneSiteSummary,
}

const makeSut = (): SutTypes => {
  const loadOneSiteSummarySutb = makeLoadOneSiteSummary()
  const sut = new LoadOneSiteSummaryController(loadOneSiteSummarySutb)
  return {
    sut,
    loadOneSiteSummarySutb
  }
}

describe('LoadAdsSummaryController', () => {
  test('Should call LoadAllAdsSummary with correct values', async () => {
    const { sut, loadOneSiteSummarySutb } = makeSut()
    const authSpy = jest.spyOn(loadOneSiteSummarySutb, 'loadOne')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 1, 1, 0)
  })

  test('Should return 500 if LoadAllAdsSummary throws', async () => {
    const { sut, loadOneSiteSummarySutb } = makeSut()
    jest.spyOn(loadOneSiteSummarySutb, 'loadOne').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if LoadFunnelsByTime returns null', async () => {
    const { sut, loadOneSiteSummarySutb } = makeSut()
    jest.spyOn(loadOneSiteSummarySutb, 'loadOne').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadAllAdsSummary returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeOptimizationData()))
  })

  test('Should return 504 if taboola takes to long to answer', async () => {
    const { sut, loadOneSiteSummarySutb } = makeSut()
    jest.spyOn(loadOneSiteSummarySutb, 'loadOne').mockImplementationOnce(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  })

  test('Should return 429 if LoadAllAdsSummary returns a Taboola too many requests', async () => {
    const { sut, loadOneSiteSummarySutb } = makeSut()
    jest.spyOn(loadOneSiteSummarySutb, 'loadOne').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola too many requests')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(429)
  })

})
