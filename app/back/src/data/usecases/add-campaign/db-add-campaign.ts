import { RegisterClickAuth } from '../../protocols/external-apis/clicks-api'
import { AddCampaign, CampaignModel, Hasher, AddCampaignRepository } from './db-add-campaign-protocols'

export class DbAddCampaign implements AddCampaign {
  private readonly hasher: Hasher
  private readonly addCampaignRepository: AddCampaignRepository
  private readonly registerClickAuth: RegisterClickAuth

  constructor (hasher: Hasher, addCampaignRepository: AddCampaignRepository, registerClickAuth: RegisterClickAuth) {
    this.hasher = hasher
    this.addCampaignRepository = addCampaignRepository
    this.registerClickAuth = registerClickAuth
  }

  async add (name: string, link: string, idUser: number, ad_provider: string, conversion_name: string, checkout_provider: string, external_id: string, sub_account?: string): Promise<CampaignModel> {
    const clickAuth = await this.hasher.hash(name)

    const campaign = await this.addCampaignRepository.add(name, link, idUser, clickAuth, ad_provider, conversion_name, checkout_provider, external_id, sub_account)
    
    await this.registerClickAuth.register(clickAuth, campaign.id, campaign.ad_provider)

    return campaign
  }
}
