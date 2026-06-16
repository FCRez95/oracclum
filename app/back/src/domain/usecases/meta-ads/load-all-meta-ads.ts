import { MetaAdModel } from "../../models/meta-ad";

export interface LoadAllMetaAds {
  loadAll(idUser: number, id_campaign: number, days: number): Promise<MetaAdModel[] | null>
  loadAllByDateRange(idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<MetaAdModel[] | null>
}
