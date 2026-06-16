import { ActivateAccount } from "../../../domain/usecases/account/activate-account"
import { LoadAccountByIdRepository } from "../../protocols/db/account/load-account-by-id-repository"
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { LoadUserCampaignsRepository } from "../../protocols/db/campaign/load-user-campaigns-repository"
import { RegisterClickAuth } from "../../protocols/external-apis/clicks-api"

export class DbActivateAccount implements ActivateAccount {
  private readonly loadAccountByIdRepository: LoadAccountByIdRepository
  private readonly updateByIdRepository: UpdateByIdRepository
  private readonly loadUserCampaignsRepository: LoadUserCampaignsRepository
  private readonly registerClickAuth: RegisterClickAuth

  constructor (
    loadAccountByIdRepository: LoadAccountByIdRepository,
    updateByIdRepository: UpdateByIdRepository,
    loadUserCampaignsRepository: LoadUserCampaignsRepository,
    registerClickAuth: RegisterClickAuth
  ) {
    this.loadAccountByIdRepository = loadAccountByIdRepository
    this.updateByIdRepository = updateByIdRepository
    this.loadUserCampaignsRepository = loadUserCampaignsRepository
    this.registerClickAuth = registerClickAuth
  }

  async activate (idUser: number): Promise<void | null> {
    const account = await this.loadAccountByIdRepository.loadById(idUser)
    if (!account) return null

    await this.updateByIdRepository.updateById(idUser, 'allow_clicks', '1')

    const campaigns = await this.loadUserCampaignsRepository.loadUserCampaigns(idUser)
    if (campaigns) {
      for (const campaign of campaigns) {
        await this.registerClickAuth.register(campaign.click_auth, campaign.id, campaign.ad_provider)
      }
    }
  }
}
