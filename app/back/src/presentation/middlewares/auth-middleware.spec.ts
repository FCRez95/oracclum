/* eslint-disable no-undef */
import { AuthMiddleware } from './auth-middleware'
import { forbidden, ok, serverError } from '../helpers/http-helper'
import { AccessDeniedError } from '../errors'
import { LoadAccountByToken } from '../../domain/usecases/account/load-account-by-token'
import { HttpRequest } from '../protocols'
import { AccountModel } from '../../domain/models/account'

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
  sut: AuthMiddleware
  loadAccountByToken: LoadAccountByToken
}

const makeSut = (role?:string): SutTypes => {
  const loadAccountByToken = makeVerifyToken()
  const sut = new AuthMiddleware(loadAccountByToken, role)
  return {
    sut,
    loadAccountByToken
  }
}

describe('Authentication Middleware', () => {
  test('Should return 403 if no x-access-token is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should call LoadAccountByToken with correct access token and role', async () => {
    const role = 'any_role'
    const { sut, loadAccountByToken } = makeSut(role)
    const verifySpy = jest.spyOn(loadAccountByToken, 'load')
    await sut.handle(makeFakeRequest())
    expect(verifySpy).toHaveBeenCalledWith('any_token', role)
  })

  test('Should return 403 if LoadAccountByToken returns null', async () => {
    const { sut, loadAccountByToken } = makeSut()
    jest.spyOn(loadAccountByToken, 'load').mockReturnValueOnce(new Promise((resolve, reject) => resolve(null)))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if LoadAccountByToken returns an account', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok({ idUser: 1 }))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { sut, loadAccountByToken } = makeSut()
    jest.spyOn(loadAccountByToken, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
