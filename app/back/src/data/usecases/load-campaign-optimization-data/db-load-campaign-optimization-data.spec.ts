/* eslint-disable no-undef */
import { DbLoadCampaignOptimizationData } from './db-load-campaign-optimization-data'
import { CampaignModel } from '../add-campaign/db-add-campaign-protocols'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { InternalOptimizationData, LoadOptimizationDataRepository } from '../../protocols/db/clicks-taboola/load-optimization-data-repository'
import { GetIdCampaignTaboolaRepository } from '../../protocols/db/clicks-taboola/get-id-campaign-taboola-repository'
import { ExternalInfo, GetCampaingExtInfo } from '../../protocols/external-apis/external-info'

const makeFakeCampaign = () => ({
  id: 2,
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
    expenses: 1,
    vcpm: 0.9,
    vctr: 20,
    cpc: 0.4,
    revenue: 1,
    clicks: 1,
    checkout: 1,
    sales: 1,
    cpa: 1,
    roas: 1,
  }
})

const makeFakeNullCampaign = () => ({
  id: 2,
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
  summary: makeFakeNullOptimizeData()
})

const makeFakeExternalInfo = () => ({
  external_id: 1,
  expenses: 1,
  clicks: 1,
  vcpm: 0.9,
  vctr: 20,
  cpc: 0.4
})

const makeFakeInternallInfo = () => ({
  revenue: 1,
  clicks: 1,
  checkout: 1,
  sales: 1
})


const makeFakeNullOptimizeData = () => ({
  revenue: 0,
  expenses: 0,
  cpc: 0,
  vcpm: 0,
  cpa: 0,
  vctr: 0,
  clicks: 0,
  checkout: 0,
  sales: 0,
  roas: 0
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
    async load(): Promise<InternalOptimizationData> {
      return new Promise(resolve => resolve(makeFakeInternallInfo()))
    }

    async loadByDateRange(): Promise<InternalOptimizationData> {
      return new Promise(resolve => resolve(makeFakeInternallInfo()))
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

const makeGetExternalInfo = (): GetCampaingExtInfo => {
  class GetCampaingExtInfoStub implements GetCampaingExtInfo {
    async getExtCampaignInfo(id_user: number, ids_campaign_taboola: number, days: number): Promise<ExternalInfo> {
      return new Promise(resolve => resolve(makeFakeExternalInfo()))
    }

    async getExtCampaignInfoByDateRange(id_user: number, ids_campaign_taboola: number): Promise<ExternalInfo> {
      return new Promise(resolve => resolve(makeFakeExternalInfo()))
    }
  }
  return new GetCampaingExtInfoStub()
}

interface SutTypes {
  sut: DbLoadCampaignOptimizationData
  loadCampaignRepositoryStub: LoadCampaignRepository
  getIdCampaignTaboolaRepositoryStub: GetIdCampaignTaboolaRepository
  loadOptimizationDataRepositoryStub: LoadOptimizationDataRepository
  getCampaingExtInfoStub: GetCampaingExtInfo
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const getIdCampaignTaboolaRepositoryStub = makeGetIdCampaignTaboolaRepository()
  const loadOptimizationDataRepositoryStub = makeLoadOptimizationDataRepository()
  const getCampaingExtInfoStub = makeGetExternalInfo()
  const sut = new DbLoadCampaignOptimizationData(loadCampaignRepositoryStub, getIdCampaignTaboolaRepositoryStub, loadOptimizationDataRepositoryStub, getCampaingExtInfoStub)
  return {
    sut,
    loadCampaignRepositoryStub,
    getIdCampaignTaboolaRepositoryStub,
    loadOptimizationDataRepositoryStub,
    getCampaingExtInfoStub
  }
}

describe('DbLoadFunnelsByTime usecase', () => {
  describe('LoadCampaignRepository', () => {
    test('Should call LoadCampaignRepository with correct values', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign')
      await sut.get(1, 1, 1)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(1)
    })

    test('Should throw if LoadCampaignRepository throws', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.get(1,1,1)
      await expect(promise).rejects.toThrow()
    })

    test('Should return null if LoadCampaignRepository returns null', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const funnels = await sut.get(1,1,1)
      expect(funnels).toBeNull()
    })
  })

  describe('GetIdCampaignTaboolaRepository', () => {
    test('Should call GetIdCampaignTaboolaRepository with correct values', async () => {
      const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(getIdCampaignTaboolaRepositoryStub, 'getTaboolaId')
      await sut.get(1, 2, 1)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(2)
    })

    test('Should throw if GetIdCampaignTaboolaRepository throws', async () => {
      const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut()
      jest.spyOn(getIdCampaignTaboolaRepositoryStub, 'getTaboolaId').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.get(1,2,1)
      await expect(promise).rejects.toThrow()
    })

    test('Should return campaign with zeroed summary data if GetIdCampaignTaboolaRepository returns null', async () => {
      const { sut, getIdCampaignTaboolaRepositoryStub } = makeSut()
      jest.spyOn(getIdCampaignTaboolaRepositoryStub, 'getTaboolaId').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const campaign = await sut.get(1,2,1)
      expect(campaign).toStrictEqual(makeFakeNullCampaign())
    })
  })

  describe('LoadOptimizationDataRepository', () => {
    test('Should call LoadOptimizationDataRepository with correct values', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadOptimizationDataRepositoryStub, 'load')
      await sut.get(1,2,1)
      expect(loadSpy).toHaveBeenCalledWith(1, 2)
    })

    test('Should throw if LoadOptimizationDataRepository throws', async () => {
      const { sut, loadOptimizationDataRepositoryStub } = makeSut()
      jest.spyOn(loadOptimizationDataRepositoryStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.get(1,1,1)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('GetExternalInfo', () => {
    test('Should call GetExternalInfo with correct values', async () => {
      const { sut, getCampaingExtInfoStub } = makeSut()
      const loadSpy = jest.spyOn(getCampaingExtInfoStub, 'getExtCampaignInfo')
      await sut.get(1,2,1)
      expect(loadSpy).toHaveBeenCalledWith(1, 1, 1)
    })

    test('Should throw if GetExternalInfo throws', async () => {
      const { sut, getCampaingExtInfoStub } = makeSut()
      jest.spyOn(getCampaingExtInfoStub, 'getExtCampaignInfo').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.get(1,2,1)
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return a CampaignModel on success', async () => {
    const { sut } = makeSut()
    const campaign = await sut.get(1,2,1)
    expect(campaign).toEqual(makeFakeCampaign())
  })
})
