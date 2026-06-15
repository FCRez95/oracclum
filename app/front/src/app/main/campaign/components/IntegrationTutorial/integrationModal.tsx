"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/Modal/modalComponent";
import { Icon } from "@/components/Icon/iconComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import { initialFunnelSteps, type FunnelStep } from "./steps/2funnelStepsData";
import IntegrationTestSection from "./steps/4integrationUrlTestSection";
import UtmStep from "./steps/1utmStep";
import SelectFunnelStep from "./steps/2funnelSteps";
import CheckoutStep from "./steps/3checkoutStep";
import {
  taboolaIntegrationSteps,
  type TaboolaIntegrationStep,
} from "./taboolaIntegrationSteps";

interface Props {
  onCloseAction: () => void;
  campaign: CampaignOptimizationModel;
}

const StepNavigation = ({
  steps,
  selectedKey,
  onSelect,
}: {
  steps: TaboolaIntegrationStep[];
  selectedKey: number;
  onSelect: (key: number) => void;
}) => {
  return (
    <>
      <div className="hidden md:flex md:w-[300px] md:flex-col md:gap-small">
        {steps.map((step) => {
          const isActive = step.key === selectedKey;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelect(step.key)}
              className={`group rounded-extra-large border p-small text-left transition-all ${
                isActive
                  ? "border-border-highlight bg-bg-primary/10 shadow-lg shadow-black/10"
                  : "border-border-muted bg-bg-card hover:border-border-highlight/60 hover:bg-bg-app"
              }`}
            >
              <div className="flex items-center justify-between gap-small">
                <div className="flex items-center gap-small min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                      isActive
                        ? "border-border-highlight bg-bg-primary text-text-on-primary"
                        : "border-border-highlight/60 bg-bg-app text-text-main"
                    }`}
                  >
                    {step.key}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Passo {step.key}
                    </p>
                    <p className="font-title text-content text-text-main">
                      {step.label}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isActive ? "bg-bg-primary/10" : "bg-bg-app"
                  }`}
                >
                  {isActive ? (
                    <Icon type="integration" size="small" color="primary" />
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-extra-small overflow-x-auto pb-extra-small md:hidden">
        {steps.map((step) => {
          const isActive = step.key === selectedKey;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onSelect(step.key)}
              className={`flex min-w-[170px] flex-col rounded-large border px-small py-small text-left transition-all ${
                isActive
                  ? "border-border-highlight bg-bg-primary/10"
                  : "border-border-muted bg-bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-small">
                <div className="min-w-0">
                  <span className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                    Passo {step.key}
                  </span>
                  <span className="mt-1 block font-title text-content text-text-main">
                    {step.shortLabel}
                  </span>
                </div>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isActive ? "bg-bg-primary/10" : "bg-bg-app"
                  }`}
                >
                  {isActive ? (
                    <Icon type="integration" size="small" color="primary" />
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

export const IntegrationModal = ({ onCloseAction, campaign }: Props) => {
  const [funnelSteps, setFunnelSteps] =
    useState<FunnelStep[]>(initialFunnelSteps);
  const [selectedStepKey, setSelectedStepKey] = useState(
    taboolaIntegrationSteps[0].key
  );

  const funnelStepHandler = (key: number) => {
    setFunnelSteps((prev) =>
      prev.map((s) => ({ ...s, selected: s.key === key }))
    );
  };
  const selectedStep = useMemo(
    () =>
      taboolaIntegrationSteps.find((step) => step.key === selectedStepKey) ??
      taboolaIntegrationSteps[0],
    [selectedStepKey]
  );

  return (
    <Modal onCloseAction={onCloseAction} isOpen={true} paddingType="small">
      <div className="relative w-full max-w-6xl max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[24px] border border-border-highlight/40 bg-bg-card p-medium text-text-main shadow-2xl shadow-black/20 md:p-large">
        <button
          type="button"
          onClick={onCloseAction}
          className="absolute right-small top-small flex rounded-full p-1 transition hover:bg-bg-app/50"
          aria-label="Fechar tutorial de integracao"
        >
          <Icon type="close" size="medium" color="cancel" />
        </button>

        <div className="flex flex-col gap-extra-small pr-large">
          <span className="w-fit rounded-full border border-border-highlight/50 bg-bg-primary/10 px-small py-extra-small text-xs uppercase tracking-[0.25em] text-text-secondary">
            Tutorial Taboola
          </span>
          <div>
            <h2 className="font-title text-title text-text-main">
              Passos de integracao da campanha
            </h2>
            <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
              Este fluxo mantem o conteudo atual da integracao Taboola, agora
              organizado na mesma estrutura visual usada pelo tutorial da Meta.
            </p>
          </div>
        </div>

        <div className="mt-small h-1.5 w-full overflow-hidden rounded-full bg-bg-app">
          <motion.div
            className="h-full rounded-full bg-bg-primary"
            animate={{
              width: `${
                (selectedStep.key / taboolaIntegrationSteps.length) * 100
              }%`,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>

        <div className="mt-default flex flex-col gap-default md:flex-row">
          <StepNavigation
            steps={taboolaIntegrationSteps}
            selectedKey={selectedStep.key}
            onSelect={setSelectedStepKey}
          />

          <div className="min-h-[440px] flex-1 rounded-extra-large bg-transparent">
            <div className="flex h-full flex-col gap-small">
              <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium shadow-lg shadow-black/5">
                <div className="flex flex-wrap items-start justify-between gap-small">
                  <div className="flex min-w-0 flex-col gap-extra-small">
                    <span className="w-fit rounded-full border border-border-highlight/50 bg-bg-primary/10 px-small py-extra-small text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Passo {selectedStep.key} de {taboolaIntegrationSteps.length}
                    </span>
                    <div>
                      <h3 className="font-title text-subtitle text-text-main">
                        {selectedStep.title}
                      </h3>
                      <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                        {selectedStep.description}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-bg-app px-small py-extra-small text-xs text-text-secondary">
                    {campaign.name}
                  </div>
                </div>
              </div>

              {selectedStep.key === 1 ? <UtmStep campaign={campaign} /> : null}
              {selectedStep.key === 2 ? (
                <SelectFunnelStep
                  funnelSteps={funnelSteps}
                  funnelStepHandler={funnelStepHandler}
                />
              ) : null}
              {selectedStep.key === 3 ? (
                <CheckoutStep checkout={campaign.checkout_provider} />
              ) : null}
              {selectedStep.key === 4 ? (
                <IntegrationTestSection campaign={campaign} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default IntegrationModal;
