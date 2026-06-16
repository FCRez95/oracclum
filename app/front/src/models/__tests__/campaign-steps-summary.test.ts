import { normalizeCampaignStepsSummary } from "../campaign-steps-summary";

describe("normalizeCampaignStepsSummary", () => {
  it("coerces numeric API fields before funnel rendering", () => {
    const summary = normalizeCampaignStepsSummary({
      id: "42",
      name: "Campaign funnel",
      link: "https://example.test",
      total_clicks: "100",
      total_sales: "7",
      revenue: "123.45",
      total_step_1: "80",
      step_1_views: "70",
      total_step_2: "60",
      step_2_views: "50",
      total_step_3: "40",
      step_3_views: "30",
      total_checkout: "20",
      checkout_views: "10",
    });

    expect(summary).toEqual({
      id: 42,
      name: "Campaign funnel",
      link: "https://example.test",
      total_clicks: 100,
      total_sales: 7,
      revenue: 123.45,
      total_step_1: 80,
      step_1_views: 70,
      total_step_2: 60,
      step_2_views: 50,
      total_step_3: 40,
      step_3_views: 30,
      total_checkout: 20,
      checkout_views: 10,
    });
    expect(summary.revenue.toFixed(2)).toBe("123.45");
  });
});
