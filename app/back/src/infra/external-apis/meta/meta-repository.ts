import { Decrypter } from "../../../data/protocols/criptography/decrypter";
import { ExternalData, GetCampaingExtInfo, ExternalInfo, GetMetaAdSetInfo, MetaAdSetInfo, GetMetaExternalData, MetaCampaignInput, GetMetaAdsInfo, GetMetaAdInfo, MetaAdInfo } from "../../../data/protocols/external-apis/external-info";
import { AccountMySqlRepository } from "../../db/mysql/account/account-mysql-repository";

export class MetaRepository implements GetMetaExternalData, GetCampaingExtInfo, GetMetaAdSetInfo, GetMetaAdsInfo, GetMetaAdInfo {
  private readonly accountMySqlRepository: AccountMySqlRepository
  private readonly decrypter: Decrypter

  constructor (decrypter: Decrypter, accountMySqlRepository: AccountMySqlRepository) {
    this.accountMySqlRepository = accountMySqlRepository
    this.decrypter = decrypter
  }

  private buildDateRangeParam(days: number): string {
    if (days === 0) {
      return 'date_preset=today';
    } else if (days === 1) {
      return 'date_preset=yesterday';
    } else if (days > 400) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 3);
      return `time_range={"since":"${startDate.toISOString().split('T')[0]}","until":"${endDate.toISOString().split('T')[0]}"}`;
    } else {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - days + 1);
      return `time_range={"since":"${startDate.toISOString().split('T')[0]}","until":"${endDate.toISOString().split('T')[0]}"}`;
    }
  }

  private buildDateRangeParamFromRange(dateRange: { startDate: string; endDate: string }): string {
    return `time_range={"since":"${dateRange.startDate}","until":"${dateRange.endDate}"}`;
  }

  private async fetchCampaignInsights(
    accessToken: string,
    accountId: string,
    externalIds: string[],
    dateParam: string
  ): Promise<ExternalData[]> {
    const url = `https://graph.facebook.com/v21.0/act_${accountId}/insights`;
    const fields = 'campaign_id,spend,clicks';
    const idsString = externalIds.map(item => `"${item}"`);

    try {
      const response = await fetch(
        `${url}?fields=${fields}&access_token=${accessToken}&filtering=[{"field":"campaign.id","operator":"IN","value":[${idsString}]}]&${dateParam}&level=campaign`
      );
      const json = await response.json();
      const data = json.data || [];

      return externalIds.map(id => {
        const item = data.find((e: any) => e.campaign_id === String(id));
        return {
          provider: 'meta',
          external_id: id,
          expenses: item ? Number(item.spend) : 0,
          clicks: item ? Number(item.clicks) : 0,
        };
      });
    } catch (err) {
      return externalIds.map(id => ({
        provider: 'meta',
        external_id: id,
        expenses: 0,
        clicks: 0,
      }));
    }
  }

  async getExternalData(id_user: number, campaigns: MetaCampaignInput[], days: number): Promise<ExternalData[]> {
    if (!campaigns.length) return [];

    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return [];

    const accessToken = user.meta_access_token;
    const dateParam = this.buildDateRangeParam(days);

    // Group campaigns by account_id
    const grouped = new Map<string, string[]>();
    for (const c of campaigns) {
      const ids = grouped.get(c.account_id) || [];
      ids.push(c.external_id);
      grouped.set(c.account_id, ids);
    }

    const promises = Array.from(grouped.entries()).map(([accountId, ids]) =>
      this.fetchCampaignInsights(accessToken, accountId, ids, dateParam)
    );

    const results = await Promise.all(promises);
    return results.flat();
  }

  async getExternalDataByDateRange(id_user: number, campaigns: MetaCampaignInput[], dateRange: { startDate: string; endDate: string }): Promise<ExternalData[]> {
    if (!campaigns.length) return [];

    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return [];

    const accessToken = user.meta_access_token;
    const dateParam = this.buildDateRangeParamFromRange(dateRange);

    const grouped = new Map<string, string[]>();
    for (const c of campaigns) {
      const ids = grouped.get(c.account_id) || [];
      ids.push(c.external_id);
      grouped.set(c.account_id, ids);
    }

    const promises = Array.from(grouped.entries()).map(([accountId, ids]) =>
      this.fetchCampaignInsights(accessToken, accountId, ids, dateParam)
    );

    const results = await Promise.all(promises);
    return results.flat();
  }

  async getExtCampaignInfo(id_user: number, external_id: string, days: number): Promise<ExternalInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) {
      return { external_id, expenses: 0, clicks: 0, vcpm: 0, vctr: 0, cpc: 0 };
    }

    const accessToken = user.meta_access_token;
    // For single campaign info we need account_id — use first allowed account or fallback
    // This method is used in campaign detail views where sub_account isn't passed
    // For now we query without act_ prefix using the campaign ID directly
    const url = `https://graph.facebook.com/v21.0/${external_id}/insights`;
    const fields = 'campaign_id,spend,clicks,impressions,cpc,ctr';
    const dateParam = this.buildDateRangeParam(days);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}`);
      const json = await response.json();
      const campaignData = json.data?.[0];
      
      if (!campaignData) {
        return { external_id, expenses: 0, clicks: 0, vcpm: 0, vctr: 0, cpc: 0 };
      }

      return {
        external_id,
        expenses: Number(campaignData.spend),
        clicks: Number(campaignData.clicks),
        vcpm: campaignData.impressions > 0 ? (Number(campaignData.spend) / Number(campaignData.impressions)) * 1000 : 0,
        vctr: Number(campaignData.ctr),
        cpc: Number(campaignData.cpc)
      };
    } catch (err) {
      return { external_id, expenses: 0, clicks: 0, vcpm: 0, vctr: 0, cpc: 0 };
    }
  }

  async getExtCampaignInfoByDateRange(id_user: number, external_id: string, dateRange: { startDate: string; endDate: string }): Promise<ExternalInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) {
      return { external_id, expenses: 0, clicks: 0, vcpm: 0, vctr: 0, cpc: 0 };
    }

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${external_id}/insights`;
    const fields = 'campaign_id,spend,clicks,impressions,cpc,ctr';
    const dateParam = this.buildDateRangeParamFromRange(dateRange);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}`);
      const json = await response.json();
      const campaignData = json.data?.[0];

      if (!campaignData) {
        return { external_id, expenses: 0, clicks: 0, vcpm: 0, vctr: 0, cpc: 0 };
      }

      return {
        external_id,
        expenses: Number(campaignData.spend),
        clicks: Number(campaignData.clicks),
        vcpm: campaignData.impressions > 0 ? (Number(campaignData.spend) / Number(campaignData.impressions)) * 1000 : 0,
        vctr: Number(campaignData.ctr),
        cpc: Number(campaignData.cpc)
      };
    } catch (err) {
      return { external_id, expenses: 0, clicks: 0, vcpm: 0, vctr: 0, cpc: 0 };
    }
  }

  async getMetaAdSetsInfo(id_user: number, id_campaign_meta: string, days: number): Promise<MetaAdSetInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return [];

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${id_campaign_meta}/insights`;
    const fields = 'adset_id,adset_name,spend,clicks,impressions,cpc,ctr,cpm';
    const dateParam = this.buildDateRangeParam(days);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}&level=adset`);
      const json = await response.json();

      if (!json.data) return [];

      return json.data.map((item: any) => ({
        id_meta: item.adset_id,
        name: item.adset_name,
        expenses: item.spend,
        clicks: item.clicks,
        vcpm: item.cpm,
        vctr: item.ctr,
        cpc: item.cpc
      }));
    } catch (err) {
      return [];
    }
  }

  async getMetaAdSetsInfoByDateRange(id_user: number, id_campaign_meta: string, dateRange: { startDate: string; endDate: string }): Promise<MetaAdSetInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return [];

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${id_campaign_meta}/insights`;
    const fields = 'adset_id,adset_name,spend,clicks,impressions,cpc,ctr,cpm';
    const dateParam = this.buildDateRangeParamFromRange(dateRange);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}&level=adset`);
      const json = await response.json();

      if (!json.data) return [];

      return json.data.map((item: any) => ({
        id_meta: item.adset_id,
        name: item.adset_name,
        expenses: item.spend,
        clicks: item.clicks,
        vcpm: item.cpm,
        vctr: item.ctr,
        cpc: item.cpc
      }));
    } catch (err) {
      return [];
    }
  }

  async getMetaAdsInfo(id_user: number, id_campaign_meta: string, days: number): Promise<MetaAdInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return [];

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${id_campaign_meta}/insights`;
    const fields = 'ad_id,ad_name,spend,clicks,impressions,cpc,ctr,cpm';
    const dateParam = this.buildDateRangeParam(days);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}&level=ad`);
      const json = await response.json();

      if (!json.data) return [];

      return json.data.map((item: any) => ({
        id_meta: item.ad_id,
        name: item.ad_name,
        expenses: item.spend,
        clicks: item.clicks,
        vcpm: item.cpm,
        vctr: item.ctr,
        cpc: item.cpc
      }));
    } catch (err) {
      return [];
    }
  }

  async getMetaAdsInfoByDateRange(id_user: number, id_campaign_meta: string, dateRange: { startDate: string; endDate: string }): Promise<MetaAdInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return [];

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${id_campaign_meta}/insights`;
    const fields = 'ad_id,ad_name,spend,clicks,impressions,cpc,ctr,cpm';
    const dateParam = this.buildDateRangeParamFromRange(dateRange);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}&level=ad`);
      const json = await response.json();

      if (!json.data) return [];

      return json.data.map((item: any) => ({
        id_meta: item.ad_id,
        name: item.ad_name,
        expenses: item.spend,
        clicks: item.clicks,
        vcpm: item.cpm,
        vctr: item.ctr,
        cpc: item.cpc
      }));
    } catch (err) {
      return [];
    }
  }

  private defaultMetaAdInfo(id_ad_meta: string): MetaAdInfo {
    return { id_meta: id_ad_meta, name: '', clicks: 0, expenses: 0, vcpm: 0, vctr: 0, cpc: 0 }
  }

  async getMetaAdInfo(id_user: number, id_ad_meta: string, days: number): Promise<MetaAdInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return this.defaultMetaAdInfo(id_ad_meta);

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${id_ad_meta}/insights`;
    const fields = 'ad_id,ad_name,spend,clicks,impressions,cpc,ctr,cpm';
    const dateParam = this.buildDateRangeParam(days);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}`);
      const json = await response.json();
      const item = json.data?.[0];

      if (!item) return this.defaultMetaAdInfo(id_ad_meta);

      return {
        id_meta: item.ad_id,
        name: item.ad_name,
        expenses: item.spend,
        clicks: item.clicks,
        vcpm: item.cpm,
        vctr: item.ctr,
        cpc: item.cpc
      };
    } catch (err) {
      return this.defaultMetaAdInfo(id_ad_meta);
    }
  }

  async getMetaAdInfoByDateRange(id_user: number, id_ad_meta: string, dateRange: { startDate: string; endDate: string }): Promise<MetaAdInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.meta_access_token) return this.defaultMetaAdInfo(id_ad_meta);

    const accessToken = user.meta_access_token;
    const url = `https://graph.facebook.com/v21.0/${id_ad_meta}/insights`;
    const fields = 'ad_id,ad_name,spend,clicks,impressions,cpc,ctr,cpm';
    const dateParam = this.buildDateRangeParamFromRange(dateRange);

    try {
      const response = await fetch(`${url}?fields=${fields}&access_token=${accessToken}&${dateParam}`);
      const json = await response.json();
      const item = json.data?.[0];

      if (!item) return this.defaultMetaAdInfo(id_ad_meta);

      return {
        id_meta: item.ad_id,
        name: item.ad_name,
        expenses: item.spend,
        clicks: item.clicks,
        vcpm: item.cpm,
        vctr: item.ctr,
        cpc: item.cpc
      };
    } catch (err) {
      return this.defaultMetaAdInfo(id_ad_meta);
    }
  }
}
