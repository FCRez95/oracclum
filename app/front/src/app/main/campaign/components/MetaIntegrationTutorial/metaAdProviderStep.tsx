"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { z } from "zod";
import { Button } from "@/components/Button/buttonComponent";
import FormComponent from "@/components/Forms/FormComponent";
import { Icon } from "@/components/Icon/iconComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";
import { callSavePixelInfo } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callSavePixelInfo";
import { callUpdateIntegrationStatus } from "@/app/(DataAccessLayer)/(appServices)/calls/meta/callUpdateIntegrationStatus";
import {
  pixelAccessTokenField,
  pixelIdField,
} from "@/utils/validator/schemas";
import tutorialMeta1 from "@/assets/images/tutorial-meta-1.png";
import tutorialMeta2 from "@/assets/images/tutorial-meta-2.png";
import tutorialMeta3 from "@/assets/images/tutorial-meta-3.png";
import tutorialMeta4 from "@/assets/images/tutorial-meta-4.png";
import trackingTutorial1 from "@/assets/images/meta-tutorial-1.1.png";
import trackingTutorial2 from "@/assets/images/meta-tutorial-1.2.png";
import trackingTutorial3 from "@/assets/images/meta-tutorial-1.3.png";
import trackingTutorial4 from "@/assets/images/meta-tutorial-1.4.png";

type PixelFormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

type StepSection = "pixel" | "tracking";

const initialPixelFormState: PixelFormState = {
  success: false,
  message: "",
  errors: {},
};

const pixelInfoSchema = z.object({
  pixel_id: pixelIdField,
  access_token: pixelAccessTokenField,
});

const sectionLabels: Record<StepSection, string> = {
  pixel: "Sessão 1",
  tracking: "Sessão 2",
};

const pixelTutorialSteps = [
  {
    title: "1. Acessar Events Manager e selecionar o dataset",
    description:
      "Dentro da Meta, abra o Events Manager e selecione o dataset correspondente a esta campanha.",
    image: tutorialMeta1,
  },
  {
    title: "2. Navegar até Settings",
    description:
      "Depois de selecionar a fonte de dados correta, acesse a aba Settings para encontrar as informações do pixel.",
    image: tutorialMeta2,
  },
  {
    title: "3. Copiar o Pixel ID",
    description:
      "Copie o Pixel ID exibido nessa tela e cole o valor no campo do formulário acima.",
    image: tutorialMeta3,
  },
  {
    title: "4. Gerar o Access Token",
    description:
      "Gere o Access Token da Conversions API sem usar o Dataset Quality API e cole o código gerado no formulário.",
    image: tutorialMeta4,
  },
];

const trackingTutorialSteps = [
  {
    title: "1. Selecionar a campanha na Meta",
    description:
      "Dentro do Gerenciador de Anúncios da Meta, selecione a campanha em que as UTMs serão aplicadas.",
    image: trackingTutorial1,
  },
  {
    title: "2. Navegar até Ads",
    description:
      "Com a campanha aberta, avance até a visualização de anúncios para editar cada ad individualmente.",
    image: trackingTutorial2,
  },
  {
    title: "3. Clicar em editar no anúncio",
    description:
      "Abra um anúncio por vez clicando em Editar para inserir os parâmetros de URL no local correto.",
    image: trackingTutorial3,
  },
  {
    title: "4. Adicionar as UTMs no campo indicado",
    description:
      "Role a tela até o campo mostrado na imagem e cole a UTM completa para esse anúncio.",
    image: trackingTutorial4,
  },
];

const inputClassName =
  "w-full rounded-xl border bg-bg-app p-small text-text-main focus:outline-none";

export const MetaAdProviderStep = ({
  campaign,
  onCompleteStepAction,
  isCompleted,
}: {
  campaign: CampaignOptimizationModel;
  onCompleteStepAction: () => void;
  isCompleted: boolean;
}) => {
  const [activeSection, setActiveSection] = useState<StepSection>("pixel");
  const [pixelSavedThisSession, setPixelSavedThisSession] = useState(false);
  const [utmCopied, setUtmCopied] = useState(false);
  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const [completeStepError, setCompleteStepError] = useState<string | null>(null);

  const [pixelFormState, pixelFormAction, pixelPending] = useActionState(
    async (
      _previousState: PixelFormState,
      formData: FormData
    ): Promise<PixelFormState> => {
      const formValues = {
        pixel_id: String(formData.get("pixel_id") || ""),
        access_token: String(formData.get("access_token") || ""),
      };

      const parsed = pixelInfoSchema.safeParse(formValues);
      if (!parsed.success) {
        return {
          success: false,
          errors: parsed.error.flatten().fieldErrors,
          message: "Preencha os campos obrigatórios para continuar.",
        };
      }

      const result = await callSavePixelInfo(
        {
          id_campaign: campaign.id,
          pixel_id: parsed.data.pixel_id,
          access_token: parsed.data.access_token,
        },
        document.cookie
      );

      if (!result.success) {
        const errorMessage =
          result.status === 400
            ? result.message || "Preencha todos os campos obrigatórios."
            : result.status === 401
              ? result.message || "Esta campanha não pertence ao usuário atual."
              : result.message || "Erro interno ao salvar os dados do pixel.";

        return {
          success: false,
          errors: { general: [errorMessage] },
          message: errorMessage,
        };
      }

      return {
        success: true,
        message: result.message || "Dados do pixel salvos com sucesso.",
        errors: {},
      };
    },
    initialPixelFormState
  );

  useEffect(() => {
    if (pixelFormState.success) {
      setPixelSavedThisSession(true);
      setActiveSection("tracking");
    }
  }, [pixelFormState.success]);

  const isAdProviderUnlocked = pixelSavedThisSession || isCompleted;

  const sectionButtons = useMemo(
    () => [
      {
        key: "pixel" as const,
        title: "Cadastro do Pixel",
        description: "Salvar Pixel ID e Access Token da campanha.",
        disabled: false,
      },
      {
        key: "tracking" as const,
        title: "Tracking nos anúncios",
        description: "Preparar a aplicação dos parâmetros nos ads.",
        disabled: !isAdProviderUnlocked,
      },
    ],
    [isAdProviderUnlocked]
  );

  const trackingUtm = useMemo(() => {
    if (!campaign.click_auth) return null;

    return `utm_campaign=${campaign.click_auth}&campaign_id={{campaign.id}}&ad_id={{ad.id}}&ad_set_id={{adset.id}}`;
  }, [campaign.click_auth]);

  const handleCopyUtm = async () => {
    if (!trackingUtm) return;

    try {
      await navigator.clipboard.writeText(trackingUtm);
      setUtmCopied(true);
      window.setTimeout(() => setUtmCopied(false), 2000);
    } catch {
      setUtmCopied(false);
    }
  };

  const handleCompleteStep = async () => {
    setCompleteStepError(null);
    setIsCompletingStep(true);

    try {
      const result = await callUpdateIntegrationStatus(
        {
          idCampaign: campaign.id,
          step: "ad_provider",
          status: 1,
        },
        document.cookie
      );

      if (!result.success) {
        const errorMessage =
          result.status === 400
            ? result.message || "Dados inválidos para concluir o passo."
            : result.status === 401
              ? result.message || "Esta campanha não pertence ao usuário atual."
              : result.message || "Erro interno ao concluir o passo.";

        setCompleteStepError(errorMessage);
        return;
      }

      onCompleteStepAction();
    } catch (error) {
      console.error("Failed to complete ad provider integration step:", error);
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
              Passo 1 de 4
            </span>
            <div>
              <h3 className="font-title text-subtitle text-text-main">
                Integração com a Meta
              </h3>
              <p className="mt-extra-small max-w-3xl text-content text-text-secondary">
                Este passo conecta a campanha Meta à coleta da Oracclum e prepara
                os anúncios para enviar o máximo possível de informações úteis
                após o clique.
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
          Sessões deste passo
        </p>
        <div className="mt-small flex flex-wrap gap-small">
          {sectionButtons.map((section, index) => {
            const isActive = activeSection === section.key;

            return (
              <button
                key={section.key}
                type="button"
                disabled={section.disabled}
                onClick={() => {
                  if (section.disabled) return;
                  setActiveSection(section.key);
                }}
                className={`min-w-[220px] flex-1 rounded-extra-large border p-small text-left transition-all ${
                  isActive
                    ? "border-border-highlight bg-bg-primary/10 shadow-lg shadow-black/10"
                    : "border-border-muted bg-bg-app"
                } ${
                  section.disabled
                    ? "cursor-not-allowed opacity-70"
                    : "hover:border-border-highlight/60 hover:bg-bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-small">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                      {sectionLabels[section.key]}
                    </p>
                    <p className="mt-extra-small font-title text-content text-text-main">
                      {section.title}
                    </p>
                    <p className="mt-extra-small text-small text-text-secondary">
                      {section.description}
                    </p>
                  </div>
                  <div className="mt-extra-small flex h-8 w-8 items-center justify-center rounded-full bg-bg-app">
                    {section.disabled ? (
                      <Icon type="lock" size="small" color="secondary" />
                    ) : (section.key === "pixel" && isAdProviderUnlocked) || isCompleted ? (
                      <Icon type="check" size="small" color="primary" />
                    ) : (
                      <span className="text-xs font-semibold text-text-secondary">
                        {index + 1}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeSection === "pixel" ? (
        <div className="flex flex-col gap-small">
          <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium">
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              Sessão 1
            </p>
            <h4 className="mt-small font-title text-large text-text-main">
              Cadastro do Pixel ID e do Pixel Access Token
            </h4>
            <p className="mt-small text-content text-text-main">
              Esses dados são necessários para que a Oracclum envie eventos
              para o pixel correto via Conversions API e melhore a qualidade da
              atribuicao da campanha.
            </p>
          </div>

          <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
            <FormComponent action={pixelFormAction} type="default">
              <div className="flex flex-col gap-small">
                <div className="flex flex-col gap-extra-small">
                  <label
                    htmlFor="pixel_id"
                    className="text-small text-text-main"
                  >
                    Pixel ID
                  </label>
                  <input
                    id="pixel_id"
                    name="pixel_id"
                    type="text"
                    className={`${inputClassName} ${
                      pixelFormState.errors?.pixel_id
                        ? "border-border-error"
                        : "border-border-muted"
                    }`}
                    placeholder="Ex.: 123456789012345"
                  />
                  {pixelFormState.errors?.pixel_id && (
                    <span className="text-small text-text-error">
                      {pixelFormState.errors.pixel_id[0]}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-extra-small">
                  <label
                    htmlFor="access_token"
                    className="text-small text-text-main"
                  >
                    Pixel Access Token
                  </label>
                  <textarea
                    id="access_token"
                    name="access_token"
                    className={`${inputClassName} min-h-32 resize-none ${
                      pixelFormState.errors?.access_token
                        ? "border-border-error"
                        : "border-border-muted"
                    }`}
                    placeholder="Cole aqui o token de acesso do pixel"
                  />
                  {pixelFormState.errors?.access_token && (
                    <span className="text-small text-text-error">
                      {pixelFormState.errors.access_token[0]}
                    </span>
                  )}
                </div>

                {pixelFormState.errors?.general?.[0] && (
                  <div className="rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
                    {pixelFormState.errors.general[0]}
                  </div>
                )}

                {pixelFormState.success && pixelFormState.message && (
                  <div className="rounded-large border border-border-highlight bg-bg-primary/10 p-small text-small text-text-main">
                    {pixelFormState.message}
                  </div>
                )}

                <div className="flex flex-col gap-small pt-extra-small md:flex-row md:items-center md:justify-between">
                  <p className="text-small text-text-secondary">
                    Ao salvar, voce sera levado automaticamente para a sessão 2 deste passo.
                  </p>
                  <Button
                    type="confirm"
                    size="medium"
                    onClickAction={() => {}}
                    htmlType="submit"
                    disabled={pixelPending}
                  >
                    {pixelPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </FormComponent>
          </div>

          <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              Onde encontrar esses dados
            </p>
            <p className="mt-small text-content text-text-main">
              Dentro da Meta, abra o Events Manager, selecione a Data Source
              correta e navegue até a página de Settings. É ali que ficam os
              dados necessários para este cadastro.
            </p>

            <div className="mt-small grid gap-small">
              {pixelTutorialSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small"
                >
                  <p className="text-small font-semibold text-text-main">
                    {step.title}
                  </p>
                  <p className="mt-extra-small text-small text-text-secondary">
                    {step.description}
                  </p>
                  <div className="mt-small overflow-hidden rounded-large border border-border-muted bg-bg-card">
                    <Image
                      src={step.image}
                      alt={step.title}
                      className="h-auto w-full object-cover"
                      placeholder="blur"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        ) : (
          <div className="flex flex-col gap-small">
            <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Sessão 2
              </p>
              <h4 className="mt-small font-title text-large text-text-main">
                Parametros de tracking nos anuncios
              </h4>
              <p className="mt-small text-content text-text-main">
                Esta etapa vai garantir que os anuncios da campanha carreguem os
                parametros de URL necessarios para capturarmos o maximo de
                informacoes disponiveis quando um clique acontecer.
              </p>
            </div>

            <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
              <p className="text-content text-text-main">
                Adicione a UTM abaixo em todos os anuncios desta campanha para
                que a Oracclum consiga capturar os identificadores disponiveis
                em cada clique.
              </p>

              <div className="mt-small rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
                <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                      UTM montada para esta campanha
                    </p>
                    {trackingUtm ? (
                      <p className="mt-small break-words rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-small text-text-main">
                        {trackingUtm}
                      </p>
                    ) : (
                      <div className="mt-small rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
                        Não foi possível montar a UTM porque o valor de
                        click_auth desta campanha não está disponível no momento.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-extra-small">
                    <Button
                      type="confirm"
                      size="small"
                      onClickAction={handleCopyUtm}
                      disabled={!trackingUtm}
                      active={Boolean(trackingUtm)}
                    >
                      Copiar UTM
                    </Button>
                    {utmCopied && (
                      <p className="text-small text-text-secondary">
                        UTM copiada com sucesso.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
              <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                Onde inserir as UTMs
              </p>
              <p className="mt-small text-content text-text-main">
                Siga o passo a passo abaixo dentro da Meta para inserir a UTM
                montada no local correto de cada anúncio.
              </p>

              <div className="mt-small grid gap-small">
                {trackingTutorialSteps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small"
                  >
                    <p className="text-small font-semibold text-text-main">
                      {step.title}
                    </p>
                    <p className="mt-extra-small text-small text-text-secondary">
                      {step.description}
                    </p>
                    <div className="mt-small overflow-hidden rounded-large border border-border-muted bg-bg-card">
                      <Image
                        src={step.image}
                        alt={step.title}
                        className="h-auto w-full object-cover"
                        placeholder="blur"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
              {completeStepError && (
                <div className="mb-small rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
                  {completeStepError}
                </div>
              )}

              <p className="mt-small text-content text-text-main">
                Importante: essa UTM deve ser inserida em todos os ads da
                campanha para que a coleta aconteça de forma consistente em
                todo o tráfego enviado pela Meta.
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
                    disabled={isCompletingStep || !trackingUtm}
                    active={Boolean(trackingUtm)}
                  >
                    {isCompletingStep ? "Concluindo..." : "Concluir"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default MetaAdProviderStep;
