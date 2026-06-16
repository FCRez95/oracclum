/* eslint-disable no-undef */
import { DbLogout } from './db-logout'
import {
  AccountModel,
  LoadAccountByTokenRepository,
  UpdateAccessTokenRepository
} from './db-logout-protocols'

const makeFakeAccount = (): AccountModel => ({
  id: 1,
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'hashed_password',
  cpfcnpj: 'any_cpfcnpj',
  phone: 'any_phone',
  user_type: 'any_role',
  allow_clicks: true
})

const makeLoadAccountByTokenRepository = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken (access_token: string): Promise<AccountModel | null> {
      return new Promise(resolve => resolve(makeFakeAccount()))
    }
  }
  return new LoadAccountByTokenRepositoryStub()
}

const mekeUpdateAccessTokenRepository = (): UpdateAccessTokenRepository => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    async updateAccessToken (id: number, accessToken: string): Promise<void> {
      return
    }
  }
  return new UpdateAccessTokenRepositoryStub()
}

interface SutTypes {
  sut: DbLogout
  loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeSut = (): SutTypes => {
  const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepository()
  const updateAccessTokenRepositoryStub = mekeUpdateAccessTokenRepository()
  const sut = new DbLogout(
    loadAccountByTokenRepositoryStub,
    updateAccessTokenRepositoryStub
  )
  return {
    sut,
    loadAccountByTokenRepositoryStub,
    updateAccessTokenRepositoryStub
  }
}

describe('DbLogout usecase', () => {
  describe('LoadAccountByTokenRepository', () => {
    test('Should call LoadAccountByTokenRepository with correct email', async () => {
      const { sut, loadAccountByTokenRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
      await sut.logout(1, 'any_token')
      expect(loadSpy).toHaveBeenCalledWith('any_token')
    })

    test('Should throw if LoadAccountByTokenRepository throws', async () => {
      const { sut, loadAccountByTokenRepositoryStub } = makeSut()
      jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.logout(1, 'any_token')
      await expect(promise).rejects.toThrow()
    })
  })
  
  describe('UpdateAccessTokenRepository', () => {
    test('Should call UpdateAccessTokenRepository with correct values', async () => {
      const { sut, updateAccessTokenRepositoryStub } = makeSut()
      const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')
      await sut.logout(1, 'any_token')
      expect(updateSpy).toHaveBeenCalledWith(1, null)
    })

    test('Should return throw if UpdateAccessTokenRepository returns throw', async () => {
      const { sut, updateAccessTokenRepositoryStub } = makeSut()
      jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.logout(1, 'any_token')
      expect(promise).rejects.toThrow()
    })
  })

  test('Should return null on success', async () => {
    const { sut } = makeSut()
    const accessToken = await sut.logout(1, 'any_token')
    expect(accessToken).toBeNull()
  })
})
