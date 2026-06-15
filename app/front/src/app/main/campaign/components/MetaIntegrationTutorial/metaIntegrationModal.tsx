"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "@/components/Modal/modalComponent";
import { Icon } from "@/components/Icon/iconComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import {
  emptyMetaIntegrationStatus,
  metaIntegrationSteps,
  type MetaIntegrationStatus,
  type MetaIntegrationStep,
} from "./metaIntegrationSteps";
import { callLoadIntegrationStatus } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callLoadIntegrationStatus";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { Button } from "@/components/Button/buttonComponent";
import MetaAdProviderStep from "./metaAdProviderStep";
import MetaFunnelStep from "./metaFunnelStep";
import MetaCheckoutStep from "./metaCheckoutStep";
import MetaIntegrationTestStep from "./metaIntegrationTestStep";

interface Props {
  onCloseAction: () => void;
  campaign: CampaignOptimizationModel;
}

type StepVisualState = "completed" | "current" | "locked";

type StepState = {
  step: MetaIntegrationStep;
  state: StepVisualState;
  disabled: boolean;
};

function getFirstPendingStepKey(status: MetaIntegrationStatus) {
  const firstPending = metaIntegrationSteps.find(
    (step) => status[step.statusField] !== 1
  );

  return firstPending?.key ?? metaIntegrationSteps[metaIntegrationSteps.length - 1].key;
}

function buildStepStates(status: MetaIntegrationStatus): StepState[] {
  return metaIntegrationSteps.map((step, index) => {
    const isCompleted = status[step.statusField] === 1;
    const previousStep = metaIntegrationSteps[index - 1];
    const isUnlocked =
      index === 0 || status[previousStep.statusField] === 1;

    if (isCompleted) {
      return { step, state: "completed", disabled: false };
    }

    if (!isUnlocked) {
      return { step, state: "locked", disabled: true };
    }

    return { step, state: "current", disabled: false };
  });
}

const StepNavigation = ({
  steps,
  selectedKey,
  onSelect,
}: {
  steps: StepState[];
  selectedKey: number;
  onSelect: (key: number) => void;
}) => {
  const renderStateIcon = (state: StepVisualState) => {
    if (state === "completed") {
      return <Icon type="check" size="small" color="primary" />;
    }

    if (state === "locked") {
      return <Icon type="lock" size="small" color="secondary" />;
    }

    return null;
  };

  return (
    <>
      <div className="hidden md:flex md:w-[300px] md:flex-col md:gap-small">
        {steps.map(({ step, state, disabled }) => {
          const isActive = step.key === selectedKey;
          const isLocked = state === "locked";

          return (
            <button
              key={step.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(step.key)}
              className={`group rounded-extra-large border p-small text-left transition-all ${
                isActive
                  ? "border-border-highlight bg-bg-primary/10 shadow-lg shadow-black/10"
                  : "border-border-muted bg-bg-card"
              } ${
                isLocked
                  ? "cursor-not-allowed opacity-70"
                  : "hover:border-border-highlight/60 hover:bg-bg-app"
              }`}
            >
              <div className="flex items-center justify-between gap-small">
                <div className="flex items-center gap-small min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                      isActive
                        ? "border-border-highlight bg-bg-primary text-text-on-primary"
                        : isLocked
                          ? "border-border-muted bg-bg-app text-text-secondary"
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
                    state === "completed"
                      ? "bg-bg-primary/10"
                      : state === "locked"
                        ? "bg-bg-app"
                        : "bg-transparent"
                  }`}
                >
                  {renderStateIcon(state)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-extra-small overflow-x-auto pb-extra-small md:hidden">
        {steps.map(({ step, state, disabled }) => {
          const isActive = step.key === selectedKey;
          const isLocked = state === "locked";

          return (
            <button
              key={step.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(step.key)}
              className={`flex min-w-[160px] flex-col rounded-large border px-small py-small text-left transition-all ${
                isActive
                  ? "border-border-highlight bg-bg-primary/10"
                  : "border-border-muted bg-bg-card"
              } ${
                isLocked
                  ? "cursor-not-allowed opacity-70"
                  : ""
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
                    state === "completed"
                      ? "bg-bg-primary/10"
                      : state === "locked"
                        ? "bg-bg-app"
                        : "bg-transparent"
                  }`}
                >
                  {renderStateIcon(state)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
};

const StepPlaceholder = ({
  step,
  campaignName,
}: {
  step: MetaIntegrationStep;
  campaignName?: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.key}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex h-full flex-col gap-small"
      >
        <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium shadow-lg shadow-black/5">
          <div className="flex flex-wrap items-start justify-between gap-small">
            <div className="flex min-w-0 flex-col gap-extra-small">
              <span className="w-fit rounded-full border border-border-highlight/50 bg-bg-primary/10 px-small py-extra-small text-xs uppercase tracking-[0.2em] text-text-secondary">
                Passo {step.key} de {metaIntegrationSteps.length}
              </span>
              <div>
                <h3 className="font-title text-subtitle text-text-main">
                  {step.title}
                </h3>
                <p className="mt-extra-small max-w-2xl text-content text-text-secondary">
                  {step.description}
                </p>
              </div>
            </div>

            <div className="rounded-full bg-bg-app px-small py-extra-small text-xs text-text-secondary">
              {campaignName || "Campanha Meta"}
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-small lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)]">
          <div className="relative overflow-hidden rounded-extra-large border border-dashed border-border-highlight/60 bg-bg-card p-medium">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_35%)]" />
            <div className="relative flex h-full flex-col items-start justify-between gap-default">
              <div className="flex items-center gap-small">
                <div className="rounded-full bg-bg-cancel/10 p-small">
                  <Icon type="warning" size="large" color="cancel" />
                </div>
                <div>
                  <p className="font-title text-large text-text-main">
                    {step.placeholderTitle}
                  </p>
                  <p className="mt-extra-small text-content text-text-secondary">
                    {step.placeholderDescription}
                  </p>
                </div>
              </div>

              <div className="w-full rounded-large border border-border-muted bg-bg-app p-small">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Estado atual
                </p>
                <p className="mt-extra-small text-content text-text-main">
                  Estrutura pronta para receber o conteúdo real deste passo nas
                  próximas entregas.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-small">
            <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                O que virá aqui
              </p>
              <p className="mt-small text-content text-text-main">
                Este espaço foi reservado para as instruções práticas,
                orientações visuais e validações específicas da integração Meta.
              </p>
            </div>

            <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Observação
              </p>
              <p className="mt-small text-content text-text-main">
                O tutorial já está separado por tecnologia, então a evolução dos
                próximos passos Meta poderá acontecer sem impactar o fluxo da
                Taboola.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const LoadingState = () => {
  return (
    <div className="mt-default flex flex-col gap-default md:flex-row">
      <div className="hidden md:flex md:w-[300px] md:flex-col md:gap-small">
        {metaIntegrationSteps.map((step) => (
          <div
            key={step.key}
            className="rounded-extra-large border border-border-muted bg-bg-card p-small"
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between gap-small">
                <div className="flex items-center gap-small">
                  <div className="h-10 w-10 rounded-full bg-bg-app" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded bg-bg-app" />
                    <div className="h-4 w-32 rounded bg-bg-app" />
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-bg-app" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <div className="animate-pulse space-y-small">
          <div className="h-5 w-28 rounded bg-bg-app" />
          <div className="h-8 w-2/3 rounded bg-bg-app" />
          <div className="h-4 w-full rounded bg-bg-app" />
          <div className="h-4 w-5/6 rounded bg-bg-app" />
          <div className="mt-small h-52 rounded-extra-large bg-bg-app" />
        </div>
      </div>
    </div>
  );
};

const ErrorState = ({
  onRetry,
}: {
  onRetry: () => void;
}) => {
  return (
    <div className="mt-default rounded-extra-large border border-border-error bg-bg-card p-medium text-center">
      <div className="flex flex-col items-center gap-small">
        <Icon type="warning" size="large" color="cancel" />
        <div>
          <p className="font-title text-large text-text-main">
            Nao foi possivel carregar o status da integracao
          </p>
          <p className="mt-extra-small text-content text-text-secondary">
            Tente novamente para liberar a navegacao dos passos da campanha Meta.
          </p>
        </div>
        <Button type="confirm" size="medium" onClickAction={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
};

export const MetaIntegrationModal = ({ onCloseAction, campaign }: Props) => {
  const [selectedStepKey, setSelectedStepKey] = useState(metaIntegrationSteps[0].key);
  const [integrationStatus, setIntegrationStatus] = useState<MetaIntegrationStatus>(emptyMetaIntegrationStatus);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setLoadError(false);

    try {
      const status = await CallerWrapper(
        callLoadIntegrationStatus(campaign.id, document.cookie)
      );

      setIntegrationStatus(status);
      setSelectedStepKey(getFirstPendingStepKey(status));
    } catch (error) {
      console.error("Failed to load meta integration status:", error);
      setLoadError(true);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [campaign.id]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const stepStates = useMemo(
    () => buildStepStates(integrationStatus),
    [integrationStatus]
  );
  const handleAdProviderCompleted = () => {
    setIntegrationStatus((currentStatus) => ({
      ...currentStatus,
      ad_provider: 1,
    }));
    setSelectedStepKey(2);
  };
  const handleFunnelCompleted = () => {
    setIntegrationStatus((currentStatus) => ({
      ...currentStatus,
      funnel: 1,
    }));
    setSelectedStepKey(3);
  };
  const handleCheckoutCompleted = () => {
    setIntegrationStatus((currentStatus) => ({
      ...currentStatus,
      checkout: 1,
    }));
    setSelectedStepKey(4);
  };
  const handleTestCompleted = () => {
    setIntegrationStatus((currentStatus) => ({
      ...currentStatus,
      test: 1,
    }));
    setSelectedStepKey(4);
  };
  const selectedStep =
    metaIntegrationSteps.find((step) => step.key === selectedStepKey) ??
    metaIntegrationSteps[0];

  return (
    <Modal isOpen={true} onCloseAction={onCloseAction} paddingType="small">
      <div className="relative w-full max-w-6xl max-h-[calc(100vh-5rem)] overflow-y-auto rounded-[24px] border border-border-highlight/40 bg-bg-card p-medium text-text-main shadow-2xl shadow-black/20 md:p-large">
        <button
          type="button"
          onClick={onCloseAction}
          className="absolute right-small top-small flex rounded-full p-1 transition hover:bg-bg-app/50"
          aria-label="Fechar tutorial de integração"
        >
          <Icon type="close" size="medium" color="cancel" />
        </button>

        <div className="flex flex-col gap-extra-small pr-large">
          <span className="w-fit rounded-full border border-border-highlight/50 bg-bg-primary/10 px-small py-extra-small text-xs uppercase tracking-[0.25em] text-text-secondary">
            Tutorial Meta
          </span>
          <div>
            <h2 className="font-title text-title text-text-main">
              Passos de integração da campanha
            </h2>
            <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
              Este fluxo é exclusivo para campanhas Meta e já está preparado
              com a nova estrutura visual dos 4 passos principais.
            </p>
          </div>
        </div>

        <div className="mt-small h-1.5 w-full overflow-hidden rounded-full bg-bg-app">
          <motion.div
            className="h-full rounded-full bg-bg-primary"
            animate={{
              width: `${(selectedStep.key / metaIntegrationSteps.length) * 100}%`,
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </div>

        {isLoadingStatus ? (
          <LoadingState />
        ) : loadError ? (
          <ErrorState onRetry={() => void loadStatus()} />
        ) : (
          <div className="mt-default flex flex-col gap-default md:flex-row">
            <StepNavigation
              steps={stepStates}
              selectedKey={selectedStep.key}
              onSelect={setSelectedStepKey}
            />

            <div className="min-h-[440px] flex-1 rounded-extra-large bg-transparent">
              {selectedStep.key === 1 ? (
                <MetaAdProviderStep
                  campaign={campaign}
                  onCompleteStepAction={handleAdProviderCompleted}
                  isCompleted={integrationStatus.ad_provider === 1}
                />
              ) : selectedStep.key === 2 ? (
                <MetaFunnelStep
                  campaign={campaign}
                  onCompleteStepAction={handleFunnelCompleted}
                  isCompleted={integrationStatus.funnel === 1}
                />
              ) : selectedStep.key === 3 ? (
                <MetaCheckoutStep
                  campaign={campaign}
                  onCompleteStepAction={handleCheckoutCompleted}
                  isCompleted={integrationStatus.checkout === 1}
                />
              ) : selectedStep.key === 4 ? (
                <MetaIntegrationTestStep
                  campaign={campaign}
                  onCompleteStepAction={handleTestCompleted}
                  isCompleted={integrationStatus.test === 1}
                />
              ) : (
                <StepPlaceholder
                  step={selectedStep}
                  campaignName={campaign.name}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MetaIntegrationModal;
