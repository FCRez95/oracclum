/* eslint-disable no-undef */
import { DbRegisterWaitList } from './db-register-wait-list'
import { CheckEmailRegisteredRepository } from '../../protocols/db/wait-list/check-email-registered-repository'
import { WaitListModel } from '../../../domain/models/wait-list'
import { AddWaitListRepository } from '../../protocols/db/wait-list/register-wait-list-repository'
import { AddWaitListModel } from '../../../domain/usecases/wait-list/register-wait-list'

const makeFakeWaitListData = () => ({
  id: 1,
  name: 'any_name',
  email: 'any_mail',
  cel: 'any_cel'
})

const makeFakeAddWaitListData = () => ({
  name: 'any_name',
  email: 'any_mail',
  cel: 'any_cel'
})

const makeCheckEmailRegisteredRepository = (): CheckEmailRegisteredRepository => {
  class CheckEmailRegisteredRepositoryStub implements CheckEmailRegisteredRepository {
    async check (email: string): Promise<WaitListModel | null> {
      return new Promise(resolve => resolve(null))
    }
  }
  return new CheckEmailRegisteredRepositoryStub()
}

const makeAddWaitListRepository = (): AddWaitListRepository => {
  class AddWaitListRepositoryStub implements AddWaitListRepository {
    async add (client: AddWaitListModel): Promise<WaitListModel> {
      return new Promise(resolve => resolve(makeFakeWaitListData()))
    }
  }
  return new AddWaitListRepositoryStub()
}

interface SutTypes {
  sut: DbRegisterWaitList
  checkEmailRegisteredRepositoryStub: CheckEmailRegisteredRepository
  addWaitListRepositoryStub: AddWaitListRepository
}

const makeSut = (): SutTypes => {
  const checkEmailRegisteredRepositoryStub = makeCheckEmailRegisteredRepository()
  const addWaitListRepositoryStub = makeAddWaitListRepository()
  const sut = new DbRegisterWaitList(checkEmailRegisteredRepositoryStub, addWaitListRepositoryStub)
  return {
    sut,
    checkEmailRegisteredRepositoryStub,
    addWaitListRepositoryStub
  }
}

describe('DbRegisterWaitList', () => {
  describe('CheckEmailRegisteredRepository', () => {
    test('Should return an null if CheckEmailRegisteredRepository returns an account', async () => {
      const { sut, checkEmailRegisteredRepositoryStub } = makeSut()
      jest.spyOn(checkEmailRegisteredRepositoryStub, 'check').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeWaitListData())))
      const newClient = await sut.register(makeFakeAddWaitListData())
      expect(newClient).toBeNull()
    })
  
    test('Should call CheckEmailRegisteredRepository with correct email', async () => {
      const { sut, checkEmailRegisteredRepositoryStub } = makeSut()
      const loadSpy = jest.spyOn(checkEmailRegisteredRepositoryStub, 'check')
      await sut.register(makeFakeAddWaitListData())
      expect(loadSpy).toHaveBeenCalledWith('any_mail')
    })
  })

  describe('AddWaitListRepository', () => {
    test('Should call AddWaitListRepository with correct values', async () => {
      const { sut, addWaitListRepositoryStub } = makeSut()
      const addSpy = jest.spyOn(addWaitListRepositoryStub, 'add')
      await sut.register(makeFakeAddWaitListData())
      expect(addSpy).toHaveBeenCalledWith(makeFakeAddWaitListData())
    })
  
    test('Should throw if AddWaitListRepository throws', async () => {
      const { sut, addWaitListRepositoryStub } = makeSut()
      jest.spyOn(addWaitListRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.register(makeFakeAddWaitListData())
      await expect(promise).rejects.toThrow()
    })
  })

  test('Should return a new client on success', async () => {
    const { sut } = makeSut()
    const client = await sut.register(makeFakeAddWaitListData())
    expect(client).toEqual(makeFakeWaitListData())
  })
})
