import SettingsTabButton from "./integrationTabButton";

interface SettingsMenuProps {
  activeTab: "taboola" | "meta";
  onChange: (tab: "taboola" | "meta") => void;
}

const tabLabels: Record<SettingsMenuProps["activeTab"], string> = {
  taboola: "Taboola",
  meta: "Meta",
};

export default function SettingsMenu({
  activeTab,
  onChange,
}: SettingsMenuProps) {
  const tabs = Object.entries(tabLabels);

  return (
    <aside className="grid grid-cols-2 tablet:flex tablet:flex-col tablet:w-[15%] mx-auto mt-small gap-small">
      {tabs.map(([key, label]) => (
        <SettingsTabButton
          key={key}
          label={label}
          isActive={activeTab === key}
          onClick={() => onChange(key as SettingsMenuProps["activeTab"])}
        />
      ))}
    </aside>
  );
}