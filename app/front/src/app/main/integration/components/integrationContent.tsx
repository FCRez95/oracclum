import TaboolaIntegration from "./taboolaIntegration";
import MetaIntegration from "./metaIntegration";

interface SettingsContentProps {
  activeTab: "taboola" | "meta";
}

export default function SettingsContent({ activeTab }: SettingsContentProps) {
  return (
    <section className="flex-1 px-small tablet:mt-small flex justify-center tablet:justify-start items-start">
      {activeTab === "taboola" && <TaboolaIntegration />}
      {activeTab === "meta" && <MetaIntegration />}
    </section>
  );
}
