export interface AddFunnelModel {
    name: unknown
    link: unknown
}

export interface CampaignStepsSummary {
    id: number,
    name: string,
    link: string,
    total_clicks: number,
    total_sales: number,
    revenue: number,
    total_step_1: number
    step_1_views: number
    total_step_2: number
    step_2_views: number
    total_step_3: number
    step_3_views: number
    total_checkout: number
    checkout_views: number
}