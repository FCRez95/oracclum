"use client";

import React, { useEffect, useState } from "react";
import FunnelSummaryLine from "@/components/FunnelSummary";
import { Card } from "@/components/Card";
import { CampaignStepsSummary } from "@/models/campaign-steps-summary";
import Loading from "@/components/Loading";
import { useCampaignContext } from "@/context/CampaignContext";
import { loadCampaignStepsAction } from "../../../components/campaignActions";

type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = React.use(params);
  const numericId = Number(id);
  const { selectedSideDate, campaign } = useCampaignContext();

  const [campSummary, setCampSummary] = useState<CampaignStepsSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const stepsRes = await loadCampaignStepsAction(
          numericId,
          selectedSideDate as number
        );

        if (stepsRes.success && stepsRes.data) setCampSummary(stepsRes.data);
      } catch (error) {
        console.error("Error fetching campaign summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [numericId, selectedSideDate]);

  return (
    <div className="flex justify-center w-full">
      { loading ? 
        <div className="mt-giga-large">
          <Loading fullscreen={false} text="Os funis estão sendo carregados!" />
        </div>
      :
        campSummary &&
        <Card borderType="default" paddingType="default"> 
            <FunnelSummaryLine
              stepsSummary={campSummary}
              expenses={campaign?.summary?.expenses ?? 0}
              clicks_taboola={campaign?.summary?.clicks ?? 0}
            />
        </Card>
      }
    </div>
  );
}
