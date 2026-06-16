import { CampaignMetaAccessModel } from "../../../domain/models/campaign-meta-access"
import { CampaignModel } from "../../../domain/models/campaign"
import { DbSavePixelInfo } from "./db-save-pixel-info"
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign"
import { CampaignMetaAccessRow, LoadCampaignMetaAccessRepository } from "../../protocols/db/campaign-meta-access/load-campaign-meta-access-repository"
import { SaveCampaignMetaAccessRepository } from "../../protocols/db/campaign-meta-access/save-campaign-meta-access-repository"

const makeLoadCampaignRepository = (): LoadCampaignRepository => {
  class LoadCampaignRepositoryStub implements LoadCampaignRepository {
    async loadCampaign (id_campaign: number): Promise<CampaignModel | null> {
      return {
        id: id_campaign,
        id_user: 1,
        name: 'campaign',
        link: 'link',
        click_auth: 'click_auth',
        ad_provider: 'meta',
        conversion_name: 'conversion',
        checkout_provider: 'checkout'
      }
    }
  }

  return new LoadCampaignRepositoryStub()
}

const makeLoadCampaignMetaAccessRepository = (): LoadCampaignMetaAccessRepository => {
  class LoadCampaignMetaAccessRepositoryStub implements LoadCampaignMetaAccessRepository {
    async loadByCampaignId (idCampaign: number): Promise<CampaignMetaAccessRow | null> {
      return null
    }
  }

  return new LoadCampaignMetaAccessRepositoryStub()
}

const makeSaveCampaignMetaAccessRepository = (): SaveCampaignMetaAccessRepository => {
  class SaveCampaignMetaAccessRepositoryStub implements SaveCampaignMetaAccessRepository {
    async save (pixelInfo: CampaignMetaAccessRow): Promise<void> {}
  }

  return new SaveCampaignMetaAccessRepositoryStub()
}

type SutTypes = {
  sut: DbSavePixelInfo
  loadCampaignRepositoryStub: LoadCampaignRepository
  loadCampaignMetaAccessRepositoryStub: LoadCampaignMetaAccessRepository
  saveCampaignMetaAccessRepositoryStub: SaveCampaignMetaAccessRepository
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const loadCampaignMetaAccessRepositoryStub = makeLoadCampaignMetaAccessRepository()
  const saveCampaignMetaAccessRepositoryStub = makeSaveCampaignMetaAccessRepository()
  const sut = new DbSavePixelInfo(
    loadCampaignRepositoryStub,
    loadCampaignMetaAccessRepositoryStub,
    saveCampaignMetaAccessRepositoryStub
  )

  return {
    sut,
    loadCampaignRepositoryStub,
    loadCampaignMetaAccessRepositoryStub,
    saveCampaignMetaAccessRepositoryStub
  }
}

const makePixelInfo = (): CampaignMetaAccessModel => ({
  idCampaign: 1,
  accessToken: 'any_token',
  pixelId: 'pixel_123'
})

describe('DbSavePixelInfo', () => {
  test('Should return null if campaign does not belong to user', async () => {
    const { sut, loadCampaignRepositoryStub } = makeSut()
    jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockResolvedValueOnce({
      id: 1,
      id_user: 2,
      name: 'campaign',
      link: 'link',
      click_auth: 'click_auth',
      ad_provider: 'meta',
      conversion_name: 'conversion',
      checkout_provider: 'checkout'
    })

    const result = await sut.save(1, makePixelInfo())

    expect(result).toBeNull()
  })

  test('Should lookup existing campaign meta access row', async () => {
    const { sut, loadCampaignMetaAccessRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadCampaignMetaAccessRepositoryStub, 'loadByCampaignId')

    await sut.save(1, makePixelInfo())

    expect(loadSpy).toHaveBeenCalledWith(1)
  })

  test('Should save pixel info with correct DB mapping', async () => {
    const { sut, saveCampaignMetaAccessRepositoryStub } = makeSut()
    const saveSpy = jest.spyOn(saveCampaignMetaAccessRepositoryStub, 'save')

    await sut.save(1, makePixelInfo())

    expect(saveSpy).toHaveBeenCalledWith({
      id_campaign: 1,
      access_token: 'any_token',
      pixel_id: 'pixel_123'
    })
  })

  test('Should return saved object on success', async () => {
    const { sut } = makeSut()

    const result = await sut.save(1, makePixelInfo())

    expect(result).toEqual(makePixelInfo())
  })

  test('Should propagate repository errors', async () => {
    const { sut, saveCampaignMetaAccessRepositoryStub } = makeSut()
    jest.spyOn(saveCampaignMetaAccessRepositoryStub, 'save').mockRejectedValueOnce(new Error('db error'))

    await expect(sut.save(1, makePixelInfo())).rejects.toThrow('db error')
  })
})
