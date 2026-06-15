import type { CampaignStepsSummary } from "@/models/campaign-steps-summary";
import type { CampaignSiteSummaryModel } from "@/models/campaign-sites-summary";
import type { CampaignSummaryModel } from "@/models/campaign-summary";
import type { CampaignOptimizationModel } from "@/models/campaign-optimization";
import type { ClickStepsModel } from "@/models/click/click-steps";
import type { MetaClickStepsModel } from "@/models/click/meta-click-steps";
import type { ExternalCampaignModel } from "@/models/external-campaign-model";
import type { MetaAdModel } from "@/models/meta-ad-model";
import type { MetaAdsetModel } from "@/models/meta-adset-model";
import type { MetaCampaignData } from "@/models/meta-campaign-data";
import type { OptimizationData } from "@/models/optimization-data";
import type { SessionPayload } from "@/models/SessionPayload";
import type { TaboolaSubaccountModel } from "@/models/taboola-subaccount-model";
import { FRONTEND_DEMO_MODE } from "./demoMode";

const DEMO_PLACEHOLDER_IMAGE = "/placeholder.webp";

type TaboolaCampaignApiData = {
  cpc: number;
  daily_cap: number;
  is_active: boolean;
  publisher_bid_modifier: { values: { target: string; cpc_modification: number }[] };
  publisher_targeting: { value: string[] };
};

type DemoTaboolaAd = {
  id_ads_taboola: string;
  title: string;
  thumbnail: string;
  campaign_name?: string;
  status: boolean;
  summary: OptimizationData;
};

type DemoMetaAdConfig = Omit<MetaAdModel, "summary" | "thumbnail" | "title" | "body"> & {
  creative: {
    thumbnail_url: string;
    title: string;
    body: string;
  };
};

const demoUser = {
  id: 9001,
  name: "Oracclum Demo",
  email: "demo@oracclum.local",
  access_token: "demo-access-token",
  user_type: "pro",
  allow_clicks: true,
  cpfcnpj: "000.000.000-00",
  phone: "+55 11 90000-0000",
};

const demoTaboolaAccount = {
  access_token: "demo-taboola-token",
  account_id: "demo-taboola-account",
  client_id: "demo-taboola-client",
  client_secret: "demo-taboola-secret",
};

const demoMetaAccount = {
  access_token: "demo-meta-token",
  allowed_accounts: [
    { account_id: "1234567890", name: "Oracclum Demo Ads" },
    { account_id: "9876543210", name: "Scale Lab Demo" },
  ],
};

const demoContract = {
  id_user: demoUser.id,
  contract_signed: true,
  signed_at: "2026-01-01T12:00:00.000Z",
};

const baseSummary: OptimizationData = {
  revenue: 18420.75,
  expenses: 4180.4,
  cpc: 1.24,
  vcpm: 18.8,
  cpa: 36.35,
  vctr: 2.9,
  clicks: 3378,
  checkout: 438,
  sales: 115,
  roas: 4.41,
  visible_impressions: 116482,
};

const demoCampaigns: CampaignSummaryModel[] = [
  {
    id: 101,
    external_id: "tb-demo-101",
    id_user: demoUser.id,
    name: "Taboola - Fitness Lead Magnet",
    link: "https://demo.oracclum.local/fitness",
    sub_account: "demo-subaccount",
    ad_provider: "taboola",
    checkout_provider: "perfectpay",
    conversion: "purchase",
    expenses: 4180.4,
    revenue: 18420.75,
    clicks: 3378,
    checkout: 438,
    sales: 115,
    roas: 4.41,
  },
  {
    id: 202,
    external_id: "mt-demo-202",
    id_user: demoUser.id,
    name: "Meta - SaaS Retargeting",
    link: "https://demo.oracclum.local/retargeting",
    ad_provider: "meta",
    checkout_provider: "hotmart",
    conversion: "lead",
    expenses: 2950.9,
    revenue: 11280.5,
    clicks: 2411,
    checkout: 292,
    sales: 74,
    roas: 3.82,
  },
];

const demoCampaignOptimizations: Record<number, CampaignOptimizationModel> = {
  101: {
    id: 101,
    external_id: "tb-demo-101",
    id_user: demoUser.id,
    name: "Taboola - Fitness Lead Magnet",
    link: "https://demo.oracclum.local/fitness",
    sub_account: "demo-subaccount",
    ad_provider: "taboola",
    checkout_provider: "perfectpay",
    conversion_name: "purchase",
    click_auth: "demo-click-101",
    summary: baseSummary,
  },
  202: {
    id: 202,
    external_id: "mt-demo-202",
    id_user: demoUser.id,
    name: "Meta - SaaS Retargeting",
    link: "https://demo.oracclum.local/retargeting",
    ad_provider: "meta",
    checkout_provider: "hotmart",
    conversion_name: "lead",
    click_auth: "demo-click-202",
    summary: {
      ...baseSummary,
      revenue: 11280.5,
      expenses: 2950.9,
      clicks: 2411,
      checkout: 292,
      sales: 74,
      roas: 3.82,
    },
  },
};

const taboolaCampaignData: TaboolaCampaignApiData = {
  cpc: 1.35,
  daily_cap: 450,
  is_active: true,
  publisher_bid_modifier: {
    values: [
      { target: "publisher-a.example", cpc_modification: 1.25 },
      { target: "publisher-b.example", cpc_modification: 0.82 },
      { target: "publisher-c.example", cpc_modification: 1.08 },
    ],
  },
  publisher_targeting: {
    value: ["low-quality.example"],
  },
};

const taboolaAds: DemoTaboolaAd[] = [
  {
    id_ads_taboola: "tb-ad-301",
    title: "Quiz: Descubra seu plano ideal",
    thumbnail: DEMO_PLACEHOLDER_IMAGE,
    campaign_name: demoCampaigns[0].name,
    status: true,
    summary: { ...baseSummary, revenue: 8240, expenses: 1880, clicks: 1460, checkout: 190, sales: 51, roas: 4.38 },
  },
  {
    id_ads_taboola: "tb-ad-302",
    title: "Antes e depois do protocolo",
    thumbnail: DEMO_PLACEHOLDER_IMAGE,
    campaign_name: demoCampaigns[0].name,
    status: false,
    summary: { ...baseSummary, revenue: 4960, expenses: 1260, clicks: 1024, checkout: 121, sales: 31, roas: 3.94 },
  },
  {
    id_ads_taboola: "tb-ad-303",
    title: "Oferta direta para remarketing",
    thumbnail: DEMO_PLACEHOLDER_IMAGE,
    campaign_name: demoCampaigns[0].name,
    status: true,
    summary: { ...baseSummary, revenue: 5220.75, expenses: 1040.4, clicks: 894, checkout: 127, sales: 33, roas: 5.02 },
  },
];

const campaignSites: CampaignSiteSummaryModel[] = [
  {
    id_campaign: "101",
    id_site: "site-401",
    site: "publisher-a.example",
    target: "publisher-a.example",
    summary: { ...baseSummary, revenue: 7020, expenses: 1500, clicks: 1212, checkout: 168, sales: 44, roas: 4.68 },
  },
  {
    id_campaign: "101",
    id_site: "site-402",
    site: "publisher-b.example",
    target: "publisher-b.example",
    summary: { ...baseSummary, revenue: 3920, expenses: 1120, clicks: 860, checkout: 92, sales: 23, roas: 3.5 },
  },
  {
    id_campaign: "101",
    id_site: "site-403",
    site: "publisher-c.example",
    target: "publisher-c.example",
    summary: { ...baseSummary, revenue: 7480.75, expenses: 1560.4, clicks: 1306, checkout: 178, sales: 48, roas: 4.79 },
  },
];

const campaignSteps: CampaignStepsSummary = {
  id: 101,
  name: "Demo Funnel",
  link: "https://demo.oracclum.local/fitness",
  total_clicks: 3378,
  total_sales: 115,
  revenue: 18420.75,
  total_step_1: 2842,
  step_1_views: 2842,
  total_step_2: 1716,
  step_2_views: 1716,
  total_step_3: 884,
  step_3_views: 884,
  total_checkout: 438,
  checkout_views: 438,
};

const siteSteps = {
  id: 401,
  sales: 44,
  revenue: 7020,
  total_checkout: 168,
  checkout_views: 168,
  total_step_1: 1020,
  step_1_views: 1020,
  total_step_2: 640,
  step_2_views: 640,
  total_step_3: 310,
  step_3_views: 310,
  total_step_4: 168,
  step_4_views: 168,
};

const metaCampaignData: MetaCampaignData = {
  status: "ACTIVE",
  effective_status: "ACTIVE",
  objective: "OUTCOME_SALES",
  daily_budget: "35000",
  lifetime_budget: "0",
  buying_type: "AUCTION",
};

const metaAdsetsConfig: MetaAdsetModel[] = [
  {
    id: "mt-adset-501",
    name: "Warm audience - 14 days",
    status: "ACTIVE",
    effective_status: "ACTIVE",
    daily_budget: "18000",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    optimization_goal: "OFFSITE_CONVERSIONS",
  },
  {
    id: "mt-adset-502",
    name: "Lookalike buyers - 2 percent",
    status: "PAUSED",
    effective_status: "PAUSED",
    daily_budget: "17000",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    optimization_goal: "OFFSITE_CONVERSIONS",
  },
];

const metaAdsConfig: DemoMetaAdConfig[] = [
  {
    id: "mt-ad-601",
    name: "Proof driven creative",
    status: "ACTIVE",
    effective_status: "ACTIVE",
    adset_id: "mt-adset-501",
    creative: {
      thumbnail_url: DEMO_PLACEHOLDER_IMAGE,
      title: "Optimize without spreadsheets",
      body: "A compact demo ad used by the portfolio mode.",
    },
  },
  {
    id: "mt-ad-602",
    name: "Offer comparison creative",
    status: "PAUSED",
    effective_status: "PAUSED",
    adset_id: "mt-adset-502",
    creative: {
      thumbnail_url: DEMO_PLACEHOLDER_IMAGE,
      title: "Know what is leaking",
      body: "A local-only Meta creative fixture.",
    },
  },
];

const metaAdsetMetrics = [
  {
    id_ad_set: "mt-adset-501",
    summary: { ...baseSummary, revenue: 7260.25, expenses: 1720.4, clicks: 1376, checkout: 172, sales: 46, roas: 4.22 },
  },
  {
    id_ad_set: "mt-adset-502",
    summary: { ...baseSummary, revenue: 4020.25, expenses: 1230.5, clicks: 1035, checkout: 120, sales: 28, roas: 3.27 },
  },
];

const metaAdMetrics = [
  {
    id_ad: "mt-ad-601",
    summary: { ...baseSummary, revenue: 6420.25, expenses: 1500.4, clicks: 1186, checkout: 148, sales: 39, roas: 4.28 },
  },
  {
    id_ad: "mt-ad-602",
    summary: { ...baseSummary, revenue: 4860.25, expenses: 1450.5, clicks: 1225, checkout: 144, sales: 35, roas: 3.35 },
  },
];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getCampaignOptimization(campaignId: number | string): CampaignOptimizationModel {
  const numericId = Number(campaignId);
  const campaign = demoCampaignOptimizations[numericId] ?? demoCampaignOptimizations[101];
  return {
    ...clone(campaign),
    id: Number.isFinite(numericId) && numericId > 0 ? numericId : campaign.id,
  };
}

export function getDemoSessionPayload(): SessionPayload {
  return {
    accessToken: "demo-access-token",
    userData: JSON.stringify(demoUser),
    taboolaData: JSON.stringify(demoTaboolaAccount),
    metaData: JSON.stringify(demoMetaAccount),
    contract: demoContract,
    demoMode: FRONTEND_DEMO_MODE,
  };
}

export function getDemoCampaignSummaries(): CampaignSummaryModel[] {
  return clone(demoCampaigns);
}

export function getDemoCampaignOptimization(campaignId: number | string) {
  return getCampaignOptimization(campaignId);
}

export function getDemoCreatedCampaign(formData: FormData) {
  return {
    id: 9901,
    name: (formData.get("campaignName") as string) || "Nova campanha demo",
    ad_provider: (formData.get("ad_provider") as string) || "taboola",
    checkout_provider: (formData.get("checkout_provider") as string) || "demo",
    conversion_name: (formData.get("conversion_name") as string) || "purchase",
    id_user: demoUser.id,
    link: (formData.get("campaignLink") as string) || "https://demo.oracclum.local/new",
    sub_account: (formData.get("sub_account") as string) || undefined,
    click_auth: "demo-click-new",
    external_id: (formData.get("external_id") as string) || "demo-new-campaign",
  };
}

export function getDemoSubaccounts(): { results: TaboolaSubaccountModel[] } {
  return {
    results: [
      {
        id: "demo-subaccount",
        account_id: "demo-taboola-account",
        name: "Demo Subaccount",
      },
    ],
  };
}

export function getDemoExternalCampaigns(): ExternalCampaignModel[] {
  return [
    { id: "tb-demo-101", name: "Taboola - Fitness Lead Magnet" },
    { id: "tb-demo-404", name: "Taboola - Upsell Exploration" },
  ];
}

export function getDemoTaboolaCampaignData(): TaboolaCampaignApiData {
  return clone(taboolaCampaignData);
}

export function getDemoTaboolaAds() {
  return clone(taboolaAds);
}

export function getDemoTaboolaAdStatuses() {
  return {
    results: taboolaAds.map((ad) => ({
      id: ad.id_ads_taboola,
      is_active: ad.status,
    })),
  };
}

export function getDemoCampaignSites() {
  return clone(campaignSites);
}

export function getDemoCampaignSteps(campaignId: number | string): CampaignStepsSummary {
  return {
    ...clone(campaignSteps),
    id: Number(campaignId) || campaignSteps.id,
  };
}

export function getDemoSiteSteps() {
  return clone(siteSteps);
}

export function getDemoOneSummary(id?: string | number) {
  const offset = String(id ?? "").length % 4;
  return {
    ...clone(baseSummary),
    revenue: baseSummary.revenue - offset * 750,
    expenses: baseSummary.expenses - offset * 210,
    clicks: baseSummary.clicks - offset * 140,
    checkout: baseSummary.checkout - offset * 20,
    sales: baseSummary.sales - offset * 7,
  };
}

export function getDemoMetaCampaignData() {
  return clone(metaCampaignData);
}

export function getDemoMetaAdsetsConfig() {
  return clone(metaAdsetsConfig);
}

export function getDemoMetaAdsetsSummary() {
  return clone(metaAdsetMetrics);
}

export function getDemoMetaAdsConfig() {
  return clone(metaAdsConfig);
}

export function getDemoMetaAdsSummary() {
  return clone(metaAdMetrics);
}

export function getDemoMetaAdSummary(adId?: string | number) {
  const metric = metaAdMetrics.find((item) => String(item.id_ad) === String(adId));
  return clone(metric?.summary ?? baseSummary);
}

export function getDemoClickSteps(idClick: string, campaignId?: string | number): ClickStepsModel {
  return {
    id_click: idClick,
    id_campaign: Number(campaignId) || 101,
    step_1: 1,
    step_2: 1,
    step_3: 1,
    checkout: 1,
  };
}

export function getDemoMetaClickSteps(idClick: string): MetaClickStepsModel {
  return {
    id: 1,
    id_click: idClick,
    id_campaign: 202,
    id_campaign_meta: "mt-demo-202",
    id_ad_set: "mt-adset-501",
    id_ad_meta: "mt-ad-601",
    step_1: 2,
    step_2: 2,
    step_3: 1,
    checkout: 1,
    revenue: 197.9,
    payment_type: "credit_card",
    id_order: "demo-order-1",
  };
}

export function getDemoMetaAdAccounts() {
  return demoMetaAccount.allowed_accounts.map((account) => ({
    id: `act_${account.account_id}`,
    account_id: account.account_id,
    name: account.name,
  }));
}

export function getDemoMetaCampaigns() {
  return [{ id: "mt-demo-202", name: "Meta - SaaS Retargeting" }];
}

export function getDemoEnrichedUserData() {
  return {
    total_clicks: demoCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0),
    total_revenue: demoCampaigns.reduce((sum, campaign) => sum + campaign.revenue, 0),
    total_sales: demoCampaigns.reduce((sum, campaign) => sum + campaign.sales, 0),
  };
}

export function getDemoMetaIntegrationStatus() {
  return {
    ad_provider: 1 as const,
    funnel: 1 as const,
    checkout: 1 as const,
    test: 1 as const,
  };
}
