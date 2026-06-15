"use server";

import { getMetaData } from "@/app/main/integration/integrationActions";
import { cookies } from "next/headers";
import { callMetaAdsetsSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callMetaAdsetsSummary";
import { callMetaAdsSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callMetaAdsSummary";
import { callOneMetaAdSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callOneMetaAdSummary";
import { getSessionData } from "@/app/(DataAccessLayer)/(appServices)/calls/getSession/callGetSessionData";
import { isFrontendMockDemoSession } from "@/demo/demoMode";
import {
  getDemoMetaAdsConfig,
  getDemoMetaAdsSummary,
  getDemoMetaAdsetsConfig,
  getDemoMetaAdsetsSummary,
  getDemoMetaAdSummary,
  getDemoMetaCampaignData,
} from "@/demo/demoData";

const META_API = "https://graph.facebook.com/v24.0";

async function isFrontendDemoSession() {
  return isFrontendMockDemoSession(await getSessionData());
}

async function getToken(): Promise<string> {
  const result = await getMetaData();
  if (!result.success || !result.metaData?.metaAdsToken) {
    throw new Error("Meta token not found");
  }
  return result.metaData.metaAdsToken;
}

export async function loadMetaCampaignDataAction(externalId: string) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoMetaCampaignData() };
    }

    const token = await getToken();
    const res = await fetch(
      `${META_API}/${externalId}?fields=name,status,objective,daily_budget,lifetime_budget,buying_type,bid_strategy&access_token=${token}`
    );
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("loadMetaCampaignDataAction error:", error);
    return { success: false, errors: { general: ["Erro ao buscar dados da campanha Meta"] } };
  }
}

export async function updateMetaCampaignAction(
  externalId: string,
  updateData: Record<string, unknown>
) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: { success: true, id: externalId, ...updateData } };
    }

    const token = await getToken();
    const res = await fetch(`${META_API}/${externalId}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("updateMetaCampaignAction error:", error);
    return { success: false, errors: { general: ["Erro ao atualizar campanha Meta"] } };
  }
}

export async function loadMetaAdsetsSummaryAction(
  campaignId: number | string,
  days: number
) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoMetaAdsetsSummary() };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callMetaAdsetsSummary(campaignId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("loadMetaAdsetsSummaryAction error:", error);
    return { success: false, errors: { general: ["Erro ao buscar adsets"] } };
  }
}

export async function loadMetaAdsetsConfigAction(campaignExternalId: string) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoMetaAdsetsConfig() };
    }

    const token = await getToken();
    const res = await fetch(
      `${META_API}/${campaignExternalId}/adsets?fields=name,status,effective_status,daily_budget,lifetime_budget,bid_amount,bid_strategy,optimization_goal,issues_info&access_token=${token}`
    );
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const json = await res.json();
    return { success: true, data: json.data };
  } catch (error) {
    console.error("loadMetaAdsetsConfigAction error:", error);
    return { success: false, errors: { general: ["Erro ao buscar config dos adsets"] } };
  }
}

export async function updateMetaAdsetAction(
  adsetId: string,
  updateData: Record<string, unknown>
) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: { success: true, id: adsetId, ...updateData } };
    }

    const token = await getToken();
    const res = await fetch(`${META_API}/${adsetId}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("updateMetaAdsetAction error:", error);
    return { success: false, errors: { general: ["Erro ao atualizar adset"] } };
  }
}

export async function loadMetaAdsSummaryAction(
  campaignId: number | string,
  days: number
) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoMetaAdsSummary() };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callMetaAdsSummary(campaignId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("loadMetaAdsSummaryAction error:", error);
    return { success: false, errors: { general: ["Erro ao buscar ads"] } };
  }
}

export async function loadMetaAdsConfigAction(campaignExternalId: string) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoMetaAdsConfig() };
    }

    const token = await getToken();
    const res = await fetch(
      `${META_API}/${campaignExternalId}/ads?fields=id,name,status,effective_status,adset_id,creative{thumbnail_url,title,body}&access_token=${token}`
    );
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const json = await res.json();
    return { success: true, data: json.data };
  } catch (error) {
    console.error("loadMetaAdsConfigAction error:", error);
    return { success: false, errors: { general: ["Erro ao buscar config dos ads"] } };
  }
}

export async function loadOneMetaAdAction(
  campaignId: number | string,
  adId: number | string,
  days: number | string
) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoMetaAdSummary(adId) };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callOneMetaAdSummary(campaignId, adId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("loadOneMetaAdAction error:", error);
    return { success: false, errors: { general: ["Erro ao buscar info do ad"] } };
  }
}

export async function updateMetaAdAction(
  adId: string,
  updateData: Record<string, unknown>
) {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: { success: true, id: adId, ...updateData } };
    }

    const token = await getToken();
    const res = await fetch(`${META_API}/${adId}?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`Meta API error: ${res.status}`);
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("updateMetaAdAction error:", error);
    return { success: false, errors: { general: ["Erro ao atualizar ad"] } };
  }
}
