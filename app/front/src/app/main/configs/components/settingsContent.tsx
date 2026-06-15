import AccountSettings from "./accountSettings";
import Contracts from "./contracts";
import DataVisibility from "./dataVisibility";
import Payments from "./payments";
import Preferences from "./preferences";

interface SettingsContentProps {
  activeTab: "account" | "dataVisibility" | "preferences" | "payments" | "contracts";
  onContractAccepted: () => void;
  contractSigned: boolean;
}

export default function SettingsContent({ activeTab, onContractAccepted, contractSigned }: SettingsContentProps) {
  return (
    <div className="flex-1 overflow-auto justify-center tablet:justify-start items-center tablet:items-start tablet:mt-small">
      {activeTab === "account" && <AccountSettings />}
      {activeTab === "dataVisibility" && <DataVisibility />}
      {activeTab === "preferences" && <Preferences />}
      {activeTab === "payments" && <Payments />}
      {activeTab === "contracts" && <Contracts  onContractAccepted={onContractAccepted} contractSigned={contractSigned}/>}
    </div>
  );
}
