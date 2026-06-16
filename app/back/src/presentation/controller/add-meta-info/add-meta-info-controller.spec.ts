/* eslint-disable no-undef */
import { MissingParamError } from '../../errors'
import { badRequest, forbidden, ok, serverError } from '../../helpers/http-helper'
import { HttpRequest, Validation } from '../../protocols'
import { AddMetaInfoController } from './add-meta-info-controller'
import { AddMetaInfo } from "../../../domain/usecases/integrations/add-meta-info";
import { ProviderAccountInUseError } from '../../errors'

const makeAddMetaInfo = (): AddMetaInfo => {
  class AddMetaInfoStub implements AddMetaInfo {
    async addInfo (idUser: number, metaAccessToken: string): Promise<void> {
    }
  }
  return new AddMetaInfoStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idUser: 1,
    metaAccessToken: 'any_token',
    allowedAccounts: [{ account_id: 'meta_1', name: 'Meta 1' }]
  }
})

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

interface SutTypes {
  sut: AddMetaInfoController,
  addMetaInfoStub: AddMetaInfo,
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addMetaInfoStub = makeAddMetaInfo()
  const validationStub = makeValidation()
  const sut = new AddMetaInfoController(addMetaInfoStub, validationStub)
  return {
    sut,
    addMetaInfoStub,
    validationStub
  }
}

describe('Add Meta Info Controller', () => {
  test('Should call AddMetaInfo with correct values', async () => {
    const { sut, addMetaInfoStub } = makeSut()
    const authSpy = jest.spyOn(addMetaInfoStub, 'addInfo')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(1, 'any_token', [{ account_id: 'meta_1', name: 'Meta 1' }])
  })

  test('Should return 500 if AddMetaInfo throws', async () => {
    const { sut, addMetaInfoStub } = makeSut()
    jest.spyOn(addMetaInfoStub, 'addInfo').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 403 if AddMetaInfo throws ProviderAccountInUseError', async () => {
    const { sut, addMetaInfoStub } = makeSut()
    jest.spyOn(addMetaInfoStub, 'addInfo').mockRejectedValueOnce(new ProviderAccountInUseError())
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new ProviderAccountInUseError()))
  })

  test('Should return 200 on AddMetaInfo success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok('Informações adicionadas com sucesso!'))
  })

  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
