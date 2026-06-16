/* eslint-disable no-undef */
import { DbLoadAllMetaAdSets } from './db-load-all-meta-adsets'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { InternalOptimizationData, LoadAdsetOptimizationDataRepository } from '../../protocols/db/clicks-meta/load-adset-optimization-data-repository'
import { CampaignModel } from '../../../domain/models/campaign'
import { MetaAdSetInfo, GetMetaAdSetInfo } from '../../protocols/external-apis/external-info'

const makeFakeCampaign = () => ({
  id: 2,
  id_user: 1,
  name: 'any_name',
  link: 'any_link',
  ad_provider: 'any_provider',
  total_checkout: 0,
  total_clicks: 0,
  total_sales: 0,
  revenue: 0,
  expenses: 0,
  click_auth: 'any_token',
  external_id: '1'
})


const makeFakeAds = () => ({
  id_ad_set: 1,
  name: 'any_title',
  summary: makeFakeOptimizeData()
})

const makeFakeOptimizeData = () => ({
  revenue: 0,
  expenses: 1,
  cpc: 0.4,
  vcpm: 0.9,
  cpa: 0,
  vctr: 20,
  clicks: 1,
  checkout: 0,
  sales: 0,
  roas: 0
})

const makeFakeExternalInfo = () => ({
  id_meta: 1,
  name: 'any_title',
  expenses: 1,
  clicks: 1,
  vcpm: 0.9,
  vctr: 20,
  cpc: 0.4
})


const makeLoadCampaignRepository = (): LoadCampaignRepository => {
  class LoadCampaignRepositoryStub implements LoadCampaignRepository {
    async loadCampaign (id_campaign:number): Promise<CampaignModel> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
  }
  return new LoadCampaignRepositoryStub()
}

const makeLoadAdSetOptimizationDataRepository = (): LoadAdsetOptimizationDataRepository => {
  class LoadAdSetOptimizationDataRepositoryStub implements LoadAdsetOptimizationDataRepository {
    async loadAdsetOptData(): Promise<InternalOptimizationData> {
      return new Promise(resolve => resolve(makeFakeOptimizeData()))
    }
  }
  return new LoadAdSetOptimizationDataRepositoryStub()
}

const makeGetMetaAdSetInfo = (): GetMetaAdSetInfo => {
  class GetMetaAdSetInfoStub implements GetMetaAdSetInfo {
    async getMetaAdSetsInfo(id_user: number, id_campaign_meta: number, days: number): Promise<MetaAdSetInfo[]> {
      return new Promise(resolve => resolve([makeFakeExternalInfo()]))
    }
  }
  return new GetMetaAdSetInfoStub()
}

interface SutTypes {
  sut: DbLoadAllMetaAdSets
  loadCampaignRepositoryStub: LoadCampaignRepository
  loadAdSetOptimizationDataRepositoryStub: LoadAdsetOptimizationDataRepository
  getMetaAdSetsInfoStub: GetMetaAdSetInfo
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const loadAdSetOptimizationDataRepositoryStub = makeLoadAdSetOptimizationDataRepository()
  const getMetaAdSetsInfoStub = makeGetMetaAdSetInfo()

  const sut = new DbLoadAllMetaAdSets(loadCampaignRepositoryStub, loadAdSetOptimizationDataRepositoryStub, getMetaAdSetsInfoStub)
  return {
    sut,
    loadCampaignRepositoryStub,
    loadAdSetOptimizationDataRepositoryStub,
    getMetaAdSetsInfoStub
  }
}

describe('DbLoadAllMetaAdSets usecase', () => {
  describe('LoadCampaignRepository', () => {
    test('Should call LoadCampaignRepository with correct values', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign')
      await sut.loadAll(1, 1, 1)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(1)
    })

    test('Should throw if LoadCampaignRepository throws', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadAll(1,1,1)
      await expect(promise).rejects.toThrow()
    })

    test('Should return null if LoadCampaignRepository returns null', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const adsSummary = await sut.loadAll(1,1,1)
      expect(adsSummary).toBeNull()
    })
  })

  describe('campaign.external_id', () => {
    test('Should return empty array if campaign has no external_id', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise(resolve => resolve({
        ...makeFakeCampaign(),
        external_id: undefined
      })))
      const campaign = await sut.loadAll(1,2,1)
      expect(campaign).toStrictEqual([])
    })
  })

  describe('LoadAdsetOptimizationDataRepository', () => {
    test('Should call LoadAdsetOptimizationDataRepository with correct values', async () => {
      const { sut, loadAdSetOptimizationDataRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadAdSetOptimizationDataRepositoryStub, 'loadAdsetOptData')
      await sut.loadAll(1,1,1)
      expect(loadSpy).toHaveBeenCalledWith(makeFakeAds().id_ad_set, 1)
    })

    test('Should throw if LoadAdsetOptimizationDataRepository throws', async () => {
      const { sut, loadAdSetOptimizationDataRepositoryStub } = makeSut()
      jest.spyOn(loadAdSetOptimizationDataRepositoryStub, 'loadAdsetOptData').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadAll(1,1,1)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('GetMetaAdSetInfo', () => {
    test('Should call GetMetaAdSetInfo with correct values', async () => {
      const { sut, getMetaAdSetsInfoStub } = makeSut()
      const loadSpy = jest.spyOn(getMetaAdSetsInfoStub, 'getMetaAdSetsInfo')
      await sut.loadAll(1,2,1)
      expect(loadSpy).toHaveBeenCalledWith(1, 1, 1)
    })

    test('Should throw if GetMetaAdSetInfo throws', async () => {
      const { sut, getMetaAdSetsInfoStub } = makeSut()
      jest.spyOn(getMetaAdSetsInfoStub, 'getMetaAdSetsInfo').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadAll(1,2,1)
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return a MetaAdSetModel[] on success', async () => {
    const { sut } = makeSut()
    const summaryAds = await sut.loadAll(1,1,1)
    expect(summaryAds).toEqual([makeFakeAds()])
  })
})
