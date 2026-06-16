import { DeactivateAccount } from "../../../domain/usecases/account/deactivate-account"
import { LoadAccountByIdRepository } from "../../protocols/db/account/load-account-by-id-repository"
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { LoadUserCampaignsRepository } from "../../protocols/db/campaign/load-user-campaigns-repository"
import { RemoveClickAuth } from "../../protocols/external-apis/remove-click-auth"

export class DbDeactivateAccount implements DeactivateAccount {
  private readonly loadAccountByIdRepository: LoadAccountByIdRepository
  private readonly updateByIdRepository: UpdateByIdRepository
  private readonly loadUserCampaignsRepository: LoadUserCampaignsRepository
  private readonly removeClickAuth: RemoveClickAuth

  constructor (
    loadAccountByIdRepository: LoadAccountByIdRepository,
    updateByIdRepository: UpdateByIdRepository,
    loadUserCampaignsRepository: LoadUserCampaignsRepository,
    removeClickAuth: RemoveClickAuth
  ) {
    this.loadAccountByIdRepository = loadAccountByIdRepository
    this.updateByIdRepository = updateByIdRepository
    this.loadUserCampaignsRepository = loadUserCampaignsRepository
    this.removeClickAuth = removeClickAuth
  }

  async deactivate (idUser: number): Promise<void | null> {
    const account = await this.loadAccountByIdRepository.loadById(idUser)
    if (!account) return null

    await this.updateByIdRepository.updateById(idUser, 'allow_clicks', '0')

    const campaigns = await this.loadUserCampaignsRepository.loadUserCampaigns(idUser)
    if (campaigns) {
      for (const campaign of campaigns) {
        await this.removeClickAuth.remove(campaign.click_auth, campaign.id, campaign.ad_provider)
      }
    }
  }
}
