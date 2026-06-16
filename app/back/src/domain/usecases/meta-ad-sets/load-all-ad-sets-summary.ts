import { MetaAdSetModel } from "../../models/meta-ad-set";

export interface LoadAllMetaAdSets {
  loadAll(idUser: number, id_campaign: number, days: number): Promise<MetaAdSetModel[] | null>
  loadAllByDateRange(idUser: number, id_campaign: number, dateRange: { startDate: string; endDate: string }): Promise<MetaAdSetModel[] | null>
}