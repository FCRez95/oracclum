"use client";

import Toggle from "@/components/Toggle/Toggle";
import { useState } from "react";

export default function DataVisibility() {
  const [visibility, setVisibility] = useState({
    Campanhas: {
      Nome_Da_Campanha: true,
      Faturamento: false,
      Gasto: false,
      Roas: false,
      Clicks: false,
      Checkouts: false,
      Conversões: false,
    },
    Resumo_Geral: {
      Gasto: false,
      Faturamento: false,
      Clicks: false,
      Checkouts: false,
      Roas: false,
      Conversões: false,
    },
    Taboola: {
      Limite_Diario: false,
      Cpc: false,
      Status: false,
    },
    Funis: {
      Gasto: false,
      Faturamento: false,
      Roas: false,
      Passo1: false,
      Passo2: false,
      Passo3: false,
      Passo4: false,
      Passo5: false,
      Checkout: false,
      Conversões: false,
    },
    Ads: {
      Nome_Do_Ad: false,
      Faturamento: false,
      Gasto: false,
      Roas: false,
      Clicks: false,
      Checkouts: false,
      Conversões: false,
      Cpc_Atual: false,
      Vcpm: false,
      Cta: false,
      Vctr: false,
    },
    Sites: {
      Nome_Do_Site: false,
      Faturamento: false,
      Gasto: false,
      Roas: false,
      Clicks: false,
      Checkouts: false,
      Conversões: false,
      Cpc_Atual: false,
      Vcpm: false,
      Cta: false,
      Vctr: false,
    },
  });

  const handleToggle = (section: keyof typeof visibility, key: string) => {
    setVisibility(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
      },
    }));
  };


  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 tablet:grid-cols-3 gap-x-large">
        {Object.entries(visibility).map(([section, fields]) => (
          <div key={section} className="text-center mb-small border-b pb-small last:border-b-0 
          md:[&:nth-last-child(-n+2)]:border-b-0 tablet:[&:nth-last-child(-n+3)]:border-b-0">
            <h2 className="font-strong pb-extra-small">{section.split("_").join(" ")}</h2>

            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-start mb-extra-small tablet:mb-0">
                <span>{key.split("_").join(" ")}</span>
                <Toggle
                  size="small"
                  isOn={value}
                  onToggle={() => handleToggle(section as keyof typeof visibility, key)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
