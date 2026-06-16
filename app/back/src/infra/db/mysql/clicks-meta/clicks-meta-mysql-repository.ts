import { getOne, runQuery } from "../mysql-helper";
import { Pool } from "mysql2";
import { GetIdCampaignMetaRepository } from "../../../../data/protocols/db/clicks-meta/get-id-campaign-meta-repository";
import { LoadMetaClickByIdRepository } from "../../../../data/protocols/db/clicks-meta/load-click-by-id-repository";
import {
  InternalOptimizationData,
  LoadCampaignOptimizationDataRepository,
} from "../../../../data/protocols/db/clicks-meta/load-campaign-optimization-data-repository";
import {
  CampaignStepsData,
  LoadCampaignStepsSummaryByClicksRepository,
} from "../../../../data/protocols/db/campaign/load-campaign-steps-summary-by-clicks-repository";
import { LoadAdsetOptimizationDataRepository } from "../../../../data/protocols/db/clicks-meta/load-adset-optimization-data-repository";
import { LoadAdOptimizationDataRepository } from "../../../../data/protocols/db/clicks-meta/load-ad-optimization-data-repository";
import { MetaClickModel } from "../../../../domain/models/meta-click";

export class ClickMetaMysqlRepository
  implements
    GetIdCampaignMetaRepository,
    LoadCampaignOptimizationDataRepository,
    LoadCampaignStepsSummaryByClicksRepository,
    LoadAdsetOptimizationDataRepository,
    LoadAdOptimizationDataRepository,
    LoadMetaClickByIdRepository
{
  public readonly connectionPool: Pool;

  constructor(pool: Pool) {
    this.connectionPool = pool;
  }

  private buildDaysFilter(days: number): string {
    if (days === 0) {
      return 'AND created_at >= CURDATE()'
    }
    if (days === 1) {
      return 'AND created_at BETWEEN CURDATE() - INTERVAL 1 DAY AND CURDATE() - INTERVAL 1 SECOND'
    }
    if (days < 400) {
      return `AND created_at BETWEEN CURDATE() - INTERVAL ${days} DAY AND CURDATE() - INTERVAL 0 DAY`
    }
    return ''
  }

  private buildDateRangeFilter(dateRange: { startDate: string; endDate: string }): { clause: string; params: any[] } {
    const { startDate, endDate } = dateRange
    return {
      clause: 'AND created_at BETWEEN ? AND ?',
      params: [startDate, endDate]
    }
  }

  private async loadAggregate(
    whereClause: string,
    params: any[],
    checkoutCondition: string
  ): Promise<InternalOptimizationData> {
    const query = `
      SELECT
        COALESCE(SUM(revenue), 0) AS revenue,
        SUM(CASE WHEN revenue > 0 THEN 1 ELSE 0 END) AS sales,
        SUM(CASE WHEN ${checkoutCondition} THEN 1 ELSE 0 END) AS checkout
      FROM clicks_meta
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

  async getMetaId(id_campaign: number): Promise<number> {
    const campaignClick = await getOne(
      this.connectionPool,
      "clicks_meta",
      "id_campaign",
      id_campaign
    );

    return campaignClick[0] ? campaignClick[0].id_campaign_meta : null;
  }

  async getMetaIds(id_campaigns: number[]): Promise<Array<{ id_campaign: number; id_campaign_meta: number | string }>> {
    if (!id_campaigns.length) return []
    const query = `
      SELECT
        id_campaign,
        MAX(id_campaign_meta) AS id_campaign_meta
      FROM clicks_meta
      WHERE id_campaign IN (?)
      GROUP BY id_campaign
    `
    const rows = await runQuery(this.connectionPool, query, [id_campaigns])
    return rows.map((row) => ({
      id_campaign: row.id_campaign,
      id_campaign_meta: row.id_campaign_meta
    }))
  }

  async loadCampaignOptData(
    id_campaign: number,
    days: number
  ): Promise<InternalOptimizationData> {
    const dateFilter = this.buildDaysFilter(days)
    return this.loadAggregate(
      `WHERE id_campaign = ? ${dateFilter}`,
      [id_campaign],
      'checkout = 1'
    )
  }

  async loadCampaignOptDataByDateRange(
    id_campaign: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<InternalOptimizationData> {
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    return this.loadAggregate(
      `WHERE id_campaign = ? ${clause}`,
      [id_campaign, ...params],
      'checkout = 1'
    )
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
      FROM clicks_meta
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
      FROM clicks_meta
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

  async loadAdsetOptData(
    id_ad_set: string,
    days: number
  ): Promise<InternalOptimizationData> {
    const dateFilter = this.buildDaysFilter(days)
    const data = await this.loadAggregate(
      `WHERE id_ad_set = ? ${dateFilter}`,
      [id_ad_set],
      'checkout = 1'
    )

    if (!data.checkout || !data.sales) {
      return null
    }

    return data
  }

  async loadAdsetOptDataByDateRange(
    id_ad_set: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<InternalOptimizationData> {
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const data = await this.loadAggregate(
      `WHERE id_ad_set = ? ${clause}`,
      [id_ad_set, ...params],
      'checkout = 1'
    )

    if (!data.checkout || !data.sales) {
      return null
    }

    return data
  }

  async loadAdOptData(
    id_ad_meta: string,
    days: number
  ): Promise<InternalOptimizationData> {
    const dateFilter = this.buildDaysFilter(days)
    const data = await this.loadAggregate(
      `WHERE id_ad_meta = ? ${dateFilter}`,
      [id_ad_meta],
      'checkout = 1'
    )

    if (!data.checkout || !data.sales) {
      return null
    }

    return data
  }

  async loadAdOptDataByDateRange(
    id_ad_meta: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<InternalOptimizationData> {
    const { clause, params } = this.buildDateRangeFilter(dateRange)
    const data = await this.loadAggregate(
      `WHERE id_ad_meta = ? ${clause}`,
      [id_ad_meta, ...params],
      'checkout = 1'
    )

    if (!data.checkout || !data.sales) {
      return null
    }

    return data
  }

  async loadByIdClick(idClick: string): Promise<MetaClickModel | null> {
    const query = 'SELECT * FROM clicks_meta WHERE id_click = ?'
    const rows = await runQuery(this.connectionPool, query, [idClick])
    return rows[0] || null
  }
}
