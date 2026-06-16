import { AccountModel } from "../../../domain/models/account"
import { LoadAllAccountsRepository } from '../../protocols/db/account/load-all-accounts-repository'
import { DbLoadAllAccounts } from './db-load-all-accounts'

const makeFakeAccount = (): AccountModel => ({
  id: 1,
  name: 'any_name',
  email: 'anymail@mail.com',
  password: 'hashed_password',
  user_type: 'any_role',
  allow_clicks: true
})

  
const makeLoadAllAccountsRepository = (): LoadAllAccountsRepository => {
  class LoadAllAccountsRepositoryStub implements LoadAllAccountsRepository {
    async loadAccounts (): Promise<AccountModel[]> {
      return new Promise(resolve => resolve([makeFakeAccount()]))
    }
  }
  return new LoadAllAccountsRepositoryStub()
}

interface SutTypes {
  sut: DbLoadAllAccounts
  loadAllAccountsStub: LoadAllAccountsRepository
}

const makeSut = (): SutTypes => {
  const loadAllAccountsStub = makeLoadAllAccountsRepository()
  const sut = new DbLoadAllAccounts(loadAllAccountsStub)
  return {
    sut,
    loadAllAccountsStub
  }
}

describe('DbLoadAllAccounts usecase', () => {
  test('Should throw if LoadAccountByTokenRepository throws', async () => {
    const { sut, loadAllAccountsStub } = makeSut()
    jest.spyOn(loadAllAccountsStub, 'loadAccounts').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.loadAll()
    await expect(promise).rejects.toThrow()
  })

  test('Should return an account array on success', async () => {
    const { sut } = makeSut()
    const accounts = await sut.loadAll()
    expect(accounts).toEqual([makeFakeAccount()])
  })
})