import { CampaignModel } from "../../../usecases/add-campaign/db-add-campaign-protocols";

export interface LoadUserCampaignsRepository {
  loadUserCampaigns (idUser: number): Promise<CampaignModel[] | null>
}