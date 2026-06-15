"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import IntegrationMenu from "./integrationMenu";
import IntegrationContent from "./integrationContent";

export default function IntegrationPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "meta" ? "meta" : "taboola";
  const [activeTab, setActiveTab] = useState<
    "taboola" | "meta"
  >(initialTab);

  return (
    <div className="w-[90%] flex flex-col text-content tablet:text-medium min-h-0 h-dvh tablet:flex-row gap-medium p-small tablet:p-medium mx-auto my-medium bg-bg-card rounded-small">
      <IntegrationMenu activeTab={activeTab} onChange={setActiveTab} />
      <div className="hidden tablet:flex w-0.5 bg-bg-primary mx-medium" />
      <IntegrationContent activeTab={activeTab} />
    </div>
  );
}
