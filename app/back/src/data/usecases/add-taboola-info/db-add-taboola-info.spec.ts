import { Encrypter } from "../../protocols/criptography/encrypter"
import { AddTaboolaInfoRepository } from '../../protocols/db/account/add-taboola-info-repository'
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { LoadUsedTaboolaAccountByIdRepository, UsedTaboolaAccountModel } from "../../protocols/db/used-taboola-account/load-used-taboola-account-by-id-repository"
import { SaveUsedTaboolaAccountRepository } from "../../protocols/db/used-taboola-account/save-used-taboola-account-repository"
import { CreateTbToken } from "../../protocols/external-apis/create-taboola-token"
import { DbAddTaboolaInfo } from './db-add-taboola-info'
import { ProviderAccountInUseError } from "../../../presentation/errors"

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (id: number): Promise<string> {
      return new Promise(resolve => resolve('encrypted_info'))
    }
  }
  return new EncrypterStub()
}

const makeAddTaboolaInfoRepository = (): AddTaboolaInfoRepository => {
  class AddTaboolaInfoRepositoryStub implements AddTaboolaInfoRepository {
    async addTaboolaInfo (idUser: number, encryptedInfo: string): Promise<void> {
    }
  }
  return new AddTaboolaInfoRepositoryStub()
}

const makeCreateTbToken = (): CreateTbToken => {
  class CreateTbTokenStub implements CreateTbToken {
    async createAccessToken (idUser: number, encryptedInfo: string): Promise<string> {
      return 'any_token'
    }
  }
  return new CreateTbTokenStub()
}

const makeUpdateByIdRepository = (): UpdateByIdRepository => {
  class UpdateByIdRepositoryStub implements UpdateByIdRepository {
    async updateById (id: number, columnToUpdate: string, value: string): Promise<void> {
    }
  }
  return new UpdateByIdRepositoryStub()
}

const makeLoadUsedTaboolaAccountByIdRepository = (): LoadUsedTaboolaAccountByIdRepository => {
  class LoadUsedTaboolaAccountByIdRepositoryStub implements LoadUsedTaboolaAccountByIdRepository {
    async loadByTaboolaId (taboolaId: string): Promise<UsedTaboolaAccountModel | null> {
      return null
    }
  }
  return new LoadUsedTaboolaAccountByIdRepositoryStub()
}

const makeSaveUsedTaboolaAccountRepository = (): SaveUsedTaboolaAccountRepository => {
  class SaveUsedTaboolaAccountRepositoryStub implements SaveUsedTaboolaAccountRepository {
    async save (idUser: number, taboolaId: string): Promise<void> {
    }
  }
  return new SaveUsedTaboolaAccountRepositoryStub()
}

interface SutTypes {
  sut: DbAddTaboolaInfo,
  encrypterStub: Encrypter,
  addTaboolaInfoRepositoryStub: AddTaboolaInfoRepository,
  updateByIdRepositoryStub: UpdateByIdRepository,
  loadUsedTaboolaAccountByIdRepositoryStub: LoadUsedTaboolaAccountByIdRepository,
  saveUsedTaboolaAccountRepositoryStub: SaveUsedTaboolaAccountRepository,
  createTbTokenStub: CreateTbToken
}

const makeFakeTaboolaInfo = () => ({
  accoutId: 'any_account',
  clientId: 'any_client',
  clientSecret: 'any_secret'
})

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter()
  const addTaboolaInfoRepositoryStub = makeAddTaboolaInfoRepository()
  const updateByIdRepositoryStub = makeUpdateByIdRepository()
  const loadUsedTaboolaAccountByIdRepositoryStub = makeLoadUsedTaboolaAccountByIdRepository()
  const saveUsedTaboolaAccountRepositoryStub = makeSaveUsedTaboolaAccountRepository()
  const createTbTokenStub = makeCreateTbToken()
  const sut = new DbAddTaboolaInfo(
    encrypterStub,
    addTaboolaInfoRepositoryStub,
    updateByIdRepositoryStub,
    loadUsedTaboolaAccountByIdRepositoryStub,
    saveUsedTaboolaAccountRepositoryStub,
    createTbTokenStub
  )
  return {
    sut,
    encrypterStub,
    addTaboolaInfoRepositoryStub,
    updateByIdRepositoryStub,
    loadUsedTaboolaAccountByIdRepositoryStub,
    saveUsedTaboolaAccountRepositoryStub,
    createTbTokenStub
  }
}

describe('DbAddTaboolaInfo', () => {
  describe('Encrypter', () => {
    test('Should call Encrypter with correct values', async () => {
      const { sut, encrypterStub } = makeSut()
      const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
      await sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      expect(encryptSpy).toHaveBeenCalledWith(makeFakeTaboolaInfo())
    })
  
    test('Should throw if Encrypter returns throw', async () => {
      const { sut, encrypterStub } = makeSut()
      jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      expect(promise).rejects.toThrow()
    })
  })

  describe('AddTaboolaInfoRepository', () => {
    test('Should call AddTaboolaInfoRepository with correct values', async () => {
      const { sut, addTaboolaInfoRepositoryStub } = makeSut()
      const addSpy = jest.spyOn(addTaboolaInfoRepositoryStub, 'addTaboolaInfo')
      await sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      expect(addSpy).toHaveBeenCalledWith(1, 'encrypted_info')
    })
  
    test('Should return throw if Encrypter returns throw', async () => {
      const { sut, addTaboolaInfoRepositoryStub } = makeSut()
      jest.spyOn(addTaboolaInfoRepositoryStub, 'addTaboolaInfo').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      expect(promise).rejects.toThrow()
    })
  })

  describe('UsedTaboolaAccount', () => {
    test('Should save used taboola account on success', async () => {
      const { sut, saveUsedTaboolaAccountRepositoryStub } = makeSut()
      const saveSpy = jest.spyOn(saveUsedTaboolaAccountRepositoryStub, 'save')
      await sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      expect(saveSpy).toHaveBeenCalledWith(1, 'any_account')
    })

    test('Should not save used taboola account again when same user reconnects', async () => {
      const { sut, loadUsedTaboolaAccountByIdRepositoryStub, saveUsedTaboolaAccountRepositoryStub } = makeSut()
      jest.spyOn(loadUsedTaboolaAccountByIdRepositoryStub, 'loadByTaboolaId').mockResolvedValueOnce({
        id_user: 1,
        taboola_id: 'any_account'
      })
      const saveSpy = jest.spyOn(saveUsedTaboolaAccountRepositoryStub, 'save')
      await sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      expect(saveSpy).not.toHaveBeenCalled()
    })

    test('Should block and throw if taboola account belongs to another user', async () => {
      const { sut, loadUsedTaboolaAccountByIdRepositoryStub, updateByIdRepositoryStub } = makeSut()
      jest.spyOn(loadUsedTaboolaAccountByIdRepositoryStub, 'loadByTaboolaId').mockResolvedValueOnce({
        id_user: 2,
        taboola_id: 'any_account'
      })
      const updateSpy = jest.spyOn(updateByIdRepositoryStub, 'updateById')
      const promise = sut.addInfo(1, 'any_account', 'any_client', 'any_secret')
      await expect(promise).rejects.toEqual(new ProviderAccountInUseError())
      expect(updateSpy).toHaveBeenCalledWith(1, 'allow_clicks', '0')
    })
  })
})
