"use client";

import { useRef } from "react";
import SettingsTabButton from "./settingsTabButton";

interface SettingsMenuProps {
  activeTab: "account" | "preferences" | "contracts";
  onChange: (tab: SettingsMenuProps["activeTab"]) => void;
  contractSigned: boolean;
}

const tabLabels: Record<SettingsMenuProps["activeTab"], string> = {
  account: "Informações da Conta",
  //dataVisibility: "Visibilidade dos Dados",
  preferences: "Preferências",
  //payments: "Pagamentos",
  contracts: "Contratos",
};

export default function SettingsMenu({ activeTab, onChange, contractSigned }: SettingsMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  function scrollToCenter(btn: HTMLButtonElement) {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const buttonCenter = btn.offsetLeft + btn.offsetWidth / 2;
    const extraOffset = containerWidth * 0.125; // 12.5%

    const scrollTo = buttonCenter - containerWidth / 2 - extraOffset;

    container.scrollTo({ left: scrollTo, behavior: "smooth" });
  }

  const tabs = Object.entries(tabLabels);

  return (
    <aside
      ref={containerRef}
      className="
        flex gap-small px-small
        overflow-x-auto whitespace-nowrap scroll-smooth
        scrollbar-hide
        tablet:flex-col tablet:overflow-visible tablet:whitespace-normal tablet:w-[15%] tablet:px-0 tablet:mt-small
      "
    >
      {tabs.map(([key, label]) => {
        const isLocked = !contractSigned && key !== "contracts";

        return (
          <SettingsTabButton
            key={key}
            label={label}
            isActive={activeTab === key}
            disabled={isLocked}
            onClick={(btn) => {
              if (isLocked) return;

              onChange(key as SettingsMenuProps["activeTab"]);
              scrollToCenter(btn);
            }}
          />
        );
      })}
    </aside>
  );
}
