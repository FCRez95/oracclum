/* eslint-disable no-undef */
import { DbLoadUserCampaigns } from './db-load-user-campaigns'
import { CampaignInternalSummary, LoadCampaignSummaryRepository } from '../../protocols/db/clicks-taboola/load-campaign-summary-repository'
import { LoadUserCampaignsRepository } from '../../protocols/db/campaign/load-user-campaigns-repository'
import { CampaignModel } from '../add-campaign/db-add-campaign-protocols'
import { CampaignSummaryModel } from '../../../domain/models/campaign-summary'
import { ExternalData, GetExternalData } from '../../protocols/external-apis/external-info'

const makeFakeCampaign = () => ({
  id: 2,
  id_user: 1,
  name: 'any_name',
  link: 'any_link',
  ad_provider: 'taboola',
  click_auth: 'any_token',
  external_id: '1'
})

const makeFakeCampaignSummary = () => ({
  id: 2,
  id_user: 1,
  name: 'any_name',
  external_id: 1,
  link: 'any_link',
  ad_provider: 'taboola',
  expenses: 0,
  revenue: 0,
  clicks: 0,
  sales: 0,
  checkout: 0,
  roas: 0,
})

const makeFakeCampaignInternalSummary = (): CampaignInternalSummary => ({
  id_campaign: 2,
  revenue: 0,
  sales: 0,
  checkout: 0,
})

const makeFakeCampaignExternalData = () => ({
  provider: 'taboola',
  external_id: 1,
  expenses: 0,
  clicks: 0
})

const makeLoadUserCampaignsRepository = (): LoadUserCampaignsRepository => {
  class LoadUserCampaignsRepositoryStub implements LoadUserCampaignsRepository {
    async loadUserCampaigns (idUser:number): Promise<CampaignModel[]> {
      return new Promise(resolve => resolve([makeFakeCampaign()]))
    }
  }
  return new LoadUserCampaignsRepositoryStub()
}

const makeLoadCampaignSummaryRepository = (): LoadCampaignSummaryRepository => {
  class LoadCampaignSummaryRepositoryStub implements LoadCampaignSummaryRepository {
    async loadSummary(idCampaign: number, ad_provider: string, days: number): Promise<CampaignSummaryModel> {
      return Promise.resolve(makeFakeCampaignSummary())
    }

    async loadSummaryByDateRange(
      idCampaign: number,
      ad_provider: string,
      dateRange: { startDate: string; endDate: string }
    ): Promise<CampaignSummaryModel> {
      return Promise.resolve(makeFakeCampaignSummary())
    }

    async loadSummariesByCampaignIds(
      ad_provider: string,
      campaignIds: number[],
      days: number
    ): Promise<CampaignInternalSummary[]> {
      return Promise.resolve([makeFakeCampaignInternalSummary()])
    }

    async loadSummariesByCampaignIdsByDateRange(
      ad_provider: string,
      campaignIds: number[],
      dateRange: { startDate: string; endDate: string }
    ): Promise<CampaignInternalSummary[]> {
      return Promise.resolve([makeFakeCampaignInternalSummary()])
    }
  }
  return new LoadCampaignSummaryRepositoryStub()
}

const makeGetExternalDataStub = (): GetExternalData => {
  class GetExternalDataStub implements GetExternalData {
    async getExternalData(idUser: number, ids: number[], days: number): Promise<ExternalData[]> {
      return Promise.resolve([makeFakeCampaignExternalData()])
    }

    async getExternalDataByDateRange(
      idUser: number,
      ids: number[],
      dateRange: { startDate: string; endDate: string }
    ): Promise<ExternalData[]> {
      return Promise.resolve([makeFakeCampaignExternalData()])
    }
  }
  return new GetExternalDataStub()
}

interface SutTypes {
  sut: DbLoadUserCampaigns
  loadUserCampaignsRepositoryStub: LoadUserCampaignsRepository
  loadCampaignSummaryRepositoryStub: LoadCampaignSummaryRepository
  getTaboolaExternalDataStub: GetExternalData
  getMetaExternalDataStub: GetExternalData
}

const makeSut = (): SutTypes => {
  const loadUserCampaignsRepositoryStub = makeLoadUserCampaignsRepository()
  const loadCampaignSummaryRepositoryStub = makeLoadCampaignSummaryRepository()
  const getTaboolaExtInfoStub = makeGetExternalDataStub()
  const getMetaExtInfoStub = makeGetExternalDataStub()
  const sut = new DbLoadUserCampaigns(
    loadUserCampaignsRepositoryStub,
    loadCampaignSummaryRepositoryStub,
    getTaboolaExtInfoStub,
    getMetaExtInfoStub
  )
  return {
    sut,
    loadCampaignSummaryRepositoryStub,
    loadUserCampaignsRepositoryStub,
    getTaboolaExternalDataStub: getTaboolaExtInfoStub,
    getMetaExternalDataStub: getMetaExtInfoStub
  }
}

describe('DbLoadUserCampaigns usecase - load', () => {
  describe('LoadUserCampaignsRepository', () => {
    test('Should call LoadUserCampaignsRepository with correct values', async () => {
      const { sut, loadUserCampaignsRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(loadUserCampaignsRepositoryStub, 'loadUserCampaigns')
      await sut.load(1, 500)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(1)
    })

    test('Should throw if LoadUserCampaignsRepository throws', async () => {
      const { sut, loadUserCampaignsRepositoryStub } = makeSut()
      jest.spyOn(loadUserCampaignsRepositoryStub, 'loadUserCampaigns').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.load(1, 500)
      await expect(promise).rejects.toThrow()
    })

    test('Should return null if LoadUserCampaignsRepository returns null', async () => {
      const { sut, loadUserCampaignsRepositoryStub } = makeSut()
      jest.spyOn(loadUserCampaignsRepositoryStub, 'loadUserCampaigns').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const account = await sut.load(1, 500)
      expect(account).toEqual([])
    })
  })

  describe('LoadCampaignSummaryRepository', () => {
    test('Should call LoadCampaignSummaryRepository with correct values | Taboola Campaign', async () => {
      const { sut, loadCampaignSummaryRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(loadCampaignSummaryRepositoryStub, 'loadSummariesByCampaignIds')
      await sut.load(1, 500)
      expect(loadCampaignsSpy).toHaveBeenCalledWith('taboola', [2], 500)
    })

    test('Should throw if LoadCampaignSummaryRepository throws', async () => {
      const { sut, loadCampaignSummaryRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignSummaryRepositoryStub, 'loadSummariesByCampaignIds').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.load(1, 500)
      await expect(promise).rejects.toThrow()
    })
  })

  describe('GetTaboolaExternalData', () => {
    test('Should call GetTaboolaExternalData with correct values', async () => {
      const { sut, getTaboolaExternalDataStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(getTaboolaExternalDataStub, 'getExternalData')
      await sut.load(1, 500)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(1, [1], 500)
    })

    test('Should throw if GetTaboolaExternalData throws', async () => {
      const { sut, getTaboolaExternalDataStub } = makeSut()
      jest.spyOn(getTaboolaExternalDataStub, 'getExternalData').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.load(1, 500)
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return a CampaignSumary[] on success', async () => {
    const { sut } = makeSut()
    const campaigns = await sut.load(1, 500)
    expect(campaigns).toEqual([makeFakeCampaignSummary()])
  })
})

describe('DbLoadUserCampaigns usecase - loadByDateRange', () => {
  test('Should call loadSummaryByDateRange and getExternalDataByDateRange with correct values', async () => {
    const { sut, loadCampaignSummaryRepositoryStub, getTaboolaExternalDataStub } = makeSut()
    const loadSummarySpy = jest.spyOn(loadCampaignSummaryRepositoryStub, 'loadSummariesByCampaignIdsByDateRange')
    const getExternalSpy = jest.spyOn(getTaboolaExternalDataStub, 'getExternalDataByDateRange')

    const dateRange = { startDate: '2023-01-01', endDate: '2023-01-07' }
    await sut.loadByDateRange(1, dateRange)

    expect(loadSummarySpy).toHaveBeenCalledWith('taboola', [2], dateRange)
    expect(getExternalSpy).toHaveBeenCalledWith(1, [1], dateRange)
  })

  test('Should return correct CampaignSummary[] on success', async () => {
    const { sut } = makeSut()
    const dateRange = { startDate: '2023-01-01', endDate: '2023-01-07' }
    const result = await sut.loadByDateRange(1, dateRange)
    expect(result).toEqual([makeFakeCampaignSummary()])
  })

  test('Should throw if loadSummaryByDateRange throws', async () => {
    const { sut, loadCampaignSummaryRepositoryStub } = makeSut()
    jest.spyOn(loadCampaignSummaryRepositoryStub, 'loadSummariesByCampaignIdsByDateRange')
      .mockRejectedValueOnce(new Error('summary error'))

    const promise = sut.loadByDateRange(1, { startDate: '2023-01-01', endDate: '2023-01-07' })
    await expect(promise).rejects.toThrow('summary error')
  })

  test('Should throw if getExternalDataByDateRange throws', async () => {
    const { sut, getTaboolaExternalDataStub } = makeSut()
    jest.spyOn(getTaboolaExternalDataStub, 'getExternalDataByDateRange')
      .mockRejectedValueOnce(new Error('external error'))

    const promise = sut.loadByDateRange(1, { startDate: '2023-01-01', endDate: '2023-01-07' })
    await expect(promise).rejects.toThrow('external error')
  })

  test('Should return null if LoadUserCampaignsRepository returns null', async () => {
    const { sut, loadUserCampaignsRepositoryStub } = makeSut()
    jest.spyOn(loadUserCampaignsRepositoryStub, 'loadUserCampaigns')
      .mockResolvedValueOnce(null)

    const result = await sut.loadByDateRange(1, { startDate: '2023-01-01', endDate: '2023-01-07' })
    expect(result).toEqual([])
  })
})
