/* eslint-disable no-undef */
import { ChangePassRepository } from '../../protocols/db/account/change-pass-repository'
import { AccountModel, Hasher } from '../authentication/db-authentication-protocols'
import { DbChangePass } from './db-change-pass'

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return new Promise(resolve => resolve('hashed_password'))
    }
  }
  return new HasherStub()
}

const makeChangePassRepository = (): ChangePassRepository => {
  class ChangePassRepositoryStub implements ChangePassRepository {
    async changePassword (id_user: number, hashed_pass:string): Promise<void> {
     
    }
  }
  return new ChangePassRepositoryStub()
}

interface SutTypes {
  sut: DbChangePass
  hasherStub: Hasher
  changePassRepositoryStub: ChangePassRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const changePassRepositoryStub = makeChangePassRepository()
  const sut = new DbChangePass(hasherStub, changePassRepositoryStub)
  return {
    sut,
    hasherStub,
    changePassRepositoryStub
  }
}

describe('DbAddAccouont', () => {
  test('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hasherSpy = jest.spyOn(hasherStub, 'hash')
    await sut.change(1, 'any_pass')
    expect(hasherSpy).toHaveBeenCalledWith('any_pass')
  })

  test('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.change(1, 'any_pass')
    await expect(promise).rejects.toThrow()
  })

  test('Should call ChangePassRepository with correct password', async () => {
    const { sut, changePassRepositoryStub } = makeSut()
    const hasherSpy = jest.spyOn(changePassRepositoryStub, 'changePassword')
    await sut.change(1, 'any_pass')
    expect(hasherSpy).toHaveBeenCalledWith(1, 'hashed_password')
  })

  test('Should throw if ChangePassRepository throws', async () => {
    const { sut, changePassRepositoryStub } = makeSut()
    jest.spyOn(changePassRepositoryStub, 'changePassword').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.change(1, 'any_pass')
    await expect(promise).rejects.toThrow()
  })
})
