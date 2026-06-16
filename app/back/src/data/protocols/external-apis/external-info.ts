// General External Data Interfaces
export interface ExternalData {
  provider: string;
  external_id: number | string;
  expenses: number;
  clicks: number;
}

export interface GetExternalData {
  getExternalData(
    id_user: number,
    external_ids: number[],
    days: number
  ): Promise<ExternalData[]>;
  
  getExternalDataByDateRange(
    id_user: number,
    external_ids: number[],
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalData[]>;
}

export interface ExternalInfo {
  external_id: string;
  clicks: number;
  expenses: number;
  vcpm: number;
  vctr: number;
  cpc: number;
}

export interface GetCampaingExtInfo {
  getExtCampaignInfo(
    id_user: number,
    external_id: string,
    days: number
  ): Promise<ExternalInfo>;

  getExtCampaignInfoByDateRange(
    id_user: number,
    external_id: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalInfo>;
}

// Taboola Exclusive Interfaces
export interface ExternalAdInfo {
  id_taboola: number;
  title: string;
  thumbnail: string;
  clicks: number;
  expenses: number;
  vcpm: number;
  vctr: number;
  cpc: number;
}

export interface GetExternalAdsInfo {
  getExternalAdsInfo(
    id_user: number,
    id_campaign_taboola: number,
    days: number
  ): Promise<ExternalAdInfo[]>

  getExternalAdsInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    dateRange: { startDate: string, endDate: string }
  ): Promise<ExternalAdInfo[]>
}

export interface GetExternalAdInfo {
  getExternalAdInfo(
    id_user: number,
    id_campaign_taboola: number,
    id_ad_taboola: number,
    days: number
  ): Promise<ExternalAdInfo>;

  getExternalAdInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    id_ad_taboola: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalAdInfo>;
}

export interface ExternalSiteInfo {
  id_taboola: number;
  name: string;
  site: string;
  clicks: number;
  expenses: number;
  vcpm: number;
  vctr: number;
  cpc: number;
}

export interface GetExternalSitesInfo {
  getExternalSitesInfo(
    id_user: number,
    id_campaign_taboola: number,
    days: number
  ): Promise<ExternalSiteInfo[]>;

  getExternalSitesInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    dateRange: { startDate: string, endDate: string }
  ): Promise<ExternalSiteInfo[]>
}

export interface GetExternalSiteInfo {
  getExternalSiteInfo (id_user: number, id_campaign_taboola: number, id_site: number, days: number): Promise<ExternalSiteInfo>
  getExternalSiteInfoByDateRange (id_user: number, id_campaign_taboola: number, id_site: number, dateRange: { startDate: string, endDate: string }): Promise<ExternalSiteInfo>
}

// Meta General Interfaces
export interface MetaCampaignInput {
  external_id: string
  account_id: string
}

export interface GetMetaExternalData {
  getExternalData(id_user: number, campaigns: MetaCampaignInput[], days: number): Promise<ExternalData[]>
  getExternalDataByDateRange(id_user: number, campaigns: MetaCampaignInput[], dateRange: { startDate: string; endDate: string }): Promise<ExternalData[]>
}

// Meta Exclusive Interfaces
export interface MetaAdSetInfo {
  id_meta: string;
  name: string;
  clicks: number;
  expenses: number;
  vcpm: number;
  vctr: number;
  cpc: number;
}

export interface GetMetaAdSetInfo {
  getMetaAdSetsInfo(
    id_user: number,
    id_campaign_meta: string,
    days: number
  ): Promise<MetaAdSetInfo[]>;

  getMetaAdSetsInfoByDateRange(
    id_user: number,
    id_campaign_meta: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<MetaAdSetInfo[]>;
}

export interface MetaAdInfo {
  id_meta: string;
  name: string;
  clicks: number;
  expenses: number;
  vcpm: number;
  vctr: number;
  cpc: number;
}

export interface GetMetaAdsInfo {
  getMetaAdsInfo(
    id_user: number,
    id_campaign_meta: string,
    days: number
  ): Promise<MetaAdInfo[]>;

  getMetaAdsInfoByDateRange(
    id_user: number,
    id_campaign_meta: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<MetaAdInfo[]>;
}

export interface GetMetaAdInfo {
  getMetaAdInfo(id_user: number, id_ad_meta: string, days: number): Promise<MetaAdInfo>
  getMetaAdInfoByDateRange(id_user: number, id_ad_meta: string, dateRange: { startDate: string; endDate: string }): Promise<MetaAdInfo>
}
