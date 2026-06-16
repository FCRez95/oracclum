import { BACKEND_DEMO_ACCESS_TOKEN } from './demo-mode'

const demoUser = {
  id: 9001,
  name: 'Oracclum Demo',
  email: 'demo@oracclum.local',
  access_token: BACKEND_DEMO_ACCESS_TOKEN,
  user_type: 'pro',
  allow_clicks: 1,
  cpfcnpj: '000.000.000-00',
  phone: '+55 11 90000-0000'
}

const demoTaboolaInfo = {
  access_token: 'demo-taboola-token',
  account_id: 'demo-taboola-account',
  client_id: 'demo-taboola-client',
  client_secret: 'demo-taboola-secret'
}

const demoMetaInfo = {
  access_token: 'demo-meta-token',
  meta_access_token: 'demo-meta-token',
  allowed_accounts: [
    { account_id: '1234567890', name: 'Oracclum Demo Ads' },
    { account_id: '9876543210', name: 'Scale Lab Demo' }
  ]
}

const demoConsent = {
  id_user: demoUser.id,
  contract_signed: 1,
  signed_at: '2026-01-01T12:00:00.000Z',
  ip_address: '127.0.0.1',
  subpaid: 1
}

const baseSummary = {
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
  visible_impressions: 116482
}

const campaigns = [
  {
    id: 101,
    external_id: 'tb-demo-101',
    id_user: demoUser.id,
    name: 'Taboola - Fitness Lead Magnet',
    link: 'https://demo.oracclum.local/fitness',
    sub_account: 'demo-subaccount',
    ad_provider: 'taboola',
    checkout_provider: 'perfectpay',
    conversion: 'purchase',
    expenses: 4180.4,
    revenue: 18420.75,
    clicks: 3378,
    checkout: 438,
    sales: 115,
    roas: 4.41
  },
  {
    id: 202,
    external_id: 'mt-demo-202',
    id_user: demoUser.id,
    name: 'Meta - SaaS Retargeting',
    link: 'https://demo.oracclum.local/retargeting',
    ad_provider: 'meta',
    checkout_provider: 'hotmart',
    conversion: 'lead',
    expenses: 2950.9,
    revenue: 11280.5,
    clicks: 2411,
    checkout: 292,
    sales: 74,
    roas: 3.82
  }
]

const campaignOptimizations = {
  101: {
    ...campaigns[0],
    conversion_name: 'purchase',
    click_auth: 'demo-click-101',
    summary: baseSummary
  },
  202: {
    ...campaigns[1],
    conversion_name: 'lead',
    click_auth: 'demo-click-202',
    summary: {
      ...baseSummary,
      revenue: 11280.5,
      expenses: 2950.9,
      clicks: 2411,
      checkout: 292,
      sales: 74,
      roas: 3.82
    }
  }
}

const ads = [
  {
    id_ads_taboola: 'tb-ad-301',
    title: 'Quiz: Descubra seu plano ideal',
    thumbnail: '/placeholder.webp',
    campaign_name: campaigns[0].name,
    status: true,
    summary: { ...baseSummary, revenue: 8240, expenses: 1880, clicks: 1460, checkout: 190, sales: 51, roas: 4.38 }
  },
  {
    id_ads_taboola: 'tb-ad-302',
    title: 'Antes e depois do protocolo',
    thumbnail: '/placeholder.webp',
    campaign_name: campaigns[0].name,
    status: false,
    summary: { ...baseSummary, revenue: 4960, expenses: 1260, clicks: 1024, checkout: 121, sales: 31, roas: 3.94 }
  }
]

const sites = [
  {
    id_campaign: '101',
    id_site: 'site-401',
    site: 'publisher-a.example',
    target: 'publisher-a.example',
    summary: { ...baseSummary, revenue: 7020, expenses: 1500, clicks: 1212, checkout: 168, sales: 44, roas: 4.68 }
  },
  {
    id_campaign: '101',
    id_site: 'site-402',
    site: 'publisher-b.example',
    target: 'publisher-b.example',
    summary: { ...baseSummary, revenue: 3920, expenses: 1120, clicks: 860, checkout: 92, sales: 23, roas: 3.5 }
  }
]

const campaignSteps = {
  id: 101,
  name: 'Demo Funnel',
  link: 'https://demo.oracclum.local/fitness',
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
  checkout_views: 438
}

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
  step_4_views: 168
}

const metaAdsets = [
  {
    id: 'mt-adset-501',
    name: 'Demo Retargeting 7D',
    status: 'ACTIVE',
    effective_status: 'ACTIVE',
    daily_budget: '15000',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    optimization_goal: 'OFFSITE_CONVERSIONS',
    summary: { ...baseSummary, revenue: 6420.25, expenses: 1500.4, clicks: 1186, checkout: 148, sales: 39, roas: 4.28 }
  },
  {
    id: 'mt-adset-502',
    name: 'Demo Lookalike 2%',
    status: 'PAUSED',
    effective_status: 'PAUSED',
    daily_budget: '12000',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    optimization_goal: 'LEAD_GENERATION',
    summary: { ...baseSummary, revenue: 4860.25, expenses: 1450.5, clicks: 1225, checkout: 144, sales: 35, roas: 3.35 }
  }
]

const metaAds = [
  {
    id: 'mt-ad-601',
    name: 'Demo Testimonial Creative',
    status: 'ACTIVE',
    effective_status: 'ACTIVE',
    adset_id: 'mt-adset-501',
    thumbnail: '/placeholder.webp',
    title: 'Oracclum Demo Creative',
    body: 'A compact demo ad used by the portfolio mode.',
    summary: metaAdsets[0].summary
  },
  {
    id: 'mt-ad-602',
    name: 'Demo Offer Creative',
    status: 'ACTIVE',
    effective_status: 'ACTIVE',
    adset_id: 'mt-adset-502',
    thumbnail: '/placeholder.webp',
    title: 'Scale your campaigns',
    body: 'Synthetic Meta ad data served by the backend demo.',
    summary: metaAdsets[1].summary
  }
]

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const backendDemoData = {
  accessToken: BACKEND_DEMO_ACCESS_TOKEN,
  user: () => clone(demoUser),
  taboolaInfo: () => clone(demoTaboolaInfo),
  metaInfo: () => clone(demoMetaInfo),
  consent: () => clone(demoConsent),
  campaigns: () => clone(campaigns),
  enrichedUser: () => ({
    total_clicks: campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0),
    total_revenue: campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0),
    total_sales: campaigns.reduce((sum, campaign) => sum + campaign.sales, 0)
  }),
  campaignOptimization: (id: string | number) => {
    const numericId = Number(id)
    return clone(campaignOptimizations[numericId] ?? campaignOptimizations[101])
  },
  campaignSteps: (id: string | number) => ({
    ...clone(campaignSteps),
    id: Number(id) || campaignSteps.id
  }),
  sites: () => clone(sites),
  siteSummary: (siteId?: string | number) => {
    const offset = String(siteId ?? '').length % 4
    return {
      ...clone(baseSummary),
      revenue: baseSummary.revenue - offset * 750,
      expenses: baseSummary.expenses - offset * 210,
      clicks: baseSummary.clicks - offset * 140,
      checkout: baseSummary.checkout - offset * 20,
      sales: baseSummary.sales - offset * 7
    }
  },
  siteSteps: () => clone(siteSteps),
  ads: () => clone(ads),
  adSummary: (adId?: string | number) => backendDemoData.siteSummary(adId),
  metaAdsets: () => clone(metaAdsets),
  metaAds: () => clone(metaAds),
  metaAdSummary: (adId?: string | number) => {
    const ad = metaAds.find(item => String(item.id) === String(adId))
    return clone(ad?.summary ?? baseSummary)
  },
  click: (idClick: string, campaignId?: string | number) => ({
    id_click: idClick,
    id_campaign: Number(campaignId) || 101,
    step_1: 1,
    step_2: 1,
    step_3: 1,
    checkout: 1
  }),
  metaClick: (idClick: string) => ({
    id: 1,
    id_click: idClick,
    id_campaign: 202,
    id_campaign_meta: 'mt-demo-202',
    id_ad_set: 'mt-adset-501',
    id_ad_meta: 'mt-ad-601',
    step_1: 2,
    step_2: 2,
    step_3: 1,
    checkout: 1,
    revenue: 197.9,
    payment_type: 'credit_card',
    id_order: 'demo-order-1'
  }),
  integrationStatus: () => ({
    ad_provider: 1,
    funnel: 1,
    checkout: 1,
    test: 1
  }),
  createdCampaign: (body: any = {}) => ({
    id: 9901,
    name: body.name ?? 'Nova campanha demo',
    ad_provider: body.ad_provider ?? 'taboola',
    checkout_provider: body.checkout_provider ?? 'demo',
    conversion_name: body.conversion_name ?? 'purchase',
    id_user: demoUser.id,
    link: body.link ?? 'https://demo.oracclum.local/new',
    sub_account: body.sub_account,
    click_auth: 'demo-click-new',
    external_id: body.external_id ?? 'demo-new-campaign'
  }),
  ok: (message = 'Demo operation completed.') => ({ success: true, message })
}
