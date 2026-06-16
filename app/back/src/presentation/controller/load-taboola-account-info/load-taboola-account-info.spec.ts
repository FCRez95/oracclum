/* eslint-disable no-undef */
import { LoadTaboolaAccountInfoController } from './load-taboola-account-info-controller'
import { ok, serverError, noContent } from '../../helpers/http-helper'
import { HttpRequest } from '../../protocols'
import { TaboolaAccountInfoModel } from '../../../domain/models/taboola-account-info'
import { LoadTaboolaAccountInfo } from '../../../domain/usecases/account/load-taboola-account-info'

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    'x-access-token': 'any_token'
  }
})

const makeFakeTaboolaInfo = (): TaboolaAccountInfoModel => ({
  account_id: 'any_account',
  client_id: 'any_client',
  client_secret: 'any_secret',
  access_token: 'any_token'
})

const makeLoadTaboolaAccountInfo = (): LoadTaboolaAccountInfo => {
    class LoadTaboolaAccountInfoStub implements LoadTaboolaAccountInfo {
      async loadInfo (accessToken: string): Promise<TaboolaAccountInfoModel> {
        return new Promise(resolve => resolve(makeFakeTaboolaInfo()))
      }
    }
  
    return new LoadTaboolaAccountInfoStub()
}

interface SutTypes {
  sut: LoadTaboolaAccountInfoController
  loadTaboolaAccountInfoStub: LoadTaboolaAccountInfo
}

const makeSut = (role?:string): SutTypes => {
  const loadTaboolaAccountInfoStub = makeLoadTaboolaAccountInfo()
  const sut = new LoadTaboolaAccountInfoController(loadTaboolaAccountInfoStub)
  return {
    sut,
    loadTaboolaAccountInfoStub
  }
}

describe('LoadTaboolaAccountInfoController', () => {
  test('Should return 204 if LoadTaboolaAccountInfo returns null', async () => {
    const { sut, loadTaboolaAccountInfoStub } = makeSut()
    jest.spyOn(loadTaboolaAccountInfoStub, 'loadInfo').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(noContent())
  })

  test('Should return 200 if LoadAccountByToken returns an account', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeTaboolaInfo()))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { sut, loadTaboolaAccountInfoStub } = makeSut()
    jest.spyOn(loadTaboolaAccountInfoStub, 'loadInfo').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 504 if taboola takes to long to answer', async () => {
    const { sut, loadTaboolaAccountInfoStub } = makeSut()
    jest.spyOn(loadTaboolaAccountInfoStub, 'loadInfo').mockImplementation(() => {
      return new Promise((_, reject) => reject(new Error('Taboola timeout')))
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(504)
  })
})
