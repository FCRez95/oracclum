import { OptimizationData } from "./optimization-data";

export interface CampaignModel {
  id: number,
  id_user: number,
  name: string,
  link: string,
  click_auth: string,
  ad_provider: string,
  conversion_name: string,
  checkout_provider: string,
  sub_account?: string,
  external_id?: string,
  summary?: OptimizationData
}