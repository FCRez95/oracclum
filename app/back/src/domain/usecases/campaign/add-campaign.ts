import { CampaignModel } from '../../models/campaign'

export interface AddFunnelModel {
  name: string,
  link: string
}

export interface AddCampaign {
  add (name : string, link: string, idUser: number, ad_provider: string, conversion_name: string, checkout_provider: string, external_id: string, sub_account?:string): Promise<CampaignModel | null>
}
