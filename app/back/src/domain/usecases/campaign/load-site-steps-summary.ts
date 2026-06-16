import { SiteStepsSummary } from '../../models/site-funnel';

export interface LoadSiteStepsSummary {
  load (idUser: number, id_campaign: number, id_site: number, days: number): Promise<SiteStepsSummary | null>
  loadByDateRange (idUser: number, id_campaign: number, id_site: number, dateRange: { startDate: string; endDate: string }): Promise<SiteStepsSummary | null>
} 