import { AdsSummaryModel } from "../../../../domain/models/ads-summary";

export interface LoadAllAdsRepository {
  loadAds (days?:number, id_funnel?: number): Promise<AdsSummaryModel[] | null>
}
  