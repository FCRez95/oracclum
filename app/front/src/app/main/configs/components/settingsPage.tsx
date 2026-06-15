"use client";

import { useEffect, useState } from "react";
import SettingsMenu from "./settingsMenu";
import SettingsContent from "./settingsContent";
import { getAccountSession } from "../accountActions";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "account" | "preferences" | "contracts"
  >("account");
  const [contractSigned, setContractSigned] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await getAccountSession();

      if (result.success) {
        const signed = result.session?.contract.contract_signed;
        setContractSigned(signed || false);

        if (!signed) {
          setActiveTab("contracts");
        }
      }
    })();
  }, []);

  return (
    <div className="w-[90%] flex flex-col text-content tablet:text-medium min-h-0 h-dvh tablet:flex-row gap-medium p-small tablet:p-medium mx-auto my-small bg-bg-card rounded-small">
      <SettingsMenu activeTab={activeTab} onChange={setActiveTab} contractSigned={contractSigned} />
      <div className="hidden tablet:flex w-0.5 bg-bg-primary mx-medium" />
      <SettingsContent activeTab={activeTab} onContractAccepted={() => {
        setContractSigned(true);
      }}
        contractSigned={contractSigned} />
    </div>
  );
}
