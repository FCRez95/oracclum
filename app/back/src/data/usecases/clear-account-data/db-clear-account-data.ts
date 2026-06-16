import { ClearAccountData } from "../../../domain/usecases/account/clear-account-data"
import { LoadAccountByIdRepository } from "../../protocols/db/account/load-account-by-id-repository"
import { UpdateByIdRepository } from "../../protocols/db/account/update-by-id-repository"
import { DeleteAllowedMetaAccountsRepository } from "../../protocols/db/allowed-meta-account/delete-allowed-meta-accounts-repository"
import { DeleteCampaignRepository } from "../../protocols/db/campaign/delete-campaign-repository"
import { LoadUserCampaignsRepository } from "../../protocols/db/campaign/load-user-campaigns-repository"
import { DeleteUserConsentsRepository } from "../../protocols/db/user-consents/delete-user-consents-repository"
import { RemoveClickAuth } from "../../protocols/external-apis/remove-click-auth"

export class DbClearAccountData implements ClearAccountData {
  constructor (
    private readonly loadAccountByIdRepository: LoadAccountByIdRepository,
    private readonly loadUserCampaignsRepository: LoadUserCampaignsRepository,
    private readonly deleteCampaignRepository: DeleteCampaignRepository,
    private readonly updateByIdRepository: UpdateByIdRepository,
    private readonly deleteAllowedMetaAccountsRepository: DeleteAllowedMetaAccountsRepository,
    private readonly deleteUserConsentsRepository: DeleteUserConsentsRepository,
    private readonly removeClickAuth: RemoveClickAuth
  ) {}

  async clear (idUser: number): Promise<void | null> {
    const account = await this.loadAccountByIdRepository.loadById(idUser)
    if (!account) return null

    const campaigns = await this.loadUserCampaignsRepository.loadUserCampaigns(idUser)

    if (campaigns?.length) {
      for (const campaign of campaigns) {
        await this.removeClickAuth.remove(campaign.click_auth, campaign.id, campaign.ad_provider)
      }

      for (const campaign of campaigns) {
        await this.deleteCampaignRepository.delete(campaign.id)
      }
    }

    await this.updateByIdRepository.updateById(idUser, 'taboola_info', null)
    await this.updateByIdRepository.updateById(idUser, 'taboola_access_token', null)
    await this.updateByIdRepository.updateById(idUser, 'meta_access_token', null)

    await this.deleteAllowedMetaAccountsRepository.deleteByUser(idUser)
    await this.deleteUserConsentsRepository.deleteByUser(idUser)
  }
}
