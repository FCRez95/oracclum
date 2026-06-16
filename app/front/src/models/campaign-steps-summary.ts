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

const numericCampaignStepsFields = [
    "id",
    "total_clicks",
    "total_sales",
    "revenue",
    "total_step_1",
    "step_1_views",
    "total_step_2",
    "step_2_views",
    "total_step_3",
    "step_3_views",
    "total_checkout",
    "checkout_views",
] as const;

type CampaignStepsSummarySource = Partial<
    Record<keyof CampaignStepsSummary, unknown>
>;

function numberOrZero(value: unknown) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
        const normalized = value.trim().replace(",", ".");
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

export function normalizeCampaignStepsSummary(
    value: CampaignStepsSummarySource
): CampaignStepsSummary {
    const normalized = {
        name: String(value.name ?? ""),
        link: String(value.link ?? ""),
    } as CampaignStepsSummary;

    for (const field of numericCampaignStepsFields) {
        normalized[field] = numberOrZero(value[field]);
    }

    return normalized;
}
