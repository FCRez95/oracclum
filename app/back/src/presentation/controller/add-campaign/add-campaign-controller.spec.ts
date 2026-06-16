/* eslint-disable no-undef */
import { MissingParamError } from '../../errors'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http-helper'
import { AddCampaignController } from './add-campaign-controller'
import { HttpRequest, Validation, AddCampaign, CampaignModel } from './add-campaign-controller-protocols'

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

const makeAddCampaign = (): AddCampaign => {
  class AddCampaignStub implements AddCampaign {
    async add (name: string, link: string, idUser: number): Promise<CampaignModel | null> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
  }
  return new AddCampaignStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    idUser: 1,
    link: 'any_link',
    ad_provider: 'any_provider',
    sub_account: 'sub_conta'
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
  sut: AddCampaignController,
  addCampaignStub: AddCampaign,
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addCampaignStub = makeAddCampaign()
  const validationStub = makeValidation()
  const sut = new AddCampaignController(addCampaignStub, validationStub)
  return {
    sut,
    addCampaignStub,
    validationStub
  }
}

describe('Add Campaign Controller', () => {
  test('Should call AddCampaign with correct values', async () => {
    const { sut, addCampaignStub } = makeSut()
    const authSpy = jest.spyOn(addCampaignStub, 'add')
    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith(
      'any_name',
      'any_link',
      1,
      'any_provider',
      'sub_conta'
    )
  })

  test('Should return 500 if AddCampaign throws', async () => {
    const { sut, addCampaignStub } = makeSut()
    jest.spyOn(addCampaignStub, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 if AddCampaign returns a campaign', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    const ass = ok({newCampaign: makeFakeCampaign()})
    expect(httpResponse).toEqual(ok(makeFakeCampaign()))

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
