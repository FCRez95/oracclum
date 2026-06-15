"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button/buttonComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import { callUpdateIntegrationStatus } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callUpdateIntegrationStatus";
import { metaFunnelScriptSteps } from "./metaFunnelStepsData";

type CopyTarget = "head" | "body" | null;

export const MetaFunnelStep = ({
  campaign,
  onCompleteStepAction,
  isCompleted,
}: {
  campaign: CampaignOptimizationModel;
  onCompleteStepAction: () => void;
  isCompleted: boolean;
}) => {
  const [selectedScriptStepKey, setSelectedScriptStepKey] = useState(
    metaFunnelScriptSteps[0].key
  );
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget>(null);
  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const [completeStepError, setCompleteStepError] = useState<string | null>(
    null
  );

  const selectedScriptStep =
    useMemo(
      () =>
        metaFunnelScriptSteps.find((step) => step.key === selectedScriptStepKey) ??
        metaFunnelScriptSteps[0],
      [selectedScriptStepKey]
    );

  const handleCopy = async (content: string, target: Exclude<CopyTarget, null>) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTarget(target);
      window.setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      setCopiedTarget(null);
    }
  };

  const handleCompleteStep = async () => {
    setCompleteStepError(null);
    setIsCompletingStep(true);

    try {
      const result = await callUpdateIntegrationStatus(
        {
          idCampaign: campaign.id,
          step: "funnel",
          status: 1,
        },
        document.cookie
      );

      if (!result.success) {
        const errorMessage =
          result.status === 400
            ? result.message || "Dados invalidos para concluir o passo."
            : result.status === 401
              ? result.message || "Esta campanha nao pertence ao usuario atual."
              : result.message || "Erro interno ao concluir o passo.";

        setCompleteStepError(errorMessage);
        return;
      }

      onCompleteStepAction();
    } catch (error) {
      console.error("Failed to complete funnel integration step:", error);
      setCompleteStepError("Erro interno ao concluir o passo.");
    } finally {
      setIsCompletingStep(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-small">
      <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium shadow-lg shadow-black/5">
        <div className="flex flex-wrap items-start justify-between gap-small">
          <div className="flex min-w-0 flex-col gap-extra-small">
            <span className="w-fit rounded-full border border-border-highlight/50 bg-bg-primary/10 px-small py-extra-small text-xs uppercase tracking-[0.2em] text-text-secondary">
              Passo 2 de 4
            </span>
            <div>
              <h3 className="font-title text-subtitle text-text-main">
                Integracao com o funil
              </h3>
              <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                Neste passo, o cliente instala os scripts que iniciam a ingestao
                de dados da campanha, capturam as UTMs da URL e ajudam a manter o
                mesmo event_id entre browser e servidor para a deduplicacao da Meta.
              </p>
              <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                O GTM da Oracclum carrega os scripts na ordem correta e este funil
                pode ter ate 3 etapas diferentes, cada uma com seu proprio par de
                codigos para head e body.
              </p>
            </div>
          </div>

          <div className="rounded-full bg-bg-app px-small py-extra-small text-xs text-text-secondary">
            {campaign.name}
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-small">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Etapas do funil
        </p>
        <div className="mt-small flex flex-wrap gap-small">
          {metaFunnelScriptSteps.map((step) => {
            const isActive = selectedScriptStep.key === step.key;

            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setSelectedScriptStepKey(step.key)}
                className={`min-w-[180px] flex-1 rounded-extra-large border p-small text-left transition-all ${
                  isActive
                    ? "border-border-highlight bg-bg-primary/10 shadow-lg shadow-black/10"
                    : "border-border-muted bg-bg-app hover:border-border-highlight/60 hover:bg-bg-card"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Etapa {step.key}
                </p>
                <p className="mt-extra-small font-title text-content text-text-main">
                  {step.label}
                </p>
                <p className="mt-extra-small text-small text-text-secondary">
                  Scripts para esta pagina do funil.
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          {selectedScriptStep.label}
        </p>
        <h4 className="mt-small font-title text-large text-text-main">
          Scripts desta etapa do funil
        </h4>
        <p className="mt-small text-content text-text-main">
          {selectedScriptStep.description}
        </p>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <div className="flex flex-col gap-small">
          <div className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
            <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Script para o head
                </p>
                <p className="mt-extra-small text-small text-text-secondary">
                  Copie e cole este codigo o mais alto possivel dentro da tag
                  {" <head>"} da pagina correspondente.
                </p>
                <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
                  <code>{selectedScriptStep.headScript}</code>
                </pre>
              </div>
              <div className="flex flex-col items-start gap-extra-small">
                <Button
                  type="confirm"
                  size="small"
                  onClickAction={() =>
                    void handleCopy(selectedScriptStep.headScript, "head")
                  }
                >
                  Copiar
                </Button>
                {copiedTarget === "head" && (
                  <p className="text-extra-small text-text-secondary">
                    Script do head copiado.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
            <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Script para o body
                </p>
                <p className="mt-extra-small text-small text-text-secondary">
                  Copie e cole este codigo logo apos a abertura da tag
                  {" <body>"} da pagina correspondente.
                </p>
                <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
                  <code>{selectedScriptStep.bodyScript}</code>
                </pre>
              </div>
              <div className="flex flex-col items-start gap-extra-small">
                <Button
                  type="confirm"
                  size="small"
                  onClickAction={() =>
                    void handleCopy(selectedScriptStep.bodyScript, "body")
                  }
                >
                  Copiar
                </Button>
                {copiedTarget === "body" && (
                  <p className="text-extra-small text-text-secondary">
                    Script do body copiado.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Orientacao importante
        </p>
        <p className="mt-small text-content text-text-main">
          Se o funil desta campanha tiver menos de 3 paginas, basta instalar os
          scripts ate a ultima etapa real. Cada pagina do funil deve receber o
          container correspondente para manter a coleta consistente.
        </p>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
        {completeStepError && (
          <div className="mb-small rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
            {completeStepError}
          </div>
        )}

        <p className="text-content text-text-main">
          Quando os scripts do funil estiverem instalados nas paginas
          correspondentes, conclua este passo para liberar a proxima etapa do
          tutorial.
        </p>

        <div className="mt-small flex justify-center">
          {isCompleted ? (
            <p className="text-content text-text-primary">
              Passo finalizado
            </p>
          ) : (
            <Button
              type="confirm"
              size="medium"
              onClickAction={() => void handleCompleteStep()}
              disabled={isCompletingStep}
            >
              {isCompletingStep ? "Concluindo..." : "Concluir"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaFunnelStep;
