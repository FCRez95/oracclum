"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button/buttonComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import { callUpdateIntegrationStatus } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callUpdateIntegrationStatus";
import { buildPostbackUrl } from "@/config/appConfig";

export const MetaCheckoutStep = ({
  campaign,
  onCompleteStepAction,
  isCompleted,
}: {
  campaign: CampaignOptimizationModel;
  onCompleteStepAction: () => void;
  isCompleted: boolean;
}) => {
  const [urlCopied, setUrlCopied] = useState(false);
  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const [completeStepError, setCompleteStepError] = useState<string | null>(
    null
  );

  const checkoutPostbackUrl = useMemo(() => {
    if (!campaign.checkout_provider) return null;

    return buildPostbackUrl(campaign.checkout_provider);
  }, [campaign.checkout_provider]);

  const handleCopyUrl = async () => {
    if (!checkoutPostbackUrl) return;

    try {
      await navigator.clipboard.writeText(checkoutPostbackUrl);
      setUrlCopied(true);
      window.setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      setUrlCopied(false);
    }
  };

  const handleCompleteStep = async () => {
    setCompleteStepError(null);
    setIsCompletingStep(true);

    try {
      const result = await callUpdateIntegrationStatus(
        {
          idCampaign: campaign.id,
          step: "checkout",
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
      console.error("Failed to complete checkout integration step:", error);
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
              Passo 3 de 4
            </span>
            <div>
              <h3 className="font-title text-subtitle text-text-main">
                Integracao com o checkout
              </h3>
              <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                Neste passo, o cliente deve cadastrar um webhook ou postback no
                checkout para que a Oracclum comece a receber os eventos da
                campanha.
              </p>
              <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                A configuracao correta deste endpoint e o que permite ligar os
                eventos pagos do checkout com os dados coletados nas etapas
                anteriores do funil.
              </p>
            </div>
          </div>

          <div className="rounded-full bg-bg-app px-small py-extra-small text-xs text-text-secondary">
            {campaign.name}
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          URL do postback
        </p>
        <p className="mt-small text-content text-text-main">
          Cadastre a URL abaixo no webhook ou postback do seu checkout para que
          a Oracclum comece a receber os eventos desta campanha.
        </p>

        <div className="mt-small rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
          <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              {checkoutPostbackUrl ? (
                <p className="break-words rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-small text-text-main">
                  {checkoutPostbackUrl}
                </p>
              ) : (
                <div className="rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
                  Nao foi possivel montar a URL do checkout porque o
                  checkout_provider desta campanha nao esta disponivel.
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-extra-small">
              <Button
                type="confirm"
                size="small"
                onClickAction={() => void handleCopyUrl()}
                disabled={!checkoutPostbackUrl}
                active={Boolean(checkoutPostbackUrl)}
              >
                Copiar
              </Button>
              {urlCopied && (
                <p className="text-extra-small text-text-secondary">
                  URL copiada com sucesso.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-error bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-error">
          Eventos obrigatorios
        </p>
        <p className="mt-small text-content text-text-main">
          Marque apenas <strong>pedido pago</strong> e <strong>upsell</strong>
          {" "}como eventos de disparo deste webhook/postback.
        </p>
        <p className="mt-extra-small text-content text-text-secondary">
          Nao configure outros eventos neste endpoint, porque isso pode causar
          envio incorreto de sinais e contaminar a leitura da campanha.
        </p>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
        {completeStepError && (
          <div className="mb-small rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
            {completeStepError}
          </div>
        )}

        <p className="text-content text-text-main">
          Depois de cadastrar a URL no checkout e limitar os disparos para
          pedido pago e upsell, conclua este passo para liberar o teste final da
          integracao.
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
              disabled={isCompletingStep || !checkoutPostbackUrl}
              active={Boolean(checkoutPostbackUrl)}
            >
              {isCompletingStep ? "Concluindo..." : "Concluir"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaCheckoutStep;
