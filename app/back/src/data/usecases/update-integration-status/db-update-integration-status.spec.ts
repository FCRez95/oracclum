import { CampaignModel } from "../../../domain/models/campaign"
import { IntegrationStatusModel } from "../../../domain/models/integration-status"
import { DbUpdateIntegrationStatus } from "./db-update-integration-status"
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign"
import { LoadIntegrationStatusRepository, SaveIntegrationStatusRepository, UpdateIntegrationStatusStepRepository } from "../../protocols/db/integration-status/load-integration-status-repository"

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
        conversion_name: 'conv',
        checkout_provider: 'checkout'
      }
    }
  }

  return new LoadCampaignRepositoryStub()
}

const makeLoadIntegrationStatusRepository = (): LoadIntegrationStatusRepository => {
  class LoadIntegrationStatusRepositoryStub implements LoadIntegrationStatusRepository {
    async loadByCampaignId (idCampaign: number): Promise<IntegrationStatusModel | null> {
      return {
        id_campaign: idCampaign,
        ad_provider: 1,
        funnel: 0,
        checkout: 0,
        test: 0
      }
    }
  }

  return new LoadIntegrationStatusRepositoryStub()
}

const makeSaveIntegrationStatusRepository = (): SaveIntegrationStatusRepository => {
  class SaveIntegrationStatusRepositoryStub implements SaveIntegrationStatusRepository {
    async save (status: IntegrationStatusModel): Promise<void> {}
  }

  return new SaveIntegrationStatusRepositoryStub()
}

const makeUpdateIntegrationStatusStepRepository = (): UpdateIntegrationStatusStepRepository => {
  class UpdateIntegrationStatusStepRepositoryStub implements UpdateIntegrationStatusStepRepository {
    async updateStep (idCampaign: number, step: 'ad_provider' | 'funnel' | 'checkout' | 'test', status: 0 | 1): Promise<void> {}
  }

  return new UpdateIntegrationStatusStepRepositoryStub()
}

type SutTypes = {
  sut: DbUpdateIntegrationStatus
  loadCampaignRepositoryStub: LoadCampaignRepository
  loadIntegrationStatusRepositoryStub: LoadIntegrationStatusRepository
  saveIntegrationStatusRepositoryStub: SaveIntegrationStatusRepository
  updateIntegrationStatusStepRepositoryStub: UpdateIntegrationStatusStepRepository
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const loadIntegrationStatusRepositoryStub = makeLoadIntegrationStatusRepository()
  const saveIntegrationStatusRepositoryStub = makeSaveIntegrationStatusRepository()
  const updateIntegrationStatusStepRepositoryStub = makeUpdateIntegrationStatusStepRepository()
  const sut = new DbUpdateIntegrationStatus(
    loadCampaignRepositoryStub,
    loadIntegrationStatusRepositoryStub,
    saveIntegrationStatusRepositoryStub,
    updateIntegrationStatusStepRepositoryStub
  )

  return {
    sut,
    loadCampaignRepositoryStub,
    loadIntegrationStatusRepositoryStub,
    saveIntegrationStatusRepositoryStub,
    updateIntegrationStatusStepRepositoryStub
  }
}

describe('DbUpdateIntegrationStatus', () => {
  test('Should return null when campaign does not belong to user', async () => {
    const { sut, loadCampaignRepositoryStub } = makeSut()
    jest.spyOn(loadCampaignRepositoryStub, 'loadCampaign').mockResolvedValueOnce({
      id: 1,
      id_user: 2,
      name: 'campaign',
      link: 'link',
      click_auth: 'click_auth',
      ad_provider: 'meta',
      conversion_name: 'conv',
      checkout_provider: 'checkout'
    })

    const result = await sut.update(1, { idCampaign: 1, step: 'funnel', status: 1 })

    expect(result).toBeNull()
  })

  test('Should create a new row when integration status does not exist', async () => {
    const { sut, loadIntegrationStatusRepositoryStub, saveIntegrationStatusRepositoryStub } = makeSut()
    jest.spyOn(loadIntegrationStatusRepositoryStub, 'loadByCampaignId').mockResolvedValueOnce(null)
    const saveSpy = jest.spyOn(saveIntegrationStatusRepositoryStub, 'save')

    const result = await sut.update(1, { idCampaign: 1, step: 'checkout', status: 1 })

    expect(saveSpy).toHaveBeenCalledWith({
      id_campaign: 1,
      ad_provider: 0,
      funnel: 0,
      checkout: 1,
      test: 0
    })
    expect(result).toEqual({
      id_campaign: 1,
      ad_provider: 0,
      funnel: 0,
      checkout: 1,
      test: 0
    })
  })

  test('Should update only requested step when row exists', async () => {
    const { sut, updateIntegrationStatusStepRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateIntegrationStatusStepRepositoryStub, 'updateStep')

    const result = await sut.update(1, { idCampaign: 1, step: 'funnel', status: 1 })

    expect(updateSpy).toHaveBeenCalledWith(1, 'funnel', 1)
    expect(result).toEqual({
      id_campaign: 1,
      ad_provider: 1,
      funnel: 1,
      checkout: 0,
      test: 0
    })
  })

  test('Should allow setting status back to 0', async () => {
    const { sut, updateIntegrationStatusStepRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateIntegrationStatusStepRepositoryStub, 'updateStep')

    const result = await sut.update(1, { idCampaign: 1, step: 'ad_provider', status: 0 })

    expect(updateSpy).toHaveBeenCalledWith(1, 'ad_provider', 0)
    expect(result).toEqual({
      id_campaign: 1,
      ad_provider: 0,
      funnel: 0,
      checkout: 0,
      test: 0
    })
  })

  test('Should propagate repository errors', async () => {
    const { sut, updateIntegrationStatusStepRepositoryStub } = makeSut()
    jest.spyOn(updateIntegrationStatusStepRepositoryStub, 'updateStep').mockRejectedValueOnce(new Error('db error'))

    await expect(sut.update(1, { idCampaign: 1, step: 'funnel', status: 1 })).rejects.toThrow('db error')
  })
})
