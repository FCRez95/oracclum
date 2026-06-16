import { DbClearAccountData } from "./db-clear-account-data"
import { LoadAccountByIdRepository } from "../../protocols/db/account/load-account-by-id-repository"
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { DeleteAllowedMetaAccountsRepository } from "../../protocols/db/allowed-meta-account/delete-allowed-meta-accounts-repository"
import { DeleteCampaignRepository } from "../../protocols/db/campaign/delete-campaign-repository"
import { LoadUserCampaignsRepository } from "../../protocols/db/campaign/load-user-campaigns-repository"
import { DeleteUserConsentsRepository } from "../../protocols/db/user-consents/delete-user-consents-repository"
import { RemoveClickAuth } from "../../protocols/external-apis/remove-click-auth"
import { AccountModel } from "../../../domain/models/account"
import { CampaignModel } from "../../../domain/models/campaign"

const makeLoadAccountByIdRepository = (): LoadAccountByIdRepository => {
  class LoadAccountByIdRepositoryStub implements LoadAccountByIdRepository {
    async loadById (id: number): Promise<AccountModel | null> {
      return {
        id,
        name: 'any_name',
        email: 'any@email.com',
        password: 'any_password',
        cpfcnpj: '123',
        phone: '123',
        user_type: 'cli',
        allow_clicks: true
      }
    }
  }
  return new LoadAccountByIdRepositoryStub()
}

const makeLoadUserCampaignsRepository = (): LoadUserCampaignsRepository => {
  class LoadUserCampaignsRepositoryStub implements LoadUserCampaignsRepository {
    async loadUserCampaigns (idUser: number): Promise<CampaignModel[]> {
      return [{
        id: 1,
        id_user: idUser,
        name: 'campaign',
        link: 'link',
        click_auth: 'click_auth_1',
        ad_provider: 'taboola',
        conversion_name: 'conv',
        checkout_provider: 'checkout'
      }]
    }
  }
  return new LoadUserCampaignsRepositoryStub()
}

const makeDeleteCampaignRepository = (): DeleteCampaignRepository => {
  class DeleteCampaignRepositoryStub implements DeleteCampaignRepository {
    async delete (id_campaign: number): Promise<void> {
    }
  }
  return new DeleteCampaignRepositoryStub()
}

const makeUpdateByIdRepository = (): UpdateByIdRepository => {
  class UpdateByIdRepositoryStub implements UpdateByIdRepository {
    async updateById (id: number, columnToUpdate: string, value: string): Promise<void> {
    }
  }
  return new UpdateByIdRepositoryStub()
}

const makeDeleteAllowedMetaAccountsRepository = (): DeleteAllowedMetaAccountsRepository => {
  class DeleteAllowedMetaAccountsRepositoryStub implements DeleteAllowedMetaAccountsRepository {
    async deleteByUser (idUser: number): Promise<void> {
    }
  }
  return new DeleteAllowedMetaAccountsRepositoryStub()
}

const makeDeleteUserConsentsRepository = (): DeleteUserConsentsRepository => {
  class DeleteUserConsentsRepositoryStub implements DeleteUserConsentsRepository {
    async deleteByUser (idUser: number): Promise<void> {
    }
  }
  return new DeleteUserConsentsRepositoryStub()
}

const makeRemoveClickAuth = (): RemoveClickAuth => {
  class RemoveClickAuthStub implements RemoveClickAuth {
    async remove (click_auth: string, campaign_id: number, ad_provider: string): Promise<void> {
    }
  }
  return new RemoveClickAuthStub()
}

type SutTypes = {
  sut: DbClearAccountData
  loadAccountByIdRepositoryStub: LoadAccountByIdRepository
  loadUserCampaignsRepositoryStub: LoadUserCampaignsRepository
  deleteCampaignRepositoryStub: DeleteCampaignRepository
  updateByIdRepositoryStub: UpdateByIdRepository
  deleteAllowedMetaAccountsRepositoryStub: DeleteAllowedMetaAccountsRepository
  deleteUserConsentsRepositoryStub: DeleteUserConsentsRepository
  removeClickAuthStub: RemoveClickAuth
}

const makeSut = (): SutTypes => {
  const loadAccountByIdRepositoryStub = makeLoadAccountByIdRepository()
  const loadUserCampaignsRepositoryStub = makeLoadUserCampaignsRepository()
  const deleteCampaignRepositoryStub = makeDeleteCampaignRepository()
  const updateByIdRepositoryStub = makeUpdateByIdRepository()
  const deleteAllowedMetaAccountsRepositoryStub = makeDeleteAllowedMetaAccountsRepository()
  const deleteUserConsentsRepositoryStub = makeDeleteUserConsentsRepository()
  const removeClickAuthStub = makeRemoveClickAuth()

  const sut = new DbClearAccountData(
    loadAccountByIdRepositoryStub,
    loadUserCampaignsRepositoryStub,
    deleteCampaignRepositoryStub,
    updateByIdRepositoryStub,
    deleteAllowedMetaAccountsRepositoryStub,
    deleteUserConsentsRepositoryStub,
    removeClickAuthStub
  )

  return {
    sut,
    loadAccountByIdRepositoryStub,
    loadUserCampaignsRepositoryStub,
    deleteCampaignRepositoryStub,
    updateByIdRepositoryStub,
    deleteAllowedMetaAccountsRepositoryStub,
    deleteUserConsentsRepositoryStub,
    removeClickAuthStub
  }
}

describe('DbClearAccountData', () => {
  test('Should return null if account does not exist', async () => {
    const { sut, loadAccountByIdRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByIdRepositoryStub, 'loadById').mockResolvedValueOnce(null)
    const result = await sut.clear(1)
    expect(result).toBeNull()
  })

  test('Should remove only the user campaign click_auths before deleting campaigns', async () => {
    const { sut, removeClickAuthStub, deleteCampaignRepositoryStub } = makeSut()
    const removeSpy = jest.spyOn(removeClickAuthStub, 'remove')
    const deleteSpy = jest.spyOn(deleteCampaignRepositoryStub, 'delete')

    await sut.clear(1)

    expect(removeSpy).toHaveBeenCalledWith('click_auth_1', 1, 'taboola')
    expect(deleteSpy).toHaveBeenCalledWith(1)
  })

  test('Should clear integration fields and user related tables', async () => {
    const {
      sut,
      updateByIdRepositoryStub,
      deleteAllowedMetaAccountsRepositoryStub,
      deleteUserConsentsRepositoryStub
    } = makeSut()
    const updateSpy = jest.spyOn(updateByIdRepositoryStub, 'updateById')
    const deleteAllowedSpy = jest.spyOn(deleteAllowedMetaAccountsRepositoryStub, 'deleteByUser')
    const deleteConsentsSpy = jest.spyOn(deleteUserConsentsRepositoryStub, 'deleteByUser')

    await sut.clear(1)

    expect(updateSpy).toHaveBeenNthCalledWith(1, 1, 'taboola_info', null)
    expect(updateSpy).toHaveBeenNthCalledWith(2, 1, 'taboola_access_token', null)
    expect(updateSpy).toHaveBeenNthCalledWith(3, 1, 'meta_access_token', null)
    expect(deleteAllowedSpy).toHaveBeenCalledWith(1)
    expect(deleteConsentsSpy).toHaveBeenCalledWith(1)
  })

  test('Should stop if removing click auth fails', async () => {
    const { sut, removeClickAuthStub, deleteCampaignRepositoryStub } = makeSut()
    jest.spyOn(removeClickAuthStub, 'remove').mockRejectedValueOnce(new Error('remove failed'))
    const deleteSpy = jest.spyOn(deleteCampaignRepositoryStub, 'delete')

    await expect(sut.clear(1)).rejects.toThrow('remove failed')
    expect(deleteSpy).not.toHaveBeenCalled()
  })
})
