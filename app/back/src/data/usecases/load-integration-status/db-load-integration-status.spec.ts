import { CampaignModel } from "../../../domain/models/campaign"
import { IntegrationStatusModel } from "../../../domain/models/integration-status"
import { DbLoadIntegrationStatus } from "./db-load-integration-status"
import { LoadCampaignRepository } from "../../protocols/db/campaign/load-campaign"
import { LoadIntegrationStatusRepository } from "../../protocols/db/integration-status/load-integration-status-repository"

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
        funnel: 1,
        checkout: 0,
        test: 0
      }
    }
  }

  return new LoadIntegrationStatusRepositoryStub()
}

type SutTypes = {
  sut: DbLoadIntegrationStatus
  loadCampaignRepositoryStub: LoadCampaignRepository
  loadIntegrationStatusRepositoryStub: LoadIntegrationStatusRepository
}

const makeSut = (): SutTypes => {
  const loadCampaignRepositoryStub = makeLoadCampaignRepository()
  const loadIntegrationStatusRepositoryStub = makeLoadIntegrationStatusRepository()
  const sut = new DbLoadIntegrationStatus(loadCampaignRepositoryStub, loadIntegrationStatusRepositoryStub)

  return {
    sut,
    loadCampaignRepositoryStub,
    loadIntegrationStatusRepositoryStub
  }
}

describe('DbLoadIntegrationStatus', () => {
  test('Should return unauthorized result if campaign does not belong to user', async () => {
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

    const result = await sut.load(1, 1)

    expect(result).toEqual({
      authorized: false,
      status: null
    })
  })

  test('Should return authorized result with no status when row does not exist', async () => {
    const { sut, loadIntegrationStatusRepositoryStub } = makeSut()
    jest.spyOn(loadIntegrationStatusRepositoryStub, 'loadByCampaignId').mockResolvedValueOnce(null)

    const result = await sut.load(1, 1)

    expect(result).toEqual({
      authorized: true,
      status: null
    })
  })

  test('Should return integration status on success', async () => {
    const { sut } = makeSut()

    const result = await sut.load(1, 1)

    expect(result).toEqual({
      authorized: true,
      status: {
        id_campaign: 1,
        ad_provider: 1,
        funnel: 1,
        checkout: 0,
        test: 0
      }
    })
  })
})
