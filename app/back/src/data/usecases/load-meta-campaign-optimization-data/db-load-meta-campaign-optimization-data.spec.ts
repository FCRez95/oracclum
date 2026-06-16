/* eslint-disable no-undef */
import { DbLoadCampaignOptimizationData } from './db-load-meta-campaign-optimization-data'
import { CampaignModel } from '../add-campaign/db-add-campaign-protocols'
import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { InternalOptimizationData, LoadCampaignOptimizationDataRepository } from '../../protocols/db/clicks-meta/load-campaign-optimization-data-repository'
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
  external_id: '1',
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
  external_id: '1',
  summary: makeFakeNullOptimizeData()
})

const makeFakeNullExternalIdCampaign = () => ({
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

const makeLoadCampaignOptimizationDataRepository = (): LoadCampaignOptimizationDataRepository => {
  class LoadOptimizationDataRepositoryStub implements LoadCampaignOptimizationDataRepository {
    async loadCampaignOptData(): Promise<InternalOptimizationData> {
      return new Promise(resolve => resolve(makeFakeInternallInfo()))
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
  loadCampaignOptimizationDataRepositoryStub: LoadCampaignOptimizationDataRepository
  getCampaingExtInfoStub: GetCampaingExtInfo
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const loadCampaignOptimizationDataRepositoryStub = makeLoadCampaignOptimizationDataRepository()
  const getCampaingExtInfoStub = makeGetExternalInfo()
  const sut = new DbLoadCampaignOptimizationData(loadCampaignRepositoryStub, loadCampaignOptimizationDataRepositoryStub, getCampaingExtInfoStub)
  return {
    sut,
    loadCampaignRepositoryStub,
    loadCampaignOptimizationDataRepositoryStub,
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

  describe('campaign.external_id', () => {
    test('Should return campaign with zeroed summary data if campaign has no external_id', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeNullExternalIdCampaign())))
      const campaign = await sut.get(1,2,1)
      expect(campaign).toStrictEqual(makeFakeNullExternalIdCampaign())
    })
  })

  describe('LoadCampaignOptimizationDataRepository', () => {
    test('Should call LoadCampaignOptimizationDataRepository with correct values', async () => {
      const { sut, loadCampaignOptimizationDataRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadCampaignOptimizationDataRepositoryStub, 'loadCampaignOptData')
      await sut.get(1,2,1)
      expect(loadSpy).toHaveBeenCalledWith(2, 1)
    })

    test('Should throw if LoadCampaignOptimizationDataRepository throws', async () => {
      const { sut, loadCampaignOptimizationDataRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignOptimizationDataRepositoryStub, 'loadCampaignOptData').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
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
