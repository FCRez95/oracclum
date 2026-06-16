/* eslint-disable no-undef */
import { ok, serverError, unauthorized } from '../../helpers/http-helper'
import { LoadAllMetaAdsetsController } from './load-all-meta-adsets-controller'
import { LoadAllMetaAdSets } from "../../../domain/usecases/meta-ad-sets/load-all-ad-sets-summary";
import { MetaAdSetModel } from '../../../domain/models/meta-ad-set'
import { HttpRequest } from '../../protocols'

const makeFakeAddSummary = () => ({
  id_ad_set: 1,
  name: 'any_name',
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

const makeLoadAllMetaAdsets = (): LoadAllMetaAdSets => {
  class LoadAllAdsSummaryStub implements LoadAllMetaAdSets {
    async loadAll(idUser: number, id_campaign: number, days: number): Promise<MetaAdSetModel[] | null> {
      return new Promise(resolve => resolve([makeFakeAddSummary()]))
    }
  }
  return new LoadAllAdsSummaryStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: 1,
    days: 0
  },
  body: {
    idUser: 1,
  }
})

interface SutTypes {
  sut: LoadAllMetaAdsetsController,
  loadAllMetaAdsetsStub: LoadAllMetaAdSets,
}

const makeSut = (): SutTypes => {
  const loadAllMetaAdsetsStub = makeLoadAllMetaAdsets()
  const sut = new LoadAllMetaAdsetsController(loadAllMetaAdsetsStub)
  return {
    sut,
    loadAllMetaAdsetsStub
  }
}

describe('LoadAllMetaAdsetsController', () => {
  test('Should call LoadAllMetaAdSets with correct values', async () => {
    const { sut, loadAllMetaAdsetsStub } = makeSut()
    const authSpy = jest.spyOn(loadAllMetaAdsetsStub, 'loadAll')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 1, 0)
  })

  test('Should return 500 if LoadAllMetaAdSets throws', async () => {
    const { sut, loadAllMetaAdsetsStub } = makeSut()
    jest.spyOn(loadAllMetaAdsetsStub, 'loadAll').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if LoadAllMetaAdSets returns null', async () => {
    const { sut, loadAllMetaAdsetsStub } = makeSut()
    jest.spyOn(loadAllMetaAdsetsStub, 'loadAll').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadAllMetaAdSets returns an AdsetModel', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok([makeFakeAddSummary()]))
  })
})
