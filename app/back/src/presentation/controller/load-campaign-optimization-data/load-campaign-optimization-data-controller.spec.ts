/* eslint-disable no-undef */
import { CampaignModel } from '../../../domain/models/campaign'
import { MissingParamError } from '../../errors'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadCampaignOptimizationDataController } from './load-campaign-optimization-data-controller'
import { HttpRequest, GetCampaignOptimizationData, OptimizationData } from './load-campaign-optimization-data-controller-protocols'

const makeFakeCampaign = () => ({
  id: 1,
  id_user: 1,
  name: 'any_name',
  link: 'any_link',
  ad_provider: 'any_provider',
  total_clicks: 0,
  total_sales: 0,
  expenses: 0,
  total_checkout: 0,
  revenue: 0,
  click_auth: 'any_token',
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

const makeGetCampaignOptimzatioData = (): GetCampaignOptimizationData => {
  class GetCampaignOptimizationDataStub implements GetCampaignOptimizationData {
    async get (): Promise<CampaignModel | null> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
  }
  return new GetCampaignOptimizationDataStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: 1,
    days: 0
  },
  body: {
    idUser: 1
  }
})

interface SutTypes {
  sut: LoadCampaignOptimizationDataController,
  getCampaignOptimizationDataStub: GetCampaignOptimizationData,
}

const makeSut = (): SutTypes => {
  const getCampaignOptimizationDataStub = makeGetCampaignOptimzatioData()
  const sut = new LoadCampaignOptimizationDataController(getCampaignOptimizationDataStub)
  return {
    sut,
    getCampaignOptimizationDataStub
  }
}

describe('LoadCampaignOptimizationDataController', () => {
  test('Should call GetCampaignOptimizationData with correct values', async () => {
    const { sut, getCampaignOptimizationDataStub } = makeSut()
    const getSpy = jest.spyOn(getCampaignOptimizationDataStub, 'get')
    await sut.handle(makeFakeRequest())
    expect(getSpy).toHaveBeenCalledWith(1, 1, 0)
      
  })

  test('Should return 500 if GetCampaignOptimizationData throws', async () => {
    const { sut, getCampaignOptimizationDataStub } = makeSut()
    jest.spyOn(getCampaignOptimizationDataStub, 'get').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 if GetCampaignOptimizationData returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeCampaign()))
  })

  test('Should return 429 if GetCampaignOptimizationData returns a Taboola too many requests', async () => {
    const { sut, getCampaignOptimizationDataStub } = makeSut()
    jest.spyOn(getCampaignOptimizationDataStub, 'get').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola too many requests')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(429)
  })

  test('Should return 504 if taboola takes to long to answer', async () => {
    const { sut, getCampaignOptimizationDataStub } = makeSut()
    jest.spyOn(getCampaignOptimizationDataStub, 'get').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  })
})
