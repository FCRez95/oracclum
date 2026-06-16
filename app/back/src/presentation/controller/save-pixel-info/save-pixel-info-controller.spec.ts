import { SavePixelInfo } from "../../../domain/usecases/campaign/save-pixel-info"
import { MissingParamError } from "../../errors"
import { badRequest, ok, unauthorized } from "../../helpers/http-helper"
import { HttpRequest, Validation } from "../../protocols"
import { SavePixelInfoController } from "./save-pixel-info-controller"

const makeSavePixelInfo = (): SavePixelInfo => {
  class SavePixelInfoStub implements SavePixelInfo {
    async save (idUser: number, pixelInfo: { idCampaign: number, accessToken: string, pixelId: string }) {
      return pixelInfo
    }
  }

  return new SavePixelInfoStub()
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
    accessToken: 'any_token',
    pixelId: 'pixel_123'
  }
})

type SutTypes = {
  sut: SavePixelInfoController
  savePixelInfoStub: SavePixelInfo
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const savePixelInfoStub = makeSavePixelInfo()
  const validationStub = makeValidation()
  const sut = new SavePixelInfoController(savePixelInfoStub, validationStub)

  return {
    sut,
    savePixelInfoStub,
    validationStub
  }
}

describe('SavePixelInfoController', () => {
  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await sut.handle(makeFakeRequest())

    expect(validateSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  test('Should return 400 if Validation fails', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('pixelId'))

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(new MissingParamError('pixelId')))
  })

  test('Should call SavePixelInfo with correct values', async () => {
    const { sut, savePixelInfoStub } = makeSut()
    const saveSpy = jest.spyOn(savePixelInfoStub, 'save')

    await sut.handle(makeFakeRequest())

    expect(saveSpy).toHaveBeenCalledWith(1, {
      idCampaign: 10,
      accessToken: 'any_token',
      pixelId: 'pixel_123'
    })
  })

  test('Should return 401 if campaign does not belong to user', async () => {
    const { sut, savePixelInfoStub } = makeSut()
    jest.spyOn(savePixelInfoStub, 'save').mockResolvedValueOnce(null)

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 with saved object on success', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({
      idCampaign: 10,
      accessToken: 'any_token',
      pixelId: 'pixel_123'
    }))
  })

  test('Should return 500 if SavePixelInfo throws', async () => {
    const { sut, savePixelInfoStub } = makeSut()
    jest.spyOn(savePixelInfoStub, 'save').mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(makeFakeRequest())

    expect(httpResponse.statusCode).toBe(500)
  })
})
