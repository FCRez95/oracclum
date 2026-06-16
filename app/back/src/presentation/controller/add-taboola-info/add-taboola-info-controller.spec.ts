/* eslint-disable no-undef */
import { MissingParamError } from '../../errors'
import { badRequest, forbidden, ok, serverError } from '../../helpers/http-helper'
import { HttpRequest, Validation } from '../../protocols'
import { AddTaboolaInfoController } from './add-taboola-info-controller'
import { AddTaboolaInfo } from "../../../domain/usecases/integrations/add-taboola-info";
import { ProviderAccountInUseError } from '../../errors'

const makeFakeCampaign = () => ({
  id: 1,
  id_user: 1,
  name: 'any_name',
  total_clicks: 0,
  total_sales: 0,
  revenue: 0,
  expenses: 0,
  total_checkout: 0,
  click_auth: 'any_token',
  funnels: [{
    id: 1,
    id_campaign: 1,
    name: 'any_name',
    link: 'any_link',
    number_redirects: 0,
    total_clicks: 0,
    total_sales: 0,
    revenue: 0,
    total_step_1: 0,
    total_step_2: 0,
    total_step_3: 0,
    total_checkout: 0,
  }]
})

const makeAddTaboolaInfo = (): AddTaboolaInfo => {
  class AddTaboolaInfoStub implements AddTaboolaInfo {
    async addInfo (idUser: number, accountId: string, clientId: string, clientSecret: string): Promise<string> {
      return 'any_token'
    }
  }
  return new AddTaboolaInfoStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    idUser: 1,
    accountId: 'any_account',
    clientId: 'any_client',
    clientSecret: 'any_secret'
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
  sut: AddTaboolaInfoController,
  addTaboolaInfoStub: AddTaboolaInfo,
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addTaboolaInfoStub = makeAddTaboolaInfo()
  const validationStub = makeValidation()
  const sut = new AddTaboolaInfoController(addTaboolaInfoStub, validationStub)
  return {
    sut,
    addTaboolaInfoStub,
    validationStub
  }
}

describe('Add Taboola Info Controller', () => {
  test('Should call AddTaboolaInfo with correct values', async () => {
    const { sut, addTaboolaInfoStub } = makeSut()
    const authSpy = jest.spyOn(addTaboolaInfoStub, 'addInfo')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(
      1,
      'any_account',
      'any_client',
      'any_secret'
    )
  })

  test('Should return 500 if AddTaboolaInfo throws', async () => {
    const { sut, addTaboolaInfoStub } = makeSut()
    jest.spyOn(addTaboolaInfoStub, 'addInfo').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 403 if AddTaboolaInfo throws ProviderAccountInUseError', async () => {
    const { sut, addTaboolaInfoStub } = makeSut()
    jest.spyOn(addTaboolaInfoStub, 'addInfo').mockRejectedValueOnce(new ProviderAccountInUseError())
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new ProviderAccountInUseError()))
  })

  test('Should return 200 if AddTaboolaInfo returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok('any_token'))

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
