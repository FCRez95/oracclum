import { LoadIntegrationStatus, LoadIntegrationStatusResult } from "../../../domain/usecases/campaign/load-integration-status"
import { noContent, ok, serverError, unauthorized } from "../../helpers/http-helper"
import { HttpRequest } from "../../protocols"
import { LoadIntegrationStatusController } from "./load-integration-status-controller"

const makeLoadIntegrationStatus = (): LoadIntegrationStatus => {
  class LoadIntegrationStatusStub implements LoadIntegrationStatus {
    async load (idUser: number, idCampaign: number): Promise<LoadIntegrationStatusResult> {
      return {
        authorized: true,
        status: {
          id_campaign: idCampaign,
          ad_provider: 1,
          funnel: 1,
          checkout: 0,
          test: 0
        }
      }
    }
  }

  return new LoadIntegrationStatusStub()
}

const makeFakeRequest = (): HttpRequest => ({
  params: {
    id_campaign: '1'
  },
  body: {
    idUser: 1
  }
})

type SutTypes = {
  sut: LoadIntegrationStatusController
  loadIntegrationStatusStub: LoadIntegrationStatus
}

const makeSut = (): SutTypes => {
  const loadIntegrationStatusStub = makeLoadIntegrationStatus()
  const sut = new LoadIntegrationStatusController(loadIntegrationStatusStub)

  return {
    sut,
    loadIntegrationStatusStub
  }
}

describe('LoadIntegrationStatusController', () => {
  test('Should call LoadIntegrationStatus with correct values', async () => {
    const { sut, loadIntegrationStatusStub } = makeSut()
    const loadSpy = jest.spyOn(loadIntegrationStatusStub, 'load')

    await sut.handle(makeFakeRequest())

    expect(loadSpy).toHaveBeenCalledWith(1, 1)
  })

  test('Should return 401 when campaign is not owned by user', async () => {
    const { sut, loadIntegrationStatusStub } = makeSut()
    jest.spyOn(loadIntegrationStatusStub, 'load').mockResolvedValueOnce({
      authorized: false,
      status: null
    })

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 204 when status row does not exist', async () => {
    const { sut, loadIntegrationStatusStub } = makeSut()
    jest.spyOn(loadIntegrationStatusStub, 'load').mockResolvedValueOnce({
      authorized: true,
      status: null
    })

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(noContent())
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({
      id_campaign: 1,
      ad_provider: 1,
      funnel: 1,
      checkout: 0,
      test: 0
    }))
  })

  test('Should return 500 if LoadIntegrationStatus throws', async () => {
    const { sut, loadIntegrationStatusStub } = makeSut()
    jest.spyOn(loadIntegrationStatusStub, 'load').mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
