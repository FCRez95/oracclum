import { InvalidParamError, MissingParamError } from "../../errors"
import { badRequest, ok, unauthorized } from "../../helpers/http-helper"
import { HttpRequest, Validation } from "../../protocols"
import { UpdateIntegrationStatus } from "../../../domain/usecases/campaign/update-integration-status"
import { UpdateIntegrationStatusController } from "./update-integration-status-controller"

const makeUpdateIntegrationStatus = (): UpdateIntegrationStatus => {
  class UpdateIntegrationStatusStub implements UpdateIntegrationStatus {
    async update (idUser: number, params: { idCampaign: number, step: 'ad_provider' | 'funnel' | 'checkout' | 'test', status: 0 | 1 }) {
      return {
        id_campaign: params.idCampaign,
        ad_provider: 0,
        funnel: 1,
        checkout: 0,
        test: 0
      }
    }
  }

  return new UpdateIntegrationStatusStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }

  return new ValidationStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idUser: 1,
    idCampaign: 10,
    step: 'funnel',
    status: 1
  }
})

type SutTypes = {
  sut: UpdateIntegrationStatusController
  updateIntegrationStatusStub: UpdateIntegrationStatus
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const updateIntegrationStatusStub = makeUpdateIntegrationStatus()
  const validationStub = makeValidation()
  const sut = new UpdateIntegrationStatusController(updateIntegrationStatusStub, validationStub)

  return {
    sut,
    updateIntegrationStatusStub,
    validationStub
  }
}

describe('UpdateIntegrationStatusController', () => {
  test('Should return 400 if validation fails', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('step'))

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(new MissingParamError('step')))
  })

  test('Should return 400 for invalid step', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        idUser: 1,
        idCampaign: 10,
        step: 'invalid_step',
        status: 1
      }
    })

    expect(httpResponse).toEqual(badRequest(new InvalidParamError('step')))
  })

  test('Should return 400 for invalid status', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({
      body: {
        idUser: 1,
        idCampaign: 10,
        step: 'funnel',
        status: 2
      }
    })

    expect(httpResponse).toEqual(badRequest(new InvalidParamError('status')))
  })

  test('Should call update use case with correct values', async () => {
    const { sut, updateIntegrationStatusStub } = makeSut()
    const updateSpy = jest.spyOn(updateIntegrationStatusStub, 'update')

    await sut.handle(makeFakeRequest())

    expect(updateSpy).toHaveBeenCalledWith(1, {
      idCampaign: 10,
      step: 'funnel',
      status: 1
    })
  })

  test('Should return 401 when campaign does not belong to user', async () => {
    const { sut, updateIntegrationStatusStub } = makeSut()
    jest.spyOn(updateIntegrationStatusStub, 'update').mockResolvedValueOnce(null)

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 with resulting row on success', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({
      id_campaign: 10,
      ad_provider: 0,
      funnel: 1,
      checkout: 0,
      test: 0
    }))
  })

  test('Should return 500 if use case throws', async () => {
    const { sut, updateIntegrationStatusStub } = makeSut()
    jest.spyOn(updateIntegrationStatusStub, 'update').mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse.statusCode).toBe(500)
  })
})
