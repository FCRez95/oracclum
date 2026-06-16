/* eslint-disable no-undef */
import { MissingParamError } from '../../errors'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadCampaignSummaryController } from './load-campaign-steps-summary-controller'
import { LoadCampaignByTime } from '../../../domain/usecases/campaign/load-campaign-by-time'
import { HttpRequest } from '../../protocols'
import { CampaignStepsSummary } from '../../../domain/models/campaign-summary'

const makeFakeCampaign = () => ({
  id: 1,
  name: 'any_name',
  link: 'any_link',
  total_clicks: 0,
  total_sales: 0,
  revenue: 0,
  expenses: 0,
  total_step_1: 0,
  step_1_views: 0,
  total_step_2: 0,
  step_2_views: 0,
  total_step_3: 0,
  step_3_views: 0,
  total_checkout: 0,
  checkout_views: 0
})

const makeLoadCampaignByTime = (): LoadCampaignByTime => {
  class LoadFunnelsByTimeStub implements LoadCampaignByTime {
    async load (id_campaign: number, idUser: number, days: number): Promise<CampaignStepsSummary | null> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
    async loadByDateRange (id_campaign: number, idUser: number, dateRange: { startDate: string; endDate: string; }): Promise<CampaignStepsSummary | null> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
  }
  return new LoadFunnelsByTimeStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: 1,
    days: 1
  },
  body: {
    idUser: 1
  }
})

interface SutTypes {
  sut: LoadCampaignSummaryController,
  loadCampaignByTimeStub: LoadCampaignByTime,
}

const makeSut = (): SutTypes => {
  const loadCampaignByTimeStub = makeLoadCampaignByTime()
  const sut = new LoadCampaignSummaryController(loadCampaignByTimeStub)
  return {
    sut,
    loadCampaignByTimeStub,
  }
}

describe('Load Funnels By Time Controller', () => {
  test('Should call LoadFunnelsByTime with correct values', async () => {
    const { sut, loadCampaignByTimeStub } = makeSut()
    const loadSpy = jest.spyOn(loadCampaignByTimeStub, 'load')
    await sut.handle(makeFakeRequest())
    expect(loadSpy).toHaveBeenCalledWith(1, 1, 1)
  })

  test('Should return 500 if LoadFunnelsByTime throws', async () => {
    const { sut, loadCampaignByTimeStub } = makeSut()
    jest.spyOn(loadCampaignByTimeStub, 'load').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if LoadFunnelsByTime returns null', async () => {
    const { sut, loadCampaignByTimeStub } = makeSut()
    jest.spyOn(loadCampaignByTimeStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadFunnelsByTime returns a Funnel[]', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeCampaign()))

  })
})
