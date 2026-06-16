/* eslint-disable no-undef */
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadCampaignSitesSummaryController } from './load-campaign-sites-summary-controller'
import { LoadCampaignSitesSummary } from '../../../domain/usecases/campaign/load-campaign-sites-summary'
import { AdsSummaryModel } from '../../../domain/models/ads-summary'
import { HttpRequest } from '../../protocols'
import { CampaignSiteSummaryModel } from '../../../domain/models/campaign-site-summary'

const makeFakeCampaignSiteSummary = () => ({
  id_campaign: 1,
  id_campaign_taboola: 1,
  id_site: 'any_id',
  site: 'any_site',
  target: 'any_target',
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

const makeLoadCampaignSitesSummary = (): LoadCampaignSitesSummary => {
  class LoadCampaignSitesSummaryStub implements LoadCampaignSitesSummary {
    async loadAllSites(idUser: number, id_ads_taboola: number, days: number): Promise<CampaignSiteSummaryModel[] | null> {
      return new Promise(resolve => resolve([makeFakeCampaignSiteSummary()]))
    }
    async loadAllSitesByDateRange(idUser: number, id_ads_taboola: number, dateRange: { startDate: string; endDate: string }): Promise<CampaignSiteSummaryModel[] | null> {
      return new Promise(resolve => resolve([makeFakeCampaignSiteSummary()]))
    }
  }
  return new LoadCampaignSitesSummaryStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_ads_taboola: 1,
    id_campaign: 1,
    days: 0
  },
  body: {
    idUser: 1,
  }
})

interface SutTypes {
  sut: LoadCampaignSitesSummaryController,
  loadCampaignSitesSummaryStub: LoadCampaignSitesSummary,
}

const makeSut = (): SutTypes => {
  const loadCampaignSitesSummaryStub = makeLoadCampaignSitesSummary()
  const sut = new LoadCampaignSitesSummaryController(loadCampaignSitesSummaryStub)
  return {
    sut,
    loadCampaignSitesSummaryStub
  }
}

describe('LoadAdsSummaryController', () => {
  test('Should call LoadAdSitesSummary with correct values', async () => {
    const { sut, loadCampaignSitesSummaryStub } = makeSut()
    const authSpy = jest.spyOn(loadCampaignSitesSummaryStub, 'loadAllSites')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 1, 0)
  })

  test('Should return 500 if LoadAdSitesSummary throws', async () => {
    const { sut, loadCampaignSitesSummaryStub } = makeSut()
    jest.spyOn(loadCampaignSitesSummaryStub, 'loadAllSites').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if LoadAdSitesSummary returns null', async () => {
    const { sut, loadCampaignSitesSummaryStub } = makeSut()
    jest.spyOn(loadCampaignSitesSummaryStub, 'loadAllSites').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadAdSitesSummary returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok([makeFakeCampaignSiteSummary()]))
  })

  test('Should return 504 if taboola takes to long to answer', async () => {
    const { sut, loadCampaignSitesSummaryStub } = makeSut()
    jest.spyOn(loadCampaignSitesSummaryStub, 'loadAllSites').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  })

  test('Should return 429 if LoadAdSitesSummary returns a Taboola too many requests', async () => {
    const { sut, loadCampaignSitesSummaryStub } = makeSut()
    jest.spyOn(loadCampaignSitesSummaryStub, 'loadAllSites').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola too many requests')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(429)
  })
})
