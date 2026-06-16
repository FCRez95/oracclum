/* eslint-disable no-undef */
import { LoadUserDataController } from './load-user-data-controller'
import { unauthorized, ok, serverError } from '../../helpers/http-helper'
import { LoadAccountByToken } from '../../../domain/usecases/account/load-account-by-token'
import { HttpRequest } from '../../protocols'
import { AccountModel } from '../../../domain/models/account'

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    'x-access-token': 'any_token'
  }
})

const makeFakeAccount = (): AccountModel => ({
  id: 1,
  name: 'any_name',
  email: 'anymail@mail.com',
  password: 'hashed_password',
  user_type: 'any_role',
  allow_clicks: true
})

const makeVerifyToken = (): LoadAccountByToken => {
  class LoadAccountByTokenStub implements LoadAccountByToken {
    async load (accessToken: string, role?: string): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new LoadAccountByTokenStub()
}

interface SutTypes {
  sut: LoadUserDataController
  loadAccountByToken: LoadAccountByToken
}

const makeSut = (role?:string): SutTypes => {
  const loadAccountByToken = makeVerifyToken()
  const sut = new LoadUserDataController(loadAccountByToken)
  return {
    sut,
    loadAccountByToken
  }
}

describe('LoadUserDataController', () => {
  test('Should return 401 if no accessToken is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 401 if LoadAccountByToken returns null', async () => {
    const { sut, loadAccountByToken } = makeSut()
    jest.spyOn(loadAccountByToken, 'load').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 200 if LoadAccountByToken returns an account', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeAccount()))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { sut, loadAccountByToken } = makeSut()
    jest.spyOn(loadAccountByToken, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

})
