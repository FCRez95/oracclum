/* eslint-disable no-undef */
import { DbLoadAllAdsSummary } from './db-load-all-ads-summary'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { LoadOptimizationDataRepository, OptimizationDataByAd } from '../../protocols/db/clicks-taboola/load-optimization-data-repository'
import { CampaignModel } from '../../../domain/models/campaign'
import { OptimizationData } from '../../../domain/models/optimization-data'
import { AdsSummaryModel } from '../../../domain/models/ads-summary'
import { ExternalAdInfo, ExternalInfo, GetExternalAdsInfo } from '../../protocols/external-apis/external-info'
import { GetIdCampaignTaboolaRepository } from '../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository'

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
  click_auth: 'any_token'
})


const makeFakeAds = () => ({
  id_ads_taboola: 1,
  title: 'any_title',
  thumbnail: 'thumb',
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

const makeFakeInternalOptimizationData = () => ({
  revenue: 0,
  sales: 0,
  checkout: 0,
})

const makeFakeExternalInfo = () => ({
  id_taboola: 1,
  title: 'any_title',
  thumbnail: 'thumb',
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

const makeGetIdCampaignTaboolaRepository = (): GetIdCampaignTaboolaRepository => {
  class GetIdCampaignTaboolaRepositoryStub implements GetIdCampaignTaboolaRepository {
    async getTaboolaId (id_campaign:number): Promise<number> {
      return new Promise(resolve => resolve(1))
    }

    async getTaboolaIds(id_campaigns: number[]): Promise<Array<{ id_campaign: number; id_campaign_taboola: number | string }>> {
      return Promise.resolve([{ id_campaign: 2, id_campaign_taboola: 1 }])
    }
  }
  return new GetIdCampaignTaboolaRepositoryStub()
}

const makeLoadOptimizationDataRepository = (): LoadOptimizationDataRepository => {
  class LoadOptimizationDataRepositoryStub implements LoadOptimizationDataRepository {
    async load(): Promise<OptimizationData> {
      return new Promise(resolve => resolve(makeFakeOptimizeData()))
    }

    async loadByDateRange(): Promise<OptimizationData> {
      return new Promise(resolve => resolve(makeFakeOptimizeData()))
    }

    async loadAdsSummariesByIds(): Promise<OptimizationDataByAd[]> {
      return Promise.resolve([{ id_ads_taboola: 1, ...makeFakeInternalOptimizationData() }])
    }

    async loadAdsSummariesByIdsByDateRange(): Promise<OptimizationDataByAd[]> {
      return Promise.resolve([{ id_ads_taboola: 1, ...makeFakeInternalOptimizationData() }])
    }

    async loadSitesSummariesByCampaignAndIds(): Promise<any[]> {
      return Promise.resolve([])
    }

    async loadSitesSummariesByCampaignAndIdsByDateRange(): Promise<any[]> {
      return Promise.resolve([])
    }
  }
  return new LoadOptimizationDataRepositoryStub()
}

const makeGetExternalInfo = (): GetExternalAdsInfo => {
  class GetExternalAdsInfoStub implements GetExternalAdsInfo {
    async getExternalAdsInfo(id_user: number, id_campaign_taboola: number, days: number): Promise<ExternalAdInfo[]> {
      return new Promise(resolve => resolve([makeFakeExternalInfo()]))
    }

    async getExternalAdsInfoByDateRange(id_user: number, id_campaign_taboola: number): Promise<ExternalAdInfo[]> {
      return new Promise(resolve => resolve([makeFakeExternalInfo()]))
    }
  }
  return new GetExternalAdsInfoStub()
}

interface SutTypes {
  sut: DbLoadAllAdsSummary
  loadCampaignRepositoryStub: LoadCampaignRepository
  getIdCampaignTaboolaRepositoryStub: GetIdCampaignTaboolaRepository
  loadOptimizationDataRepositoryStub: LoadOptimizationDataRepository
  getExternalAdsInfoStub: GetExternalAdsInfo
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const getIdCampaignTaboolaRepositoryStub = makeGetIdCampaignTaboolaRepository()
  const loadOptimizationDataRepositoryStub = makeLoadOptimizationDataRepository()
  const getExternalAdsInfoStub = makeGetExternalInfo()

  const sut = new DbLoadAllAdsSummary(loadCampaignRepositoryStub, getIdCampaignTaboolaRepositoryStub, loadOptimizationDataRepositoryStub, getExternalAdsInfoStub)
  return {
    sut,
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getExternalAdsInfoStub
  }
}

describe('DbLoadAllAdsSummary usecase', () => {
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

  describe('GetIdCampaignTaboolaRepository', () => {
    test('Should call GetIdCampaignTaboolaRepository with correct values', async () => {
      const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(getIdCampaignTaboolaRepositoryStub, 'getTaboolaId')
      await sut.loadAll(1, 2, 1)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(2)
    })

    test('Should throw if GetIdCampaignTaboolaRepository throws', async () => {
      const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut()
      jest.spyOn(getIdCampaignTaboolaRepositoryStub, 'getTaboolaId').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadAll(1,2,1)
      await expect(promise).rejects.toThrow()
    })

    test('Should return campaign with zeroed summary data if GetIdCampaignTaboolaRepository returns null', async () => {
      const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut()
      jest.spyOn(getIdCampaignTaboolaRepositoryStub, 'getTaboolaId').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const campaign = await sut.loadAll(1,2,1)
      expect(campaign).toStrictEqual([])
    })
  })

  describe('LoadOptimizationDataRepository', () => {
    test('Should call LoadOptimizationDataRepository with correct values', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadOptimizationDataRepositoryStub, 'loadAdsSummariesByIds')
      await sut.loadAll(1,1,1)
      expect(loadSpy).toHaveBeenCalledWith(1, [makeFakeAds().id_ads_taboola])
    })

    test('Should throw if LoadAllAdsRepository throws', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      jest.spyOn(loadOptimizationDataRepositoryStub, 'loadAdsSummariesByIds').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadAll(1,1,1)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('GetExternalAdsInfo', () => {
    test('Should call GetExternalAdsInfo with correct values', async () => {
      const { sut, getExternalAdsInfoStub } = makeSut()
      const loadSpy = jest.spyOn(getExternalAdsInfoStub, 'getExternalAdsInfo')
      await sut.loadAll(1,2,1)
      expect(loadSpy).toHaveBeenCalledWith(1, 1, 1)
    })

    test('Should throw if GetExternalInfo throws', async () => {
      const { sut, getExternalAdsInfoStub } = makeSut()
      jest.spyOn(getExternalAdsInfoStub, 'getExternalAdsInfo').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadAll(1,2,1)
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return a AdsSummaryModel[] on success', async () => {
    const { sut } = makeSut()
    const summaryAds = await sut.loadAll(1,1,1)
    expect(summaryAds).toEqual([makeFakeAds()])
  })
})