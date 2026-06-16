/* eslint-disable no-undef */
import { LoadAllUsersController } from './load-all-users-controller'
import { unauthorized, ok, serverError } from '../../helpers/http-helper'
import { LoadAccountByToken } from '../../../domain/usecases/account/load-account-by-token'
import { HttpRequest } from '../../protocols'
import { AccountModel } from '../../../domain/models/account'
import { LoadAllAccounts } from '../../../domain/usecases/account/load-all-accounts'

const makeFakeRequest = (): HttpRequest => ({
  params: {
    accessToken: 'any_token'
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

const makeLoadAllUsersStub = (): LoadAllAccounts => {
  class LoadAllAccountsStub implements LoadAllAccounts {
    async loadAll (): Promise<AccountModel[]> {
      return new Promise(resolve => resolve([makeFakeAccount()]))
    }
  }

  return new LoadAllAccountsStub()
}


interface SutTypes {
  sut: LoadAllUsersController
  loadAccountByToken: LoadAccountByToken
  loadAllAccountsStub: LoadAllAccounts
}

const makeSut = (role?:string): SutTypes => {
  const loadAccountByToken = makeVerifyToken()
  const loadAllAccountsStub = makeLoadAllUsersStub()
  const sut = new LoadAllUsersController(loadAllAccountsStub)
  return {
    sut,
    loadAccountByToken,
    loadAllAccountsStub
  }
}

describe('LoadUserDataController', () => {
  test('Should return 500 if LoaAlldAccounts throws', async () => {
    const { sut, loadAllAccountsStub } = makeSut()
    jest.spyOn(loadAllAccountsStub, 'loadAll').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 if LoadAllAccounts returns an account array', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok([makeFakeAccount()]))
  })

})
