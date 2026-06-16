import { Decrypter } from "../../../data/protocols/criptography/decrypter";
import {
  ExternalInfo,
  GetExternalData,
  ExternalData,
  GetExternalAdsInfo,
  GetExternalSitesInfo,
  GetCampaingExtInfo,
  ExternalAdInfo,
  GetExternalAdInfo,
  ExternalSiteInfo,
} from "../../../data/protocols/external-apis/external-info";
import { AccountMySqlRepository } from "../../db/mysql/account/account-mysql-repository";

export class TaboolaRepository
  implements
    GetExternalData,
    GetCampaingExtInfo,
    GetExternalAdsInfo,
    GetExternalSitesInfo,
    GetExternalAdInfo
{
  private readonly accountMySqlRepository: AccountMySqlRepository;
  private readonly decrypter: Decrypter;
  private readonly ABORT_TIMEOUT = 30000;

  constructor(
    decrypter: Decrypter,
    accountMySqlRepository: AccountMySqlRepository
  ) {
    this.accountMySqlRepository = accountMySqlRepository;
    this.decrypter = decrypter;
  }

  async createAccessToken(
    id_user: number,
    decryptedTaboola: any
  ): Promise<string> {
    const encodedParams = new URLSearchParams();

    encodedParams.set("client_id", decryptedTaboola.clientId);
    encodedParams.set("client_secret", decryptedTaboola.clientSecret);
    encodedParams.set("grant_type", "client_credentials");

    const url = "https://backstage.taboola.com/backstage/oauth/token";
    const options = {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: encodedParams,
    };

    let accessToken: string;
    await fetch(url, options)
      .then((res) => res.json())
      .then(async (json) => {
        accessToken = json.access_token;
        await this.accountMySqlRepository.updateById(
          id_user,
          "taboola_access_token",
          json.access_token
        );
      })
      .catch(() => undefined);
    return accessToken;
  }

  async getExternalData(
    id_user: number,
    ids_campaign_taboola: number[],
    days: number
  ): Promise<ExternalData[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);

    if (!user.taboola_info) {
      return [];
    }

    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const today = new Date();
    today.setHours(today.getHours() - 3);

    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = (date.getMonth() + 1).toString().padStart(2, "0");
      const dd = date.getDate().toString().padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayString = formatDate(today);
    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    let url: string;
    if (days === 0) {
      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/realtime-campaign-summary/dimensions/by_campaign?start_date=${todayString}T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59`;
    } else {
      const start = new Date();
      start.setDate(today.getDate() - days);
      const startDate = formatDate(start);

      const end = new Date();
      end.setDate(today.getDate() - 1);
      const endDate = formatDate(end);

      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/campaign-summary/dimensions/campaign_breakdown?start_date=${startDate}&end_date=${endDate}`;
    }

    try {
      let response = await fetch(url, { ...options, signal });

      if (response.status === 401) {
        const newToken = await this.createAccessToken(
          id_user,
          decryptedTaboola
        );
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, signal });
      } else if (response.status === 429) {
        throw new Error("Taboola too many requests");
      }

      clearTimeout(timeoutId);
      const json = await response.json();
      const data = json.results;

      if (!data) {
        return [];
      }

      const compiledData: ExternalData[] = ids_campaign_taboola.map(
        (campaignId) => {
          const itemData = data.find(
            (element: any) =>
              Number(element.campaign_id) === Number(campaignId) ||
              Number(element.campaign) === Number(campaignId)
          );

          return {
            provider: "taboola",
            external_id: campaignId,
            expenses: itemData?.spent || 0,
            clicks: itemData?.clicks || 0,
          };
        }
      );

      return compiledData;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Taboola timeout");
      }
      throw err;
    }
  }

  async getExternalDataByDateRange(
    id_user: number,
    ids_campaign_taboola: number[],
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalData[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);

    if (!user.taboola_info) {
      return [];
    }

    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    const url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/campaign-summary/dimensions/campaign_breakdown?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`;

    try {
      let response = await fetch(url, { ...options, signal });

      if (response.status === 401) {
        const newToken = await this.createAccessToken(
          id_user,
          decryptedTaboola
        );
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, signal });
      } else if (response.status === 429) {
        throw new Error("Taboola too many requests");
      }

      clearTimeout(timeoutId);
      const json = await response.json();
      const data = json.results;

      if (!data) {
        return [];
      }

      const compiledData: ExternalData[] = ids_campaign_taboola.map(
        (campaignId) => {
          const itemData = data.find(
            (element: any) =>
              Number(element.campaign_id) === Number(campaignId) ||
              Number(element.campaign) === Number(campaignId)
          );

          return {
            provider: "taboola",
            external_id: campaignId,
            expenses: itemData?.spent || 0,
            clicks: itemData?.clicks || 0,
          };
        }
      );

      return compiledData;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Taboola timeout");
      }
      throw err;
    }
  }

  async getExtCampaignInfo(
    id_user: number,
    id_campaign_taboola: string,
    days: number
  ): Promise<ExternalInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.taboola_info) {
      return {
        external_id: id_campaign_taboola,
        expenses: 0,
        clicks: 0,
        vcpm: 0,
        vctr: 0,
        cpc: 0,
      };
    }

    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const today = new Date();
    today.setHours(today.getHours() - 3);

    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = (date.getMonth() + 1).toString().padStart(2, "0");
      const dd = date.getDate().toString().padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayString = formatDate(today);
    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    let url: string;
    if (days === 0) {
      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/realtime-campaign-summary/dimensions/by_campaign?start_date=${todayString}T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${id_campaign_taboola}`;
    } else {
      const start = new Date();
      start.setDate(today.getDate() - days);
      const startDate = formatDate(start);

      const end = new Date();
      end.setDate(today.getDate() - 1);
      const endDate = formatDate(end);

      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/campaign-summary/dimensions/campaign_breakdown?start_date=${startDate}&end_date=${endDate}&campaign=${id_campaign_taboola}`;
    }

    try {
      let response = await fetch(url, { ...options, signal });

      if (response.status === 401) {
        const newToken = await this.createAccessToken(
          id_user,
          decryptedTaboola
        );
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, signal });
      }

      if (response.status === 429) throw new Error("Taboola too many requests");
      clearTimeout(timeoutId);

      const json = await response.json();
      const data =
        days === 0
          ? json.results
          : Array.isArray(json.results)
          ? [
              json.results.find(
                (e: any) => Number(e.campaign) === Number(id_campaign_taboola)
              ),
            ].filter(Boolean)
          : [];

      return {
        external_id: id_campaign_taboola,
        expenses: data[0]?.spent || 0,
        clicks: data[0]?.clicks || 0,
        vcpm: data[0]?.vcpm || 0,
        vctr: data[0]?.vctr || 0,
        cpc: data[0]?.cpc || 0,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Taboola timeout");
      throw err;
    }
  }

  async getExtCampaignInfoByDateRange(
    id_user: number,
    id_campaign_taboola: string,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.taboola_info) {
      return {
        external_id: id_campaign_taboola,
        expenses: 0,
        clicks: 0,
        vcpm: 0,
        vctr: 0,
        cpc: 0,
      };
    }

    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    const url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/campaign-summary/dimensions/campaign_breakdown?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&campaign=${id_campaign_taboola}`;

    try {
      let response = await fetch(url, { ...options, signal });

      if (response.status === 401) {
        const newToken = await this.createAccessToken(
          id_user,
          decryptedTaboola
        );
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, signal });
      }

      if (response.status === 429) throw new Error("Taboola too many requests");
      clearTimeout(timeoutId);

      const json = await response.json();
      const data = Array.isArray(json.results)
        ? [
            json.results.find(
              (e: any) => Number(e.campaign) === Number(id_campaign_taboola)
            ),
          ].filter(Boolean)
        : [];

      return {
        external_id: id_campaign_taboola,
        expenses: data[0]?.spent || 0,
        clicks: data[0]?.clicks || 0,
        vcpm: data[0]?.vcpm || 0,
        vctr: data[0]?.vctr || 0,
        cpc: data[0]?.cpc || 0,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Taboola timeout");
      throw err;
    }
  }

  async getExternalAdsInfo(
    id_user: number,
    id_campaign_taboola: number,
    days: number
  ): Promise<ExternalAdInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    if (!user.taboola_info) return [];

    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const today = new Date();
    today.setHours(today.getHours() - 3);

    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = (date.getMonth() + 1).toString().padStart(2, "0");
      const dd = date.getDate().toString().padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    let url: string;

    if (days === 0) {
      const todayString = formatDate(today);
      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/realtime-top-campaign-content/dimensions/by_item?start_date=${todayString}T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${id_campaign_taboola}`;
    } else {
      const start = new Date(today);
      start.setDate(start.getDate() - days);
      const end = new Date(today);
      end.setDate(end.getDate() - 1);
      const startDate = formatDate(days > 400 ? new Date("2023-01-01") : start);
      const endDate = formatDate(end);

      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/top-campaign-content/dimensions/item_breakdown?start_date=${startDate}&end_date=${endDate}&campaign=${id_campaign_taboola}`;
    }

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
      signal,
    };

    try {
      let response = await fetch(url, options);

      if (response.status === 401) {
        const newToken = await this.createAccessToken(
          id_user,
          decryptedTaboola
        );
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, options);
      }

      if (response.status === 429) throw new Error("Taboola too many requests");

      clearTimeout(timeoutId);

      const json = await response.json();

      const results =
        json.results?.filter((item: any) => item.item || item.item_id) || [];

      return results.map((item: any) => ({
        id_taboola: item.item || item.item_id,
        title: item.item_name,
        thumbnail: item.thumbnail_url,
        expenses: item.spent,
        clicks: item.clicks,
        vcpm: item.vcpm,
        vctr: item.vctr,
        cpc: item.cpc,
      }));
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Taboola timeout");
      throw err;
    }
  }

  async getExternalAdsInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalAdInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);

    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/top-campaign-content/dimensions/item_breakdown?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&campaign=${id_campaign_taboola}`;

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
      signal,
    };

    try {
      let response = await fetch(url, options);

      if (response.status === 401) {
        const newToken = await this.createAccessToken(
          id_user,
          decryptedTaboola
        );
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, options);
      }

      if (response.status === 429) {
        throw new Error("Taboola too many requests");
      }

      clearTimeout(timeoutId);

      const json = await response.json();
      const filtered =
        json.results?.filter((item: any) => item.item !== null) || [];

      const data: ExternalAdInfo[] = filtered.map((item: any) => ({
        id_taboola: item.item,
        title: item.item_name,
        thumbnail: item.thumbnail_url,
        expenses: item.spent,
        clicks: item.clicks,
        vcpm: item.vcpm,
        vctr: item.vctr,
        cpc: item.cpc,
      }));

      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Taboola timeout");
      }
      throw err;
    }
  }

  async getExternalAdInfo(
    id_user: number,
    id_campaign_taboola: number,
    id_ad_taboola: number,
    days: number
  ): Promise<ExternalAdInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);

    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(id_user, decryptedTaboola);
    }

    const today = new Date();
    today.setHours(today.getHours() - 3);

    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = (date.getMonth() + 1).toString().padStart(2, "0");
      const dd = date.getDate().toString().padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    let url: string;

    if (days === 0) {
      const todayString = formatDate(today);
      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/realtime-top-campaign-content/dimensions/by_item?start_date=${todayString}T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${id_campaign_taboola}`;
    } else {
      const start = new Date(today);
      start.setDate(start.getDate() - days);
      const end = new Date(today);
      end.setDate(end.getDate() - 1);

      const startDate = formatDate(days > 400 ? new Date('2023-01-01') : start);
      const endDate = formatDate(end);

      url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/top-campaign-content/dimensions/item_breakdown?start_date=${startDate}&end_date=${endDate}&campaign=${id_campaign_taboola}`;
    }

    const options = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`
      }
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    try {
      let response = await fetch(url, { ...options, signal });

      if (response.status === 401) {
        const newToken = await this.createAccessToken(id_user, decryptedTaboola);
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, signal });
      }

      if (response.status === 429) throw new Error("Taboola too many requests");

      clearTimeout(timeoutId);

      const json = await response.json();
      const item = json.results?.find((item: any) => item.item === id_ad_taboola || item.item_id === id_ad_taboola);

      if (!item) return null;

      return {
        id_taboola: item.item || item.item_id,
        title: item.item_name,
        thumbnail: item.thumbnail_url,
        expenses: item.spent,
        clicks: item.clicks,
        vcpm: item.vcpm,
        vctr: item.vctr,
        cpc: item.cpc
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Taboola timeout");
      throw err;
    }
  }

  async getExternalAdInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    id_ad_taboola: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalAdInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);

    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(id_user, decryptedTaboola);
    }

    const url = `https://backstage.taboola.com/backstage/api/1.0/${decryptedTaboola.accoutId}/reports/top-campaign-content/dimensions/item_breakdown?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}&campaign=${id_campaign_taboola}`;

    const options = {
      method: 'GET',
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`
      }
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    try {
      let response = await fetch(url, { ...options, signal });

      if (response.status === 401) {
        const newToken = await this.createAccessToken(id_user, decryptedTaboola);
        options.headers.authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, signal });
      }

      if (response.status === 429) throw new Error("Taboola too many requests");

      clearTimeout(timeoutId);

      const json = await response.json();
      const item = json.results?.find((item: any) => item.item === id_ad_taboola || item.item_id === id_ad_taboola);

      if (!item) return null;

      return {
        id_taboola: item.item || item.item_id,
        title: item.item_name,
        thumbnail: item.thumbnail_url,
        expenses: item.spent,
        clicks: item.clicks,
        vcpm: item.vcpm,
        vctr: item.vctr,
        cpc: item.cpc
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") throw new Error("Taboola timeout");
      throw err;
    }
  }

  async getExternalSitesInfo(
    id_user: number,
    id_campaign_taboola: number,
    days: number
  ): Promise<ExternalSiteInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }
    const today = new Date();
    today.setHours(today.getHours() - 3);
    const month =
      today.getMonth() + 1 > 9
        ? today.getMonth() + 1
        : `0${today.getMonth() + 1}`;
    const todayString =
      today.getFullYear() + "-" + month + "-" + today.getDate();

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    let data;
    if (days == 0) {
      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/realtime-campaign-summary/dimensions/by_site?start_date=${todayString}T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          } else if (res.status === 429) {
            throw new Error("Taboola too many requests");
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.map((item) => {
            return {
              id_taboola: item.site_id,
              name: item.site_name,
              site: item.site,
              expenses: item.spent,
              clicks: item.clicks,
              vcpm: item.vcpm,
              vctr: item.vctr,
              cpc: item.cpc,
            };
          });
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    } else if (days == 1) {
      const date = new Date();
      date.setDate(today.getDate() - 1);
      const month =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`;
      const dateString =
        date.getFullYear() + "-" + month + "-" + date.getDate();

      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/campaign-summary/dimensions/site_breakdown?start_date=${dateString}T00%3A00%3A00&end_date=${dateString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.map((item) => {
            return {
              id_taboola: item.site_id,
              name: item.site_name,
              site: item.site,
              expenses: item.spent,
              clicks: item.clicks,
              vcpm: item.vcpm,
              vctr: item.vctr,
              cpc: item.cpc,
            };
          });
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    } else if (days > 400) {
      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/campaign-summary/dimensions/site_breakdown?start_date=2023-01-01T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.map((item) => {
            return {
              id_taboola: item.site_id,
              name: item.site_name,
              site: item.site,
              expenses: item.spent,
              clicks: item.clicks,
              vcpm: item.vcpm,
              vctr: item.vctr,
              cpc: item.cpc,
            };
          });
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    } else {
      const date = new Date();
      date.setDate(today.getDate() - days);
      const month =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`;
      const dateString =
        date.getFullYear() + "-" + month + "-" + date.getDate();

      const endDate = new Date();
      endDate.setDate(today.getDate() - 1);
      const monthEndDate = endDate.getMonth() + 1 > 9 ? endDate.getMonth() + 1 : `0${endDate.getMonth() + 1}`;
      const dateEndString = endDate.getFullYear() + "-" + monthEndDate + "-" + endDate.getDate();

      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/campaign-summary/dimensions/site_breakdown?start_date=${dateString}T00%3A00%3A00&end_date=${dateEndString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.map((item) => {
            return {
              id_taboola: item.site_id,
              name: item.site_name,
              site: item.site,
              expenses: item.spent,
              clicks: item.clicks,
              vcpm: item.vcpm,
              vctr: item.vctr,
              cpc: item.cpc,
            };
          });
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    }

    return data;
  }

  async getExternalSitesInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalSiteInfo[]> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);

    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    let data;

    const url = `https://backstage.taboola.com/backstage/api/1.0/${
      decryptedTaboola.accoutId
    }/reports/campaign-summary/dimensions/site_breakdown?start_date=${
      dateRange.startDate
    }T00%3A00%3A00&end_date=${dateRange.endDate}T23%3A59%3A59&campaign=${[
      id_campaign_taboola,
    ]}`;

    await fetch(url, { ...options, signal })
      .then(async (res) => {
        let response = res;
        if (res.status === 401) {
          let newToken = await this.createAccessToken(
            id_user,
            decryptedTaboola
          );
          options.headers.authorization = `Bearer ${newToken}`;

          response = await fetch(url, { ...options, signal });
        }
        clearTimeout(timeoutId);
        return response.json();
      })
      .then((json) => {
        data = json.results.map((item) => {
          return {
            id_taboola: item.site_id,
            name: item.site_name,
            site: item.site,
            expenses: item.spent,
            clicks: item.clicks,
            vcpm: item.vcpm,
            vctr: item.vctr,
            cpc: item.cpc,
          };
        });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          throw new Error("Taboola timeout");
        }
        throw err;
      });

    return data;
  }

  async getExternalSiteInfo(
    id_user: number,
    id_campaign_taboola: number,
    id_site: number,
    days: number
  ): Promise<ExternalSiteInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);
    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }
    const today = new Date();
    today.setHours(today.getHours() - 3);
    const month =
      today.getMonth() + 1 > 9
        ? today.getMonth() + 1
        : `0${today.getMonth() + 1}`;
    const todayString =
      today.getFullYear() + "-" + month + "-" + today.getDate();

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    let data;

    if (days == 0) {
      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/realtime-campaign-summary/dimensions/by_site?start_date=${todayString}T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          } else if (res.status === 429) {
            throw new Error("Taboola too many requests");
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.find((element) => element.site_id == id_site);
          if (!data) return (data = null);
          data = {
            id_taboola: id_campaign_taboola,
            site: data.site_id,
            name: data.site_name,
            expenses: data.spent,
            clicks: data.clicks,
            vcpm: data.vcpm,
            vctr: data.vctr,
            cpc: data.cpc,
          };
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    } else if (days == 1) {
      const date = new Date();
      date.setDate(today.getDate() - 1);
      const month =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`;
      const dateString =
        date.getFullYear() + "-" + month + "-" + date.getDate();

      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/campaign-summary/dimensions/site_breakdown?start_date=${dateString}T00%3A00%3A00&end_date=${dateString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.find((element) => element.site_id == id_site);
          if (!data) return (data = null);
          data = {
            id_taboola: id_campaign_taboola,
            site: data.site_id,
            name: data.site_name,
            expenses: data.spent,
            clicks: data.clicks,
            vcpm: data.vcpm,
            vctr: data.vctr,
            cpc: data.cpc,
          };
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    } else if (days > 400) {
      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/campaign-summary/dimensions/site_breakdown?start_date=2023-01-01T00%3A00%3A00&end_date=${todayString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.find((element) => element.site_id == id_site);
          if (!data) return (data = null);
          data = {
            id_taboola: id_campaign_taboola,
            site: data.site_id,
            name: data.site_name,
            expenses: data.spent,
            clicks: data.clicks,
            vcpm: data.vcpm,
            vctr: data.vctr,
            cpc: data.cpc,
          };
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    } else {
      const date = new Date();
      date.setDate(today.getDate() - days);
      const month =
        date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : `0${date.getMonth() + 1}`;
      const dateString =
        date.getFullYear() + "-" + month + "-" + date.getDate();

      const endDate = new Date();
      endDate.setDate(today.getDate() - 1);
      const monthEndDate = endDate.getMonth() + 1 > 9 ? endDate.getMonth() + 1 : `0${endDate.getMonth() + 1}`;
      const dateEndString = endDate.getFullYear() + "-" + monthEndDate + "-" + endDate.getDate();

      const url = `https://backstage.taboola.com/backstage/api/1.0/${
        decryptedTaboola.accoutId
      }/reports/campaign-summary/dimensions/site_breakdown?start_date=${dateString}T00%3A00%3A00&end_date=${dateEndString}T23%3A59%3A59&campaign=${[
        id_campaign_taboola,
      ]}`;
      await fetch(url, { ...options, signal })
        .then(async (res) => {
          let response = res;
          if (res.status === 401) {
            let newToken = await this.createAccessToken(
              id_user,
              decryptedTaboola
            );
            options.headers.authorization = `Bearer ${newToken}`;

            response = await fetch(url, { ...options, signal });
          }
          clearTimeout(timeoutId);
          return response.json();
        })
        .then((json) => {
          data = json.results.find((element) => element.site_id == id_site);
          if (!data) return (data = null);
          data = {
            id_taboola: id_campaign_taboola,
            site: data.site_id,
            name: data.site_name,
            expenses: data.spent,
            clicks: data.clicks,
            vcpm: data.vcpm,
            vctr: data.vctr,
            cpc: data.cpc,
          };
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            throw new Error("Taboola timeout");
          }
          throw err;
        });
    }

    return data;
  }

  async getExternalSiteInfoByDateRange(
    id_user: number,
    id_campaign_taboola: number,
    id_site: number,
    dateRange: { startDate: string; endDate: string }
  ): Promise<ExternalSiteInfo> {
    const user = await this.accountMySqlRepository.loadById(id_user);

    const decryptedTaboola = await this.decrypter.decrypt(user.taboola_info);
    if (!user.taboola_access_token) {
      user.taboola_access_token = await this.createAccessToken(
        id_user,
        decryptedTaboola
      );
    }

    const options = {
      method: "GET",
      headers: {
        authorization: `Bearer ${user.taboola_access_token}`,
      },
    };

    const controller = new AbortController();
    const signal = controller.signal as unknown as AbortSignal;
    const timeoutId = setTimeout(() => controller.abort(), this.ABORT_TIMEOUT);

    const url = `https://backstage.taboola.com/backstage/api/1.0/${
      decryptedTaboola.accoutId
    }/reports/campaign-summary/dimensions/site_breakdown?start_date=${
      dateRange.startDate
    }T00%3A00%3A00&end_date=${dateRange.endDate}T23%3A59%3A59&campaign=${[
      id_campaign_taboola,
    ]}`;

    let data;

    await fetch(url, { ...options, signal })
      .then(async (res) => {
        let response = res;
        if (res.status === 401) {
          let newToken = await this.createAccessToken(
            id_user,
            decryptedTaboola
          );
          options.headers.authorization = `Bearer ${newToken}`;

          response = await fetch(url, { ...options, signal });
        }
        clearTimeout(timeoutId);
        return response.json();
      })
      .then((json) => {
        data = json.results.find((element) => element.site_id == id_site);
        if (!data) return (data = null);
        data = {
          id_taboola: id_campaign_taboola,
          site: data.site_id,
          name: data.site_name,
          expenses: data.spent,
          clicks: data.clicks,
          vcpm: data.vcpm,
          vctr: data.vctr,
          cpc: data.cpc,
        };
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          throw new Error("Taboola timeout");
        }
        throw err;
      });
    return data;
  }
}
