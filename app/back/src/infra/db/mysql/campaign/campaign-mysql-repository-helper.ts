import { CampaignModel } from '../../../../domain/models/campaign'

export const mapCreatedCampaign = (addedCampaign: any, addedCampaignId: number): CampaignModel => {
  return Object.assign({}, addedCampaign, { id: addedCampaignId })
}
