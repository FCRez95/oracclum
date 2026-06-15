"use client";

import { CampaignStepsSummary } from "@/models/campaign-steps-summary";
import InteractivePieChart from "../ui/piechart";
import { ChevronRight } from "lucide-react";

interface Props {
  stepsSummary: CampaignStepsSummary;
  expenses: number;
  clicks_taboola: number;
}

const MetaFunnelSummaryLine = ({
  stepsSummary,
  expenses,
  clicks_taboola,
}: Props) => {
  // Funil de cada etapa com totais e percentuais baseados no passo anterior
  const step1Total = clicks_taboola ?? 0;
  const step1 = [
    { label: "Chegaram ao ViewContent", value: stepsSummary.step_1_views },
    { label: "Abandonos", value: Math.max(step1Total - (stepsSummary.total_step_1 ?? 0), 0) },
    { label: "Apenas PageView", value: Math.max(stepsSummary.total_step_1 - (stepsSummary.step_1_views ?? 0), 0) },
  ];

  const step2Total = stepsSummary.total_step_2 ?? 0;
  const step2 = [
    { label: "Chegaram ao ViewContent", value: stepsSummary.step_2_views },
    { label: "Abandonos", value: Math.max(stepsSummary.step_1_views - (stepsSummary.total_step_2 ?? 0), 0) },
    { label: "Apenas PageView", value: Math.max(stepsSummary.total_step_2 - (stepsSummary.step_2_views ?? 0), 0) },
  ];

  const step3Total = stepsSummary.total_step_3 ?? 0;
  const step3 = [
    { label: "Chegaram ao ViewContent", value: stepsSummary.step_3_views },
    { label: "Abandonos", value: Math.max(stepsSummary.step_2_views - (stepsSummary.total_step_3 ?? 0), 0) },
    { label: "Apenas PageView", value: Math.max(stepsSummary.total_step_3 - (stepsSummary.step_3_views ?? 0), 0) },
  ];

  const checkoutTotal = stepsSummary.total_checkout ?? 0;
  const checkout = [
    { label: "Checkout", value: stepsSummary.checkout_views },
    { label: "Abandonos", value: Math.max(checkoutTotal - (stepsSummary.checkout_views ?? 0), 0) },
  ];

  const conversionsTotal = stepsSummary.total_sales ?? 0;
  const sales = [
    { label: "Conversões", value: conversionsTotal },
    { label: "Abandonos", value: Math.max((stepsSummary.checkout_views ?? 0) - conversionsTotal, 0) },
  ];

  const steps = [
    { title: "Passo 1", data: step1, total: step1Total },
    ...(step2Total > 0 ? [{ title: "Passo 2", data: step2, total: step2Total }] : []),
    ...(step3Total > 0 ? [{ title: "Passo 3", data: step3, total: step3Total }] : []),
    { title: "Checkout", data: checkout, total: checkoutTotal },
    { title: "Conversões", data: sales, total: conversionsTotal },
  ];

  return (
    <div className="flex flex-col gap-extra-small w-[320px] md:w-[900px]">
      <header className="flex justify-between items-start gap-small md:gap-small">
        <div className="flex flex-col gap-1">
          <h2 className="text-content md:text-base font-semibold leading-tight">
            {stepsSummary.name}
          </h2>
          <p className="text-text-muted text-xs md:text-sm justify-start leading-tight">
            {stepsSummary.link}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-[11px] md:text-xs leading-tight">
          <div className="flex gap-2 justify-end md:gap-3">
            <span className="text-text-alt-primary">Gastos:</span>
            <strong>${expenses?.toFixed(2).replace(".", ",")}</strong>
          </div>
          <div className="flex gap-2 justify-end md:gap-3">
            <span className="text-text-alt-primary">Fatur.:</span>
            <strong>${stepsSummary.revenue?.toFixed(2).replace(".", ",")}</strong>
          </div>
          <div className="flex gap-2 justify-end md:gap-3">
            <span className="text-text-alt-primary">ROAS:</span>
            <strong>
              {expenses > 0
                ? (((stepsSummary.revenue ?? 0) / expenses) * 100)
                    .toFixed(2)
                    .replace(".", ",")
                : "0,00"}
              %
            </strong>
          </div>
        </div>
      </header>

      <div className="border-1 border-border-highlight opacity-50 mt-1"></div>

      <div className="flex flex-col gap-small pb-small mt-1">
        <div className="inline-grid grid-cols-2 justify-center gap-medium relative md:min-h-[90px]">
          {steps.map((step, index) => {
            const spacing = 80; // Espaçamento em % da largura total
            const offset = (100 - spacing) / 2;
            const currentPosition = offset + (index * spacing) / (steps.length - 1);

            return (
              <div
                key={step.title}
                className="flex justify-center items-center md:absolute md:transform md:-translate-x-1/2 md:top-0"
                style={{
                  left: `calc(${currentPosition}%)`,
                }}
              >
                <InteractivePieChart
                  data={step.data}
                  type="default"
                  title={step.title}
                  size="small"
                  isFunnel={true}
                  operation={typeof step.total === "number" ? step.total : null}
                />
              </div>
            );
          })}
        </div>

        {/* Linha e porcentagens */}
        <div className="hidden md:block relative mt-small h-small">
          <div
            className="absolute h-0.5 bg-bg-overlay top-1/2 transform -translate-y-1/2"
            style={{
              left: `calc(${(100 - 80) / 2}%)`,
              right: `calc(${(100 - 80) / 2}%)`,
            }}
          />
          {steps.map((step, index) => {
            const currentValue = step.total ?? 0;
            const nextStep = steps[index + 1];
            const nextValue = nextStep?.total ?? 0;
            const percentage =
              currentValue > 0
                ? ((nextValue / currentValue) * 100).toFixed(2)
                : "0";
            const isLast = index === steps.length - 1;
            const spacing = 80;
            const offset = (100 - spacing) / 2;
            const currentPosition = offset + (index * spacing) / (steps.length - 1);
            const nextPosition =
              index < steps.length - 1
                ? offset + ((index + 1) * spacing) / (steps.length - 1)
                : undefined;
            const middlePosition =
              nextPosition !== undefined
                ? `calc(${(currentPosition + nextPosition) / 2}%)`
                : null;

            return (
              <div key={index}>
                {!isLast && middlePosition && (
                  <div
                    className="absolute text-small transform -translate-x-1/2 z-20"
                    style={{
                      left: middlePosition,
                      top: "calc(50% - 1.5rem)",
                    }}
                  >
                    {percentage}%
                  </div>
                )}
                <div
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 z-20 ${
                    isLast ? "w-default h-default bg-bg-primary rounded-full" : ""
                  }`}
                  style={{
                    left: `calc(${currentPosition}%)`,
                  }}
                >
                  {!isLast && (
                    <ChevronRight className="w-medium h-medium text-text-primary" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetaFunnelSummaryLine;
