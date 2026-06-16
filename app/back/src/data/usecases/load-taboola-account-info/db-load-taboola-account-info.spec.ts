import { TaboolaAccountInfoModel } from "../../../domain/models/taboola-account-info"
import { Decrypter } from "../../protocols/criptography/decrypter"
import { LoadAccountByTokenRepository } from '../../protocols/db/account/load-account-by-token-repository'
import { AccountModel } from "../add-account/db-add-account-protocols"
import { DbLoadTaboolaAccountInfo } from './db-load-taboola-account-info'

const makeFakeTaboolaInfo = (): TaboolaAccountInfoModel => ({
  account_id: 'any_account',
  client_id: 'any_client',
  client_secret: 'any_secret',
  access_token: 'any_token'
})

const makeFakeAccount = (): AccountModel => ({
  id: 0,
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'hashed_password',
  user_type: 'any_role',
  allow_clicks:  true,
  taboola_info: 'encrypted_info'
})


const makeDecrypter = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (encrypted: string): Promise<any> {
      return new Promise(resolve => resolve(makeFakeTaboolaInfo()))
    }
  }
  return new DecrypterStub()
}

const makeLoadAccountByTokenRepository = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken (accessToken: string): Promise<AccountModel> {
      return (makeFakeAccount())
    }
  }
  return new LoadAccountByTokenRepositoryStub()
}

interface SutTypes {
  sut: DbLoadTaboolaAccountInfo,
  loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
  decrypterStub: Decrypter,
}

const makeSut = (): SutTypes => {
  const decrypterStub = makeDecrypter()
  const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepository()
  const sut = new DbLoadTaboolaAccountInfo(decrypterStub, loadAccountByTokenRepositoryStub)
  return {
    sut,
    loadAccountByTokenRepositoryStub,
    decrypterStub
  }
}

describe('DbLoadTaboolaAccountInfo', () => {
  describe('Decrypter', () => {
    test('Should call Decrypter with correct values', async () => {
      const { sut, decrypterStub } = makeSut()
      const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
      await sut.loadInfo('any_token')
      expect(decryptSpy).toHaveBeenCalledWith(makeFakeAccount().taboola_info)
    })
  
    test('Should throw if Decrypter throws', async () => {
      const { sut, decrypterStub } = makeSut()
      jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadInfo('any_token')
      expect(promise).rejects.toThrow()
    })
  })

  describe('LoadAccountByTokenRepository', () => {
    test('Should call LoadAccountByTokenRepository with correct values', async () => {
      const { sut, loadAccountByTokenRepositoryStub } = makeSut()
      const addSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
      await sut.loadInfo('any_token')
      expect(addSpy).toHaveBeenCalledWith('any_token')
    })
  
    test('Should throw if LoadAccountByTokenRepository throws', async () => {
      const { sut, loadAccountByTokenRepositoryStub } = makeSut()
      jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.loadInfo('any_token')
      expect(promise).rejects.toThrow()
    })
  })
})