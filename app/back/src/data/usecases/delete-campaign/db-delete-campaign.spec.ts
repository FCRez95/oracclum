import { LoadCampaignRepository } from '../../protocols/db/campaign/load-campaign'
import { DeleteCampaignRepository } from '../../protocols/db/campaign/delete-campaign-repository'
import { CampaignModel } from '../add-campaign/db-add-campaign-protocols'
import { DbDeleteCampaign } from './db-delete-campaign'

const makeFakeCampaign = () => ({
  id: 2,
  id_user: 1,
  name: 'any_name',
  link: 'any_link',
  ad_provider: 'any_provider',
  conversion_name: 'any_conversion',
  checkout_provider: 'any_checkout',
  total_clicks: 0,
  total_sales: 0,
  expenses: 0,
  total_checkout: 0,
  revenue: 0,
  click_auth: 'any_token'
})

const makeLoadCampaignRepository = (): LoadCampaignRepository => {
  class LoadCampaignRepositoryStub implements LoadCampaignRepository {
    async loadCampaign (id_campaign:number): Promise<CampaignModel> {
      return new Promise(resolve => resolve(makeFakeCampaign()))
    }
  }
  return new LoadCampaignRepositoryStub()
}

const makeDeleteCampaignRepository = (): DeleteCampaignRepository => {
  class DeleteCampaignRepositoryStub implements DeleteCampaignRepository {
    async delete (id_campaign:number): Promise<void> {
    }
  }
  return new DeleteCampaignRepositoryStub()
}

interface SutTypes {
  sut: DbDeleteCampaign
  loadCampaignRepositoryStub: LoadCampaignRepository
  deleteCampaignRepositoryStub: DeleteCampaignRepository
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const deleteCampaignRepositoryStub = makeDeleteCampaignRepository()

  const sut = new DbDeleteCampaign(loadCampaignRepositoryStub, deleteCampaignRepositoryStub)
  return {
    sut,
    loadCampaignRepositoryStub,
    deleteCampaignRepositoryStub
  }
}

describe('DbDeleteCampaign', () => {
  describe('LoadCampaignRepository', () => {
    test('Should call LoadCampaignRepository with correct values', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      const loadCampaignsSpy = jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign')
      await sut.delete(1, 1)
      expect(loadCampaignsSpy).toHaveBeenCalledWith(1)
    })

    test('Should throw if LoadCampaignRepository throws', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.delete(1,1)
      await expect(promise).rejects.toThrow()
    })

    test('Should return null if LoadCampaignRepository returns null', async () => {
      const { sut, loadCampaignRepositoryStub } = makeSut()
      jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockReturnValueOnce(new Promise(resolve => resolve(null)))
      const adsSummary = await sut.delete(1,1)
      expect(adsSummary).toBeNull()
    })
  })

  describe('DeleteCampaignRepository', () => {
    test('Should call DeleteCampaignRepository with correct values', async () => {
      const { sut, deleteCampaignRepositoryStub } = makeSut()
      const deleteSpy = jest.spyOn(deleteCampaignRepositoryStub, 'delete')
      await sut.delete(1, 1)
      expect(deleteSpy).toHaveBeenCalledWith(1)
    })

    test('Should throw if DeleteCampaignRepository throws', async () => {
      const { sut, deleteCampaignRepositoryStub } = makeSut()
      jest.spyOn(deleteCampaignRepositoryStub, 'delete').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
      const promise = sut.delete(1,1)
      await expect(promise).rejects.toThrow()
    })
  })
})
