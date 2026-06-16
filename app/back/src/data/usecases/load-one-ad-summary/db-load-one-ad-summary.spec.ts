/* eslint-disable no-undef */
import { DbLoadOneAdSummary } from './db-load-one-ad-summary'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { LoadOptimizationDataRepository } from '../../protocols/db/clicks-taboola/load-optimization-data-repository'
import { CampaignModel } from '../../../domain/models/campaign'
import { OptimizationData } from '../../../domain/models/optimization-data'
import { ExternalAdInfo, GetExternalAdInfo } from '../../protocols/external-apis/external-info'
import { GetIdCampaignTaboolaRepository } from '../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository'

const makeFakeCampaign = () => ({
  id: 1,
  id_user: 1,
  name: 'any_name',
  link: 'any_link',
  ad_provider: 'any_provider',
  total_clicks: 0,
  total_sales: 0,
  revenue: 0,
  expenses: 0,
  total_checkout: 0,
  click_auth: 'any_token'
})

const makeFakeOptimizeData = () => ({
  revenue: 0,
  expenses: 1,
  cpc: 0.4,
  vcpm: 0.9,
  cpa: 0,
  vctr: 20,
  clicks: 12,
  checkout: 0,
  sales: 0,
  roas: 0
})

const makeFakeExternalInfo = () => ({
  id_taboola: 1,
  title: 'any_title',
  thumbnail: 'thumb',
  expenses: 1,
  clicks: 12,
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
      return Promise.resolve([{ id_campaign: 1, id_campaign_taboola: 1 }])
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

    async loadAdsSummariesByIds(): Promise<any[]> {
      return Promise.resolve([])
    }

    async loadAdsSummariesByIdsByDateRange(): Promise<any[]> {
      return Promise.resolve([])
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

const makeGetExternalAdInfo = (): GetExternalAdInfo => {
  class GetExternalAdInfoStub implements GetExternalAdInfo {
    async getExternalAdInfo(id_user: number, ids_campaign_taboola: number, days: number): Promise<ExternalAdInfo> {
      return new Promise(resolve => resolve(makeFakeExternalInfo()))
    }

    async getExternalAdInfoByDateRange(id_user: number, ids_campaign_taboola: number, id_ad_taboola: number): Promise<ExternalAdInfo> {
      return new Promise(resolve => resolve(makeFakeExternalInfo()))
    }
  }
  return new GetExternalAdInfoStub()
}

interface SutTypes {
  sut: DbLoadOneAdSummary
  loadCampaignRepositoryStub: LoadCampaignRepository
  getIdCampaignTaboolaRepositoryStub: GetIdCampaignTaboolaRepository
  loadOptimizationDataRepositoryStub: LoadOptimizationDataRepository
  getExternalAdInfoStub: GetExternalAdInfo
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const getIdCampaignTaboolaRepositoryStub = makeGetIdCampaignTaboolaRepository()
  const loadOptimizationDataRepositoryStub = makeLoadOptimizationDataRepository()
  const getExternalAdInfoStub = makeGetExternalAdInfo()

  const sut = new DbLoadOneAdSummary(loadCampaignRepositoryStub, getIdCampaignTaboolaRepositoryStub, loadOptimizationDataRepositoryStub, getExternalAdInfoStub)
  return {
    sut,
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getExternalAdInfoStub
  }
}

describe('DbLoadFunnelsByTime usecase', () => {
  describe('LoadCampaignRepository', () => {
    test('Should call LoadCampaignRepository with correct values', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign')
      await sut.loadOne(1, 1, 1, 1)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(1)
    })

    test('Should throw if LoadCampaignRepository throws', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadOne(1,1,1,1)
      await expect(promise).rejects.toThrow()
    })

    test('Should return null if LoadCampaignRepository returns null', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const adsSummary = await sut.loadOne(1,1,1,1)
      expect(adsSummary).toBeNull()
    })
  })

  describe('LoadOptimizationDataRepository', () => {
    test('Should call LoadOptimizationDataRepository with correct values', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadOptimizationDataRepositoryStub, 'load')
      await sut.loadOne(1,1,1,1)
      expect(loadSpy).toHaveBeenCalledWith(1, undefined, 1)
    })

    test('Should throw if LoadAllAdsRepository throws', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      jest.spyOn(loadOptimizationDataRepositoryStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadOne(1,1,1,1)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('GetExternalInfo', () => {
    test('Should call GetExternalInfo with correct values', async () => {
      const { sut, getExternalAdInfoStub } = makeSut()
      const loadSpy = jest.spyOn(getExternalAdInfoStub, 'getExternalAdInfo')
      await sut.loadOne(1,2,1,0)
      expect(loadSpy).toHaveBeenCalledWith(1, 1, 1, 0)
    })

    test('Should throw if GetExternalInfo throws', async () => {
      const { sut, getExternalAdInfoStub } = makeSut()
      jest.spyOn(getExternalAdInfoStub, 'getExternalAdInfo').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadOne(1,2,1,0)
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return a OptimizationData on success', async () => {
    const { sut } = makeSut()
    const summaryAds = await sut.loadOne(1,1,1,1)
    expect(summaryAds).toEqual(makeFakeOptimizeData())
  })
})