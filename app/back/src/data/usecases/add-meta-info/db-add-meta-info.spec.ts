import { DbAddMetaInfo } from "./db-add-meta-info"
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { SaveAllowedMetaAccountsRepository } from "../../protocols/db/allowed-meta-account/save-allowed-meta-accounts-repository"
import { LoadUsedMetaAccountsByIdsRepository, UsedMetaAccountModel } from "../../protocols/db/used-meta-account/load-used-meta-accounts-by-ids-repository"
import { SaveUsedMetaAccountsRepository } from "../../protocols/db/used-meta-account/save-used-meta-accounts-repository"
import { AllowedMetaAccount } from "../../../domain/usecases/integrations/add-meta-info"
import { ProviderAccountInUseError } from "../../../presentation/errors"

const makeUpdateByIdRepository = (): UpdateByIdRepository => {
  class UpdateByIdRepositoryStub implements UpdateByIdRepository {
    async updateById (id: number, columnToUpdate: string, value: string): Promise<void> {
    }
  }
  return new UpdateByIdRepositoryStub()
}

const makeSaveAllowedMetaAccountsRepository = (): SaveAllowedMetaAccountsRepository => {
  class SaveAllowedMetaAccountsRepositoryStub implements SaveAllowedMetaAccountsRepository {
    async save (idUser: number, accounts: AllowedMetaAccount[]): Promise<void> {
    }
  }
  return new SaveAllowedMetaAccountsRepositoryStub()
}

const makeLoadUsedMetaAccountsByIdsRepository = (): LoadUsedMetaAccountsByIdsRepository => {
  class LoadUsedMetaAccountsByIdsRepositoryStub implements LoadUsedMetaAccountsByIdsRepository {
    async loadByMetaIds (metaIds: string[]): Promise<UsedMetaAccountModel[]> {
      return []
    }
  }
  return new LoadUsedMetaAccountsByIdsRepositoryStub()
}

const makeSaveUsedMetaAccountsRepository = (): SaveUsedMetaAccountsRepository => {
  class SaveUsedMetaAccountsRepositoryStub implements SaveUsedMetaAccountsRepository {
    async saveMany (idUser: number, metaIds: string[]): Promise<void> {
    }
  }
  return new SaveUsedMetaAccountsRepositoryStub()
}

type SutTypes = {
  sut: DbAddMetaInfo
  updateByIdRepositoryStub: UpdateByIdRepository
  saveAllowedMetaAccountsRepositoryStub: SaveAllowedMetaAccountsRepository
  loadUsedMetaAccountsByIdsRepositoryStub: LoadUsedMetaAccountsByIdsRepository
  saveUsedMetaAccountsRepositoryStub: SaveUsedMetaAccountsRepository
}

const makeSut = (): SutTypes => {
  const updateByIdRepositoryStub = makeUpdateByIdRepository()
  const saveAllowedMetaAccountsRepositoryStub = makeSaveAllowedMetaAccountsRepository()
  const loadUsedMetaAccountsByIdsRepositoryStub = makeLoadUsedMetaAccountsByIdsRepository()
  const saveUsedMetaAccountsRepositoryStub = makeSaveUsedMetaAccountsRepository()
  const sut = new DbAddMetaInfo(
    updateByIdRepositoryStub,
    saveAllowedMetaAccountsRepositoryStub,
    loadUsedMetaAccountsByIdsRepositoryStub,
    saveUsedMetaAccountsRepositoryStub
  )

  return {
    sut,
    updateByIdRepositoryStub,
    saveAllowedMetaAccountsRepositoryStub,
    loadUsedMetaAccountsByIdsRepositoryStub,
    saveUsedMetaAccountsRepositoryStub
  }
}

const makeAllowedAccounts = (): AllowedMetaAccount[] => ([
  { account_id: 'meta_1', name: 'Meta 1' },
  { account_id: 'meta_2', name: 'Meta 2' }
])

describe('DbAddMetaInfo', () => {
  test('Should save meta token and allowed accounts on success', async () => {
    const { sut, updateByIdRepositoryStub, saveAllowedMetaAccountsRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateByIdRepositoryStub, 'updateById')
    const saveAllowedSpy = jest.spyOn(saveAllowedMetaAccountsRepositoryStub, 'save')

    await sut.addInfo(1, 'any_token', makeAllowedAccounts())

    expect(updateSpy).toHaveBeenCalledWith(1, 'meta_access_token', 'any_token')
    expect(saveAllowedSpy).toHaveBeenCalledWith(1, makeAllowedAccounts())
  })

  test('Should save new used meta accounts on success', async () => {
    const { sut, saveUsedMetaAccountsRepositoryStub } = makeSut()
    const saveSpy = jest.spyOn(saveUsedMetaAccountsRepositoryStub, 'saveMany')

    await sut.addInfo(1, 'any_token', makeAllowedAccounts())

    expect(saveSpy).toHaveBeenCalledWith(1, ['meta_1', 'meta_2'])
  })

  test('Should not save already used accounts again when same user reconnects', async () => {
    const { sut, loadUsedMetaAccountsByIdsRepositoryStub, saveUsedMetaAccountsRepositoryStub } = makeSut()
    jest.spyOn(loadUsedMetaAccountsByIdsRepositoryStub, 'loadByMetaIds').mockResolvedValueOnce([
      { id_user: 1, meta_id: 'meta_1' }
    ])
    const saveSpy = jest.spyOn(saveUsedMetaAccountsRepositoryStub, 'saveMany')

    await sut.addInfo(1, 'any_token', makeAllowedAccounts())

    expect(saveSpy).toHaveBeenCalledWith(1, ['meta_2'])
  })

  test('Should block and throw if any meta account belongs to another user', async () => {
    const { sut, loadUsedMetaAccountsByIdsRepositoryStub, updateByIdRepositoryStub } = makeSut()
    jest.spyOn(loadUsedMetaAccountsByIdsRepositoryStub, 'loadByMetaIds').mockResolvedValueOnce([
      { id_user: 2, meta_id: 'meta_1' }
    ])
    const updateSpy = jest.spyOn(updateByIdRepositoryStub, 'updateById')

    const promise = sut.addInfo(1, 'any_token', makeAllowedAccounts())

    await expect(promise).rejects.toEqual(new ProviderAccountInUseError())
    expect(updateSpy).toHaveBeenCalledWith(1, 'allow_clicks', '0')
  })
})
