import { AdsSummaryModel } from "../../../../domain/models/ads-summary";

export interface LoadAllAdsRepository {
  loadAds (days?:number, id_campaign?: number): Promise<AdsSummaryModel[] | null>
}
  