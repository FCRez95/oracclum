import { getOne, getOneSortedDesc, runQuery } from '../mysql-helper'
import { Pool } from 'mysql2'
import { InternalOptimizationData, LoadOptimizationDataRepository, OptimizationDataByAd, OptimizationDataBySite } from '../../../../data/protocols/db/clicks-taboola/load-optimization-data-repository'
import { CampaignInternalData, CampaignInternalSummary, LoadCampaignSummaryRepository } from '../../../../data/protocols/db/clicks-taboola/load-campaign-summary-repository'
import { CampaignStepsData, LoadCampaignStepsSummaryByClicksRepository } from '../../../../data/protocols/db/campaign/load-campaign-steps-summary-by-clicks-repository'
import { GetIdCampaignTaboolaRepository } from '../../../../data/protocols/db/clicks-taboola/get-id-campaign-taboola-repository'
import { SiteStepsData, LoadSiteStepsRepository } from '../../../../data/protocols/db/clicks-taboola/load-site-steps-repository'
import { LoadClickByIdRepository } from '../../../../data/protocols/db/clicks-taboola/load-click-by-id-repository'
import { ClickModel } from '../../../../domain/models/click'

export class ClickMysqlRepository implements LoadOptimizationDataRepository, LoadCampaignSummaryRepository, LoadCampaignStepsSummaryByClicksRepository, GetIdCampaignTaboolaRepository, LoadSiteStepsRepository, LoadClickByIdRepository {
  public readonly connectionPool: Pool

  constructor(pool: Pool) {
    this.connectionPool = pool
  }

  private buildDaysFilter(days?: number): string {
    if (days === 0) {
      return 'AND created_at >= CURDATE()'
    }
    if (days === 1) {
      return 'AND created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND'
    }
    // Cap at 30 days, default to 7 if undefined/invalid
    const safeDays = (typeof days === 'number' && days > 0) ? Math.min(days, 30) : 7
    return `AND created_at >= CURDATE() - INTERVAL ${safeDays} DAY`
  }

  private buildDateRangeFilter(dateRange: { startDate: string; endDate: string }): { clause: string; params: any[] } {
    const { startDate, endDate } = dateRange
    return {
      clause: 'AND created_at BETWEEN ? AND ?',
      params: [startDate, endDate]
    }
  }

  private async loadAggregate(table: string, whereClause: string, params: any[]): Promise<InternalOptimizationData> {
    const query = `
      SELECT
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM ${table}
      ${whereClause}
    `
    const rows = await runQuery(this.connectionPool, query, params)
    const row = rows[0] || {}
    return {
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }
  }

  async load(
    days?: number,
    id_campaign?: number,
    id_ads?: number,
    id_site?: number | string
  ): Promise<InternalOptimizationData> {
    const dateFilter = this.buildDaysFilter(days)

    if (id_campaign && id_site === undefined) {
      return this.loadAggregate(
        'clicks_taboola',
        `WHERE id_campaign = ? ${dateFilter}`,
        [id_campaign]
      )
    }

    if (id_site && id_campaign) {
      return this.loadAggregate(
        'clicks_taboola',
        `WHERE id_campaign = ? AND id_site = ? ${dateFilter}`,
        [id_campaign, id_site]
      )
    }

    if (id_ads) {
      return this.loadAggregate(
        'clicks_taboola',
        `WHERE id_ads_taboola = ? ${dateFilter}`,
        [id_ads]
      )
    }

    return null
  }

  async loadByDateRange(
    dateRange: { startDate: string; endDate: string },
    id_campaign?: number,
    id_ads?: number,
    id_site?: number | string
  ): Promise<InternalOptimizationData> {
    const { clause, params } = this.buildDateRangeFilter(dateRange)

    if (id_campaign && id_site === undefined) {
      return this.loadAggregate(
        'clicks_taboola',
        `WHERE id_campaign = ? ${clause}`,
        [id_campaign, ...params]
      )
    }

    if (id_site && id_campaign) {
      return this.loadAggregate(
        'clicks_taboola',
        `WHERE id_campaign = ? AND id_site = ? ${clause}`,
        [id_campaign, id_site, ...params]
      )
    }

    if (id_ads) {
      return this.loadAggregate(
        'clicks_taboola',
        `WHERE id_ads_taboola = ? ${clause}`,
        [id_ads, ...params]
      )
    }

    return null
  }

  async loadCampaignSummaryByClick(
    id_campaign: number,
    days: number
  ): Promise<CampaignStepsData> {
    const dateFilter = this.buildDaysFilter(days)
    const query = `
      SELECT
        COUNT(id) AS total_clicks,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS total_sales,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN step_1 > 0 THEN 1 ELSE 0 END) AS total_step_1,
        SUM(CASE WHEN step_1 = 2 THEN 1 ELSE 0 END) AS step_1_views,
        SUM(CASE WHEN step_2 > 0 THEN 1 ELSE 0 END) AS total_step_2,
        SUM(CASE WHEN step_2 = 2 THEN 1 ELSE 0 END) AS step_2_views,
        SUM(CASE WHEN step_3 > 0 THEN 1 ELSE 0 END) AS total_step_3,
        SUM(CASE WHEN step_3 = 2 THEN 1 ELSE 0 END) AS step_3_views,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS total_checkout,
        SUM(CASE WHEN checkout = 2 THEN 1 ELSE 0 END) AS checkout_views
      FROM clicks_taboola
      WHERE id_campaign = ? ${dateFilter}
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaign])
    const row = rows[0] || {}

    return {
      total_clicks: row.total_clicks ?? 0,
      total_sales: row.total_sales ?? 0,
      revenue: row.revenue ?? 0,
      total_step_1: row.total_step_1 ?? 0,
      step_1_views: row.step_1_views ?? 0,
      total_step_2: row.total_step_2 ?? 0,
      step_2_views: row.step_2_views ?? 0,
      total_step_3: row.total_step_3 ?? 0,
      step_3_views: row.step_3_views ?? 0,
      total_checkout: row.total_checkout ?? 0,
      checkout_views: row.checkout_views ?? 0,
    };
  }

  async loadCampaignSummaryByClickByDateRange(
    id_campaign: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignStepsData> {
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const query = `
      SELECT
        COUNT(id) AS total_clicks,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS total_sales,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN step_1 > 0 THEN 1 ELSE 0 END) AS total_step_1,
        SUM(CASE WHEN step_1 = 2 THEN 1 ELSE 0 END) AS step_1_views,
        SUM(CASE WHEN step_2 > 0 THEN 1 ELSE 0 END) AS total_step_2,
        SUM(CASE WHEN step_2 = 2 THEN 1 ELSE 0 END) AS step_2_views,
        SUM(CASE WHEN step_3 > 0 THEN 1 ELSE 0 END) AS total_step_3,
        SUM(CASE WHEN step_3 = 2 THEN 1 ELSE 0 END) AS step_3_views,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS total_checkout,
        SUM(CASE WHEN checkout = 2 THEN 1 ELSE 0 END) AS checkout_views
      FROM clicks_taboola
      WHERE id_campaign = ? ${clause}
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaign, ...params])
    const row = rows[0] || {}

    return {
      total_clicks: row.total_clicks ?? 0,
      total_sales: row.total_sales ?? 0,
      revenue: row.revenue ?? 0,
      total_step_1: row.total_step_1 ?? 0,
      step_1_views: row.step_1_views ?? 0,
      total_step_2: row.total_step_2 ?? 0,
      step_2_views: row.step_2_views ?? 0,
      total_step_3: row.total_step_3 ?? 0,
      step_3_views: row.step_3_views ?? 0,
      total_checkout: row.total_checkout ?? 0,
      checkout_views: row.checkout_views ?? 0,
    };
  }

  async getTaboolaId(id_campaign: number): Promise<number> {
    const campaignClick = await getOneSortedDesc(this.connectionPool, 'clicks_taboola', 'id_campaign', id_campaign)
    if (campaignClick[0]?.id_campaign_taboola) {
      return campaignClick[0].id_campaign_taboola
    }

    // Se não tiver, tenta o segundo
    if (campaignClick[1]?.id_campaign_taboola) {
      return campaignClick[1].id_campaign_taboola
    }
    return null
  }

  async getTaboolaIds(id_campaigns: number[]): Promise<Array<{ id_campaign: number; id_campaign_taboola: number | string }>> {
    if (!id_campaigns.length) return []
    const query = `
      SELECT
        id_campaign,
        MAX(id_campaign_taboola) AS id_campaign_taboola
      FROM clicks_taboola
      WHERE id_campaign IN (?)
      GROUP BY id_campaign
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaigns])
    return rows.map((row) => ({
      id_campaign: row.id_campaign,
      id_campaign_taboola: row.id_campaign_taboola
    }))
  }

  async loadByIdClick(idClick: string): Promise<ClickModel | null> {
    const query = 'SELECT * FROM clicks_taboola WHERE id_click = ?'
    const rows = await runQuery(this.connectionPool, query, [idClick])
    return rows[0] || null
  }

  async loadSiteSteps(id_campaign: number, id_site: number, days: number): Promise<SiteStepsData> {
    const dateFilter = this.buildDaysFilter(days)
    const query = `
      SELECT
        COUNT(id) AS total_clicks,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS total_sales,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN step_1 > 0 THEN 1 ELSE 0 END) AS total_step_1,
        SUM(CASE WHEN step_1 = 2 THEN 1 ELSE 0 END) AS step_1_views,
        SUM(CASE WHEN step_2 > 0 THEN 1 ELSE 0 END) AS total_step_2,
        SUM(CASE WHEN step_2 = 2 THEN 1 ELSE 0 END) AS step_2_views,
        SUM(CASE WHEN step_3 > 0 THEN 1 ELSE 0 END) AS total_step_3,
        SUM(CASE WHEN step_3 = 2 THEN 1 ELSE 0 END) AS step_3_views,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS total_checkout,
        SUM(CASE WHEN checkout = 2 THEN 1 ELSE 0 END) AS checkout_views
      FROM clicks_taboola
      WHERE id_campaign = ? AND id_site = ? ${dateFilter}
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaign, id_site])
    const row = rows[0] || {}

    return ({
      total_clicks: row.total_clicks ?? 0,
      total_sales: row.total_sales ?? 0,
      revenue: row.revenue ?? 0,
      total_step_1: row.total_step_1 ?? 0,
      step_1_views: row.step_1_views ?? 0,
      total_step_2: row.total_step_2 ?? 0,
      step_2_views: row.step_2_views ?? 0,
      total_step_3: row.total_step_3 ?? 0,
      step_3_views: row.step_3_views ?? 0,
      total_checkout: row.total_checkout ?? 0,
      checkout_views: row.checkout_views ?? 0
    })
  }

  async loadSiteStepsByDateRange(id_campaign: number, id_site: number, dateRange: { startDate: string; endDate: string }): Promise<SiteStepsData> {
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const query = `
      SELECT
        COUNT(id) AS total_clicks,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS total_sales,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN step_1 > 0 THEN 1 ELSE 0 END) AS total_step_1,
        SUM(CASE WHEN step_1 = 2 THEN 1 ELSE 0 END) AS step_1_views,
        SUM(CASE WHEN step_2 > 0 THEN 1 ELSE 0 END) AS total_step_2,
        SUM(CASE WHEN step_2 = 2 THEN 1 ELSE 0 END) AS step_2_views,
        SUM(CASE WHEN step_3 > 0 THEN 1 ELSE 0 END) AS total_step_3,
        SUM(CASE WHEN step_3 = 2 THEN 1 ELSE 0 END) AS step_3_views,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS total_checkout,
        SUM(CASE WHEN checkout = 2 THEN 1 ELSE 0 END) AS checkout_views
      FROM clicks_taboola
      WHERE id_campaign = ? AND id_site = ? ${clause}
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaign, id_site, ...params])
    const row = rows[0] || {}

    return ({
      total_clicks: row.total_clicks ?? 0,
      total_sales: row.total_sales ?? 0,
      revenue: row.revenue ?? 0,
      total_step_1: row.total_step_1 ?? 0,
      step_1_views: row.step_1_views ?? 0,
      total_step_2: row.total_step_2 ?? 0,
      step_2_views: row.step_2_views ?? 0,
      total_step_3: row.total_step_3 ?? 0,
      step_3_views: row.step_3_views ?? 0,
      total_checkout: row.total_checkout ?? 0,
      checkout_views: row.checkout_views ?? 0
    })
  }

  async loadSummary(
    idCampaign: number,
    ad_provider: string,
    days: number
  ): Promise<CampaignInternalData> {
    const table = ad_provider === 'meta' ? 'clicks_meta' : 'clicks_taboola'
    const dateFilter = this.buildDaysFilter(days)
    return this.loadAggregate(table, `WHERE id_campaign = ? ${dateFilter}`, [idCampaign])
  }

  async loadSummaryByDateRange(
    idCampaign: number,
    ad_provider: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignInternalData> {
    const table = ad_provider === 'meta' ? 'clicks_meta' : 'clicks_taboola'
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    return this.loadAggregate(table, `WHERE id_campaign = ? ${clause}`, [idCampaign, ...params])
  }

  async loadSummariesByCampaignIds(
    ad_provider: string,
    campaignIds: number[],
    days: number
  ): Promise<CampaignInternalSummary[]> {
    if (!campaignIds.length) return []
    const table = ad_provider === 'meta' ? 'clicks_meta' : 'clicks_taboola'
    const dateFilter = this.buildDaysFilter(days)
    const query = `
      SELECT
        id_campaign,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM ${table}
      WHERE id_campaign IN (?) ${dateFilter}
      GROUP BY id_campaign
    `
    const rows = await runQuery(this.connectionPool, query, [campaignIds])
    return rows.map((row) => ({
      id_campaign: row.id_campaign,
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }))
  }

  async loadSummariesByCampaignIdsByDateRange(
    ad_provider: string,
    campaignIds: number[],
    dateRange: { startDate: string; endDate: string }
  ): Promise<CampaignInternalSummary[]> {
    if (!campaignIds.length) return []
    const table = ad_provider === 'meta' ? 'clicks_meta' : 'clicks_taboola'
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const query = `
      SELECT
        id_campaign,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM ${table}
      WHERE id_campaign IN (?) ${clause}
      GROUP BY id_campaign
    `
    const rows = await runQuery(this.connectionPool, query, [campaignIds, ...params])
    return rows.map((row) => ({
      id_campaign: row.id_campaign,
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }))
  }

  async loadAdsSummariesByIds(days: number, adIds: number[]): Promise<OptimizationDataByAd[]> {
    if (!adIds.length) return []
    const dateFilter = this.buildDaysFilter(days)
    const query = `
      SELECT
        id_ads_taboola,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM clicks_taboola
      WHERE id_ads_taboola IN (?) ${dateFilter}
      GROUP BY id_ads_taboola
    `
    const rows = await runQuery(this.connectionPool, query, [adIds])
    return rows.map((row) => ({
      id_ads_taboola: row.id_ads_taboola,
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }))
  }

  async loadAdsSummariesByIdsByDateRange(
    dateRange: { startDate: string; endDate: string },
    adIds: number[]
  ): Promise<OptimizationDataByAd[]> {
    if (!adIds.length) return []
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const query = `
      SELECT
        id_ads_taboola,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM clicks_taboola
      WHERE id_ads_taboola IN (?) ${clause}
      GROUP BY id_ads_taboola
    `
    const rows = await runQuery(this.connectionPool, query, [adIds, ...params])
    return rows.map((row) => ({
      id_ads_taboola: row.id_ads_taboola,
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }))
  }

  async loadSitesSummariesByCampaignAndIds(
    days: number,
    id_campaign: number,
    siteIds: Array<number | string>
  ): Promise<OptimizationDataBySite[]> {
    if (!siteIds.length) return []
    const dateFilter = this.buildDaysFilter(days)
    const query = `
      SELECT
        id_site,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM clicks_taboola
      WHERE id_campaign = ? AND id_site IN (?) ${dateFilter}
      GROUP BY id_site
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaign, siteIds])
    return rows.map((row) => ({
      id_site: row.id_site,
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }))
  }

  async loadSitesSummariesByCampaignAndIdsByDateRange(
    dateRange: { startDate: string; endDate: string },
    id_campaign: number,
    siteIds: Array<number | string>
  ): Promise<OptimizationDataBySite[]> {
    if (!siteIds.length) return []
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const query = `
      SELECT
        id_site,
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN checkout > 0 THEN 1 ELSE 0 END) AS checkout
      FROM clicks_taboola
      WHERE id_campaign = ? AND id_site IN (?) ${clause}
      GROUP BY id_site
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaign, siteIds, ...params])
    return rows.map((row) => ({
      id_site: row.id_site,
      revenue: row.revenue ?? 0,
      sales: row.sales ?? 0,
      checkout: row.checkout ?? 0
    }))
  }
}
