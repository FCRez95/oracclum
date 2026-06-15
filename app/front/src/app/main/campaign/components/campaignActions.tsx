"use server";

import { validator } from "@/utils/validator/validator";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

import { CreateCampaignApi } from "@/app/(DataAccessLayer)/(appServices)/calls/campaigns/createCampaign/callCreateCampaignApi";
import { LoadSubaccountsApi } from "@/app/(DataAccessLayer)/(appServices)/calls/campaigns/subaccounts/callSubaccountsApi";
import { DeleteCampaignApi } from "@/app/(DataAccessLayer)/(appServices)/calls/campaigns/deleteCampaign/callDeleteCampaignApi";
import { EditCampaignFullApi } from "@/app/(DataAccessLayer)/(appServices)/calls/campaigns/editCampaignFull/callEditCampaignFullApi";
import { loadUserCampaignOptimData } from "@/app/(DataAccessLayer)/(appServices)/calls/loadUserCampaign/callLoadUserCampaignOptimData";
import { loadUserCampaignTaboola } from "@/app/(DataAccessLayer)/(appServices)/calls/taboola/loadUserCampaignTaboola";
import { callCampaignAdsSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/loadCampaignAdsSummary/callCampaignAdsSummary";
import { callOneAdSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/loadOneAdSummary/callOneAdSummary";
import { updateTaboolaAdInternal } from "@/app/(DataAccessLayer)/(appServices)/calls/taboola/updateTaboolaAdInternal";
import { getTaboolaAdsDataInternal } from "@/app/(DataAccessLayer)/(appServices)/calls/taboola/getTaboolaAdsDataInternal";
import { callCampaignSitesSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/loadCampaignSitesSummary/callCampaignSitesSummary";
import { callOneSiteSummary } from "@/app/(DataAccessLayer)/(appServices)/calls/loadOneSiteSummary/callOneSiteSummary";
import { updateCampaignTaboola } from "@/app/(DataAccessLayer)/(appServices)/calls/taboola/updateCampaignTaboola";
import { callStepsByTime } from "@/app/(DataAccessLayer)/(appServices)/calls/site/callLoadStepsByTime";
import { callLoadCampaignStepsByTime } from "@/app/(DataAccessLayer)/(appServices)/calls/loadUserCampaign/callLoadCampaignStepsByTime";
import { TaboolaCallerWrapper } from "@/utils/TaboolaCallerWrapper";
import { TaboolaSubaccountModel } from "@/models/taboola-subaccount-model";
import { ListTaboolaCampaignsApi } from "@/app/(DataAccessLayer)/(appServices)/calls/taboola/listTaboolaCampaigns";
import { ExternalCampaignModel } from "@/models/external-campaign-model";
import { isFrontendMockDemoSession } from "@/demo/demoMode";
import {
  getDemoCampaignOptimization,
  getDemoCampaignSites,
  getDemoCampaignSteps,
  getDemoCreatedCampaign,
  getDemoExternalCampaigns,
  getDemoOneSummary,
  getDemoSiteSteps,
  getDemoSubaccounts,
  getDemoTaboolaAdStatuses,
  getDemoTaboolaAds,
  getDemoTaboolaCampaignData,
} from "@/demo/demoData";

export interface SubaccountsData {
  results: TaboolaSubaccountModel[];
}

async function getCurrentSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  return sessionCookie ? verifySession(sessionCookie) : null;
}

async function isFrontendDemoSession() {
  return isFrontendMockDemoSession(await getCurrentSession());
}

export const getUserPlanInfo = async (): Promise<{
  user_type: string;
  allow_clicks: boolean;
}> => {
  const payload = await getCurrentSession();
  if (!payload?.userData) throw new Error("Sessão inválida");

  const userData = typeof payload.userData === "string"
    ? JSON.parse(payload.userData)
    : payload.userData;

  return {
    user_type: userData.user_type ?? "",
    allow_clicks: userData.allow_clicks ?? false,
  };
};

export const loadSubaccountsAction = async (): Promise<{ success: boolean; data?: SubaccountsData; errors?: Record<string, string[]> }> => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoSubaccounts() };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const response = await LoadSubaccountsApi(sessionCookies);

    if (!response.success) {
      return {
        success: false,
        errors: response.error ? { general: [response.error] } : {},
      };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Failed to load subaccounts:", error);
    return {
      success: false,
      errors: { general: ["Failed to load subaccounts"] },
    };
  }
};

export const loadTaboolaCampaignsAction = async (
  subAccount?: string
): Promise<{ success: boolean; data?: ExternalCampaignModel[]; errors?: Record<string, string[]> }> => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoExternalCampaigns() };
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) throw new Error("Sessão não encontrada");

    const payload = await verifySession(sessionCookie);
    if (!payload?.taboolaData) throw new Error("Sessão inválida");

    const sessionCookies = cookieStore.toString();
    const response = await TaboolaCallerWrapper(
      ListTaboolaCampaignsApi(sessionCookies, subAccount),
      sessionCookies
    );

    const results = (response as { data?: { results?: { id: string | number; name: string }[] } })?.data?.results || [];
    const campaigns: ExternalCampaignModel[] = results.map((c: { id: string | number; name: string }) => ({
      id: c.id,
      name: c.name,
    }));

    return { success: true, data: campaigns };
  } catch (error) {
    console.error("Failed to load Taboola campaigns:", error);
    return {
      success: false,
      errors: { general: ["Failed to load Taboola campaigns"] },
    };
  }
};

export const createCampaignAction = async (
  formData: FormData
): Promise<{
  success: boolean;
  errors?: Record<string, string[]>;
  data?: {
    id: number;
    name: string;
    ad_provider: string;
    checkout_provider: string;
    conversion_name: string;
    id_user: number;
    link: string;
    sub_account?: string;
    click_auth: string;
    external_id: string;
  };
}> => {
  const result = await validator("createCampaign", formData);

  if (!result.success) {
    return { success: false, errors: result.errors };
  }

  const payload = {
    name: formData.get("campaignName") as string,
    link: formData.get("campaignLink") as string,
    ad_provider: formData.get("ad_provider") as string,
    checkout_provider: formData.get("checkout_provider") as string,
    conversion_name: formData.get("conversion_name") as string,
    sub_account: (formData.get("sub_account") as string) || undefined,
    external_id: formData.get("external_id") as string,
  };

  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoCreatedCampaign(formData) };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const createResponse = await CreateCampaignApi(payload, sessionCookies);

    if (createResponse.errors) {
      return { success: false, errors: createResponse.errors };
    }

    return {
      success: true,
      data: {
        id: createResponse.data.id,
        name: createResponse.data.name,
        ad_provider: createResponse.data.ad_provider,
        checkout_provider: createResponse.data.checkout_provider,
        conversion_name: createResponse.data.conversion_name,
        id_user: createResponse.data.id_user,
        link: createResponse.data.link,
        sub_account: createResponse.data.sub_account || undefined,
        click_auth: createResponse.data.click_auth,
        external_id: createResponse.data.external_id,
      },
    };
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return {
      success: false,
      errors: { general: ["Failed to create campaign"] },
    };
  }
};

export const deleteCampaignAction = async (campaignId?: number) => {
  if (!campaignId) {
    return {
      success: false,
      errors: { general: ["ID of campaign is required."] },
    };
  }

  try {
    if (await isFrontendDemoSession()) {
      return { success: true };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const response = await DeleteCampaignApi(campaignId, sessionCookies);

    if (response.success) {
      return { success: true };
    }

    return {
      success: false,
      errors: response.errors || { general: ["Failed to delete campaign."] },
    };
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return {
      success: false,
      errors: { general: ["Internal error deleting campaign."] },
    };
  }
};

export const editCampaignFullAction = async (
  idCampaign: number,
  formData: FormData
): Promise<{
  success: boolean;
  errors?: Record<string, string[]>;
}> => {
  const result = await validator("editCampaign", formData);

  if (!result.success) {
    return { success: false, errors: result.errors };
  }

  const payload = {
    idCampaign,
    name: formData.get("campaignName") as string,
    link: formData.get("campaignLink") as string,
    conversion_name: formData.get("conversion_name") as string,
    ad_provider: formData.get("ad_provider") as string,
    sub_account: (formData.get("sub_account") as string) || undefined,
    checkout_provider: (formData.get("checkout_provider") as string) || undefined,
    external_id: (formData.get("external_id") as string) || undefined,
  };

  try {
    if (await isFrontendDemoSession()) {
      return { success: true };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const response = await EditCampaignFullApi(payload, sessionCookies);

    if (!response.success) {
      return {
        success: false,
        errors: response.errors ?? { form: ["Erro ao editar campanha."] },
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error editing campaign:", error);
    return {
      success: false,
      errors: { general: ["Erro interno ao editar campanha."] },
    };
  }
};

export const loadCampaignOptimAction = async (
  campaignId: number,
  days: number
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoCampaignOptimization(campaignId) };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await loadUserCampaignOptimData(
      campaignId,
      days,
      sessionCookies
    );
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar campanha:", error);
    return { success: false, errors: { general: ["Erro ao buscar campanha"] } };
  }
};

export const loadCampaignStepsAction = async (
  campaignId: number,
  days: number,
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoCampaignSteps(campaignId) };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callLoadCampaignStepsByTime(campaignId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar passos do funil:", error);
    return { success: false, errors: { general: ["Erro ao buscar passos do funil"] } };
  }
};

export const loadTaboolaCampaignDataAction = async (
  campaignId: string,
  subAccount?: string | null
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoTaboolaCampaignData() };
    }

    const cookieStore = await cookies();
    const sessionCookiesEncrypt = cookieStore.toString();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) throw new Error("Sessão não encontrada");

    const payload = await verifySession(sessionCookie);
    if (!payload?.taboolaData) throw new Error("Sessão inválida");
    const taboolaData =
      typeof payload.taboolaData === "string"
        ? JSON.parse(payload.taboolaData)
        : payload.taboolaData;

    const data = await TaboolaCallerWrapper(
      loadUserCampaignTaboola(
        taboolaData.account_id,
        campaignId,
        sessionCookiesEncrypt,
        taboolaData.access_token,
        subAccount
      ),
      sessionCookiesEncrypt
    );
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar dados da campanha Taboola:", error);
    return { success: false, errors: { general: ["Erro ao buscar dados da campanha Taboola:", error] } };
  }
};

export const updateTaboolaCampaignDataAction = async (
  campaignId: string,
  data: object,
  subAccount?: string
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: { success: true, updated: data } };
    }

    const cookieStore = await cookies();
    const sessionCookiesEncrypt = cookieStore.toString();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) throw new Error("Sessão não encontrada");

    const payload = await verifySession(sessionCookie);
    if (!payload?.taboolaData) throw new Error("Sessão inválida");
    const taboolaData =
      typeof payload.taboolaData === "string"
        ? JSON.parse(payload.taboolaData)
        : payload.taboolaData;

    const response = await TaboolaCallerWrapper(
      updateCampaignTaboola(
        taboolaData.account_id,
        campaignId,
        sessionCookiesEncrypt,
        taboolaData.access_token,
        data,
        subAccount
      ),
      sessionCookiesEncrypt
    );

    return { success: true, data: response };
  } catch (error) {
    console.error("Erro ao atualizar dados da campanha Taboola:", error);
    return { success: false, errors: { general: ["Erro ao atualizar dados da campanha Taboola", error] } };
  }
};

export const loadCampaignAdsAction = async (
  campaignId: number | string,
  days: number
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoTaboolaAds() };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();

    const data = await callCampaignAdsSummary(campaignId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar anúncios da campanha:", error);
    return {
      success: false,
      errors: { general: ["Erro ao buscar anúncios da campanha"] },
    };
  }
};

export const loadOneAdAction = async (
  campaignId: number | string,
  adId: number | string,
  days: number | string
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoOneSummary(adId) };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();

    const data = await callOneAdSummary(campaignId, adId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar info do anúncio:", error);
    return {
      success: false,
      errors: { general: ["Erro ao buscar info do anúncio"] },
    };
  }
};

export const updateTaboolaAdAction = async (
  campaignTaboolaId: number | string,
  itemId: number | string,
  updateData: Record<string, unknown>,
  subAccount?: string
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: { success: true, updated: updateData } };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();

    const data = await TaboolaCallerWrapper(updateTaboolaAdInternal(
      sessionCookies,
      campaignTaboolaId,
      itemId,
      updateData,
      subAccount
    ), sessionCookies);

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    return {
      success: false,
      errors: { general: ["Erro ao atualizar anúncio"], error},
    };
  }
};

export const getTaboolaAdsDataAction = async (campaignTaboolaId: number | string, subAccount?: string) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoTaboolaAdStatuses() };
    }

    const cookieStore = await cookies();
    const cookiesHeader = cookieStore.toString();

    const data = await TaboolaCallerWrapper(getTaboolaAdsDataInternal(cookiesHeader, Number(campaignTaboolaId), subAccount), cookiesHeader);

    return { success: true, data };
  } catch (error) {
    console.error("Erro em getTaboolaAdsDataAction:", error);
    return { success: false, errors: { general: ["Erro ao buscar anúncios da Taboola", error] } };
  }
};

export const loadCampaignSitesAction = async (
  campaignId: number | string,
  days: number,
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoCampaignSites() };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callCampaignSitesSummary(campaignId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar sites da campanha:", error);
    return { success: false, errors: { general: ["Erro ao buscar sites da campanha"] } };
  }
};

export const loadOneSiteAction = async (
  campaignId: number | string,
  siteId: number | string,
  days: number,
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoOneSummary(siteId) };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callOneSiteSummary(campaignId, siteId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar info do site:", error);
    return { success: false, errors: { general: ["Erro ao buscar info do site"] } };
  }
};

export const loadSiteStepsSummaryAction = async (
  campaignId: number | string,
  siteId: number | string,
  days: number,
) => {
  try {
    if (await isFrontendDemoSession()) {
      return { success: true, data: getDemoSiteSteps() };
    }

    const cookieStore = await cookies();
    const sessionCookies = cookieStore.toString();
    const data = await callStepsByTime(campaignId, siteId, days, sessionCookies);
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar steps by time:", error);
    return { success: false, errors: { general: ["Erro ao buscar steps by time"] } };
  }
};
