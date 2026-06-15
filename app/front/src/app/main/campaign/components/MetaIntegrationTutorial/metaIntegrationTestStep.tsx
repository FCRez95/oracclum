"use client";

import React from "react";
import { Button } from "@/components/Button/buttonComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import {
  MetaClickStepStatus,
  MetaClickStepsModel,
} from "@/models/click/meta-click-steps";
import { loadMetaClickByClickID } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callLoadMetaClickByClickID";
import { callUpdateIntegrationStatus } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callUpdateIntegrationStatus";

const POLL_INTERVAL_MS = 6000;
const STEP_SEQUENCE = [
  { key: "step_1", label: "Passo 1" },
  { key: "step_2", label: "Passo 2" },
  { key: "step_3", label: "Passo 3" },
  { key: "checkout", label: "Checkout" },
] as const;

const EMPTY_META_CLICK: MetaClickStepsModel = {
  id: 0,
  id_click: "",
  id_campaign: 0,
  id_campaign_meta: "",
  id_ad_set: "",
  id_ad_meta: "",
  step_1: 0,
  step_2: 0,
  step_3: 0,
  checkout: 0,
  revenue: 0,
  payment_type: null,
  id_order: null,
};

function makeRandomString(length: number, pool: string): string {
  let result = "";
  while (result.length < length) {
    result += pool.charAt(Math.floor(Math.random() * pool.length));
  }
  return result;
}

function getStepLabel(value: MetaClickStepStatus) {
  if (value === 2) return "View Content";
  if (value === 1) return "Page View";
  return "--";
}

export const MetaIntegrationTestStep = ({
  campaign,
  onCompleteStepAction,
  isCompleted,
}: {
  campaign: CampaignOptimizationModel;
  onCompleteStepAction: () => void;
  isCompleted: boolean;
}) => {
  const [testUrl, setTestUrl] = React.useState("");
  const [generatedClickId, setGeneratedClickId] = React.useState("");
  const [campaignClick, setCampaignClick] = React.useState<MetaClickStepsModel | null>(EMPTY_META_CLICK);
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState("");
  const [isPolling, setIsPolling] = React.useState(false);
  const [pollError, setPollError] = React.useState<string | null>(null);
  const [isCompletingStep, setIsCompletingStep] = React.useState(false);
  const [completeStepError, setCompleteStepError] = React.useState<string | null>(null);

  const updateClickData = React.useCallback(async (idClick: string) => {
    if (!idClick) return;

    try {
      const data = await loadMetaClickByClickID(idClick, document.cookie);
      setCampaignClick(data);
      setLastUpdatedAt(new Date().toLocaleTimeString());
      setPollError(null);
    } catch (error) {
      console.error("Failed to load Meta click data:", error);
      setLastUpdatedAt(new Date().toLocaleTimeString());
      setPollError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar o click de teste da Meta."
      );
    }
  }, []);

  React.useEffect(() => {
    if (!generatedClickId) {
      setIsPolling(false);
      return;
    }

    let cancelled = false;
    setIsPolling(true);

    const poll = () => {
      if (!cancelled) {
        void updateClickData(generatedClickId);
      }
    };

    poll();
    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      setIsPolling(false);
      window.clearInterval(intervalId);
    };
  }, [generatedClickId, updateClickData]);

  const generateClickID = () => {
    const letters = "abcdefghijklmABCDEFGHIJKLM";
    const numbers = "0123456789";
    const time = Date.now();
    const result =
      "test" +
      makeRandomString(10, letters) +
      "-" +
      makeRandomString(8, numbers) +
      time;

    setGeneratedClickId(result);
    setCampaignClick({ ...EMPTY_META_CLICK, id_campaign: campaign.id });
    setLastUpdatedAt("");
    setPollError(null);
    setCompleteStepError(null);
    return result;
  };

  const generateUrl = () => {
    const numbers = "0123456789";
    if (testUrl) return;

    if (!campaign.link || !campaign.click_auth) {
      setPollError("A campanha precisa ter link e click_auth para gerar a URL de teste.");
      return;
    }

    try {
      const clickId = generateClickID();
      const url = new URL(campaign.link, window.location.origin);
      url.searchParams.set("utm_campaign", campaign.click_auth);
      url.searchParams.set("campaign_id", campaign.external_id || String(campaign.id));
      url.searchParams.set("ad_id", makeRandomString(10, numbers));
      url.searchParams.set("ad_set_id", makeRandomString(10, numbers));
      url.searchParams.set("utm_source", clickId);
      setTestUrl(url.toString());
    } catch (error) {
      console.error("Failed to generate Meta test URL:", error);
      setPollError("Nao foi possivel montar a URL de teste desta campanha Meta.");
    }
  };

  const completedSteps = STEP_SEQUENCE.reduce((acc, step) => {
    const value = campaignClick?.[step.key as keyof MetaClickStepsModel];
    return acc + (typeof value === "number" && value > 0 ? 1 : 0);
  }, 0);
  const progressPercentage = Math.round((completedSteps / STEP_SEQUENCE.length) * 100);

  const handleCompleteStep = async () => {
    setCompleteStepError(null);
    setIsCompletingStep(true);

    try {
      const result = await callUpdateIntegrationStatus(
        {
          idCampaign: campaign.id,
          step: "test",
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
      console.error("Failed to complete Meta integration test step:", error);
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
              Passo 4 de 4
            </span>
            <div>
              <h3 className="font-title text-subtitle text-text-main">
                Teste de integracao
              </h3>
              <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                Gere uma URL de teste para a campanha Meta, percorra o funil e
                acompanhe abaixo se cada etapa esta chegando com os sinais esperados.
              </p>
            </div>
          </div>

          <div className="rounded-full bg-bg-app px-small py-extra-small text-xs text-text-secondary">
            {campaign.name}
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-highlight/40 bg-bg-card p-medium">
        <div className="flex flex-col gap-small lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-small">
            <Button
              type={testUrl ? "cancel" : "confirm"}
              size="medium"
              onClickAction={generateUrl}
              disabled={!!testUrl}
            >
              {testUrl ? "URL Gerada" : "Gerar url de teste"}
            </Button>

            <a
              href={testUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`break-all rounded-large border p-small text-small ${testUrl ? "border-border-highlight/40 bg-bg-app text-text-primary hover:underline" : "pointer-events-none border-border-muted bg-bg-app text-text-alt-primary"}`}
            >
              {testUrl || "Nenhuma url gerada ainda"}
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-small rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <div className="flex flex-wrap items-center justify-between gap-small text-extra-small text-text-alt-primary">
          <span>Status do funil de teste</span>
          <span className="flex items-center gap-small">
            <span className={`rounded-full px-small py-extra-small ${isPolling ? "bg-bg-primary/65 text-text-main" : "bg-bg-card text-text-alt-primary"}`}>
              {isPolling ? "Atualizando" : "Em espera"}
            </span>
            <span>Ultima atualizacao: {lastUpdatedAt || "--"}</span>
          </span>
        </div>

        {pollError ? (
          <div className="rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
            {pollError}
          </div>
        ) : null}

        <div className="h-1 w-full rounded-full bg-bg-card">
          <div
            className="h-full rounded-full bg-bg-primary transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-small">
          {STEP_SEQUENCE.map((step) => {
            const value = campaignClick?.[step.key as keyof MetaClickStepsModel];
            const numericValue = typeof value === "number" ? value as MetaClickStepStatus : 0;
            const completed = numericValue > 0;

            return (
              <div
                key={step.key}
                className={`flex items-center justify-between rounded-large border px-small py-small text-extra-small transition-colors ${completed ? "border-bg-primary/60 bg-bg-primary/5 text-text-alt-main" : "border-border-default/20 text-text-alt-primary"}`}
              >
                <span>{step.label}</span>
                <span className={`rounded-full px-small py-extra-small ${completed ? "bg-bg-primary/40" : "bg-bg-card"}`}>
                  {getStepLabel(numericValue)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            type={generatedClickId ? "confirm" : "cancel"}
            size="small"
            disabled={!generatedClickId}
            onClickAction={() => generatedClickId && updateClickData(generatedClickId)}
          >
            Atualizar agora
          </Button>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
        {completeStepError && (
          <div className="mb-small rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
            {completeStepError}
          </div>
        )}

        <p className="text-content text-text-main">
          Depois de validar a URL de teste e confirmar que os sinais estao chegando,
          conclua este passo para finalizar a integracao da campanha Meta.
        </p>

        <div className="mt-small flex justify-center">
          {isCompleted ? (
            <p className="text-content text-text-primary">Passo finalizado</p>
          ) : (
            <Button
              type="confirm"
              size="medium"
              onClickAction={() => void handleCompleteStep()}
              disabled={isCompletingStep || !generatedClickId}
              active={Boolean(generatedClickId)}
            >
              {isCompletingStep ? "Concluindo..." : "Concluir"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaIntegrationTestStep;
