"use client";

import React, { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button/buttonComponent";
import InputComponent from "@/components/Forms/InputComponent";
import FormComponent from "@/components/Forms/FormComponent";
import { Icon } from "../../../../../components/Icon/iconComponent";
import {
  createCampaignAction,
  loadSubaccountsAction,
  loadTaboolaCampaignsAction,
} from "../campaignActions";
import { getMetaData, fetchMetaCampaigns } from "@/app/main/integration/integrationActions";
import { ExternalCampaignModel } from "@/models/external-campaign-model";
import { TaboolaSubaccountModel } from "@/models/taboola-subaccount-model";
import {
  providerLogos,
  checkoutLogos,
} from "@/app/main/campaign/components/CreateCampaign/logo_export";
import { ClickableLogo } from "./clickableLogo";
import { CallerWrapper } from "@/utils/CallerWrapper";

type CampaignState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
  data?: {
    id: number;
    name: string;
    ad_provider: string;
    checkout_provider: string;
    conversion_name: string;
    id_user: number;
    link: string;
    sub_account?: string;
    click_auth: string;
    external_id: string;
  };
};

const initialState: CampaignState = { success: false };

interface Props {
  onCloseAction: () => void;
  onCreatedAction: (newCampaign: CampaignState["data"]) => void;
  campaignCount: number;
  maxCampaigns: number;
  allowClicks: boolean;
}
// --- Helper UI Components ---

const ModalHeader = ({
  title,
  hrClass,
}: {
  title: string;
  hrClass: string;
}) => (
  <>
    <h2 className="mb-extra-small font-title text-title font-normal">
      {title}
    </h2>
    <hr className={`border-t-2 w-2/3 mx-auto rounded-full ${hrClass}`} />
  </>
);

const LogoSelectionStep = ({
  title,
  logos,
  onSelect,
}: {
  title: string;
  logos: typeof providerLogos;
  onSelect: (alt: string) => void | Promise<void>;
}) => (
  <div className="flex flex-col gap-default mt-default">
    <p>{title}</p>
    <div className="grid grid-cols-3 gap-x-small gap-y-medium">
      {logos.map((logo) => (
        <ClickableLogo
          key={logo.alt}
          {...logo}
          onClick={() => onSelect(logo.alt)}
          onClickS2S={() => onSelect(logo.alt + "-s2s")}
          isComingSoon={logo.alt === "clickbank" || logo.alt === "digistore" || logo.alt === "twitter" || logo.alt === "teads" /* || logo.alt === "meta" */}
        />
      ))}
    </div>
  </div>
);

const hasApiProvider = (provider: string | null) =>
  provider === "taboola" || provider === "meta";

const CampaignFormStep = ({
  state,
  subaccounts,
  loadingSub,
  provider,
  checkout,
  subAccountLabel = "Nenhuma subconta",
  externalCampaigns,
  loadingCampaigns,
  onSubAccountChange,
}: {
  state: CampaignState;
  subaccounts: TaboolaSubaccountModel[];
  loadingSub: boolean;
  provider: string | null;
  checkout: string | null;
  subAccountLabel?: string;
  externalCampaigns: ExternalCampaignModel[];
  loadingCampaigns: boolean;
  onSubAccountChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-small flex-grow mt-default">
    {/* Hidden inputs for provider and checkout */}
    <input type="hidden" name="ad_provider" value={provider || ""} />
    <input type="hidden" name="checkout_provider" value={checkout || ""} />

    <div className="flex flex-col gap-0.5">
      <InputComponent
        type="text"
        name="campaignName"
        placeholder="Nome da campanha"
        required
        classType="filled"
        error={!!state.errors?.campaignName}
      />
      {state.errors?.campaignName && (
        <span className="text-small text-center text-text-error">
          {state.errors.campaignName[0]}
        </span>
      )}
    </div>
    <div className="flex flex-col gap-0.5">
      <InputComponent
        type="text"
        name="campaignLink"
        placeholder="Link da campanha"
        required
        classType="filled"
        error={!!state.errors?.campaignLink}
      />
      {state.errors?.campaignLink && (
        <span className="text-small text-center text-text-error">
          {state.errors.campaignLink[0]}
        </span>
      )}
    </div>

    <div className="flex flex-col gap-0.5">
      <select
        name="sub_account"
        className={`w-full p-small rounded-xl border-2 bg-bg-input text-text-input ${
          state.errors?.sub_account
            ? "border-border-error"
            : "border-border-muted"
        }`}
        defaultValue=""
        onChange={(e) => onSubAccountChange(e.target.value)}
      >
        <option value="">{subAccountLabel}</option>
        {loadingSub ? (
          <option disabled>Carregando...</option>
        ) : (
          subaccounts.map((sub) => (
            <option key={sub.account_id} value={sub.account_id}>
              {sub.name}
            </option>
          ))
        )}
      </select>
      {state.errors?.sub_account && (
        <span className="text-small text-end text-text-error">
          {state.errors.sub_account[0]}
        </span>
      )}
    </div>

    {/* External campaign field */}
    <div className="flex flex-col gap-0.5">
      {hasApiProvider(provider) ? (
        <select
          name="external_id"
          className={`w-full p-small rounded-xl border-2 bg-bg-input text-text-input ${
            state.errors?.external_id
              ? "border-border-error"
              : "border-border-muted"
          }`}
          defaultValue=""
        >
          <option value="">Selecione a campanha</option>
          {loadingCampaigns ? (
            <option disabled>Carregando campanhas...</option>
          ) : (
            externalCampaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      ) : (
        <InputComponent
          type="text"
          name="external_id"
          placeholder="ID da campanha externa"
          required
          classType="filled"
          error={!!state.errors?.external_id}
        />
      )}
      {state.errors?.external_id && (
        <span className="text-small text-center text-text-error">
          {state.errors.external_id[0]}
        </span>
      )}
    </div>

    <div className="flex flex-col gap-0.5">
      <label htmlFor="conversion_name" className="text-small text-start text-text-main">Nome da conversão</label>
      <InputComponent
        type="text"
        name="conversion_name"
        placeholder="Nome da conversão"
        required
        classType="filled"
        defaultValue="make_purchase"
        readOnly={true}
        error={!!state.errors?.conversion_name}
      />
      {state.errors?.conversion_name && (
        <span className="text-small text-center text-text-error">
          {state.errors.conversion_name[0]}
        </span>
      )}
    </div>
  </div>
);

const SuccessDisplay = ({
  campaign,
  onClose,
}: {
  campaign: NonNullable<CampaignState["data"]>;
  checkout?: string | null;
  onClose: () => void;
}) => {
  const router = useRouter();
  const isMetaCampaign = campaign.ad_provider === "meta";

  if (isMetaCampaign) {
    const handleOpenCampaign = () => {
      router.push(
        `/main/campaign/meta/${campaign.id}/${campaign.external_id}/adsets?showIntegration=1`
      );
    };

    return (
      <div className="flex flex-col items-center gap-small mt-small">
        <div className="flex items-center justify-center rounded-full bg-bg-cancel/10 p-small">
          <Icon type="warning" size="extraLarge" color="secondary" />
        </div>

        <div className="flex flex-col gap-extra-small text-center max-w-lg">
          <p className="text-lg font-normal">Campanha criada com sucesso!</p>
          <p className="text-[#cfd950] font-normal">
            A integração da campanha Meta ainda não foi concluída.
          </p>
          <p className="text-sm text-text-main">
            Para a coleta de dados começar, entre na campanha criada e siga as
            instruções de integração.
          </p>
        </div>

        <div className="flex justify-center mt-small">
          <Button
            type="confirm"
            size="medium"
            onClickAction={handleOpenCampaign}
          >
            Ir para a campanha
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-small">
      <p className="text-lg font-normal mt-small">
        Campanha criada com sucesso!
      </p>

      <div className="flex flex-col gap-extra-small mt-small">
        <p className="font-normal text-text-main">UTMs de Trackeamento:</p>
        <p className="text-text-main text-extra-small">
          Copie e cole no campo determinado pelo provedor de anúncios
        </p>
        <p className="text-left break-words text-sm bg-bg-app p-extra-small rounded-small">
          utm_campaign={campaign.click_auth}&campaign_id={"{campaign_id}"}&ad_id=
          {"{campaign_item_id}"}&site_id={"{site_id}"}&utm_source={"{click_id}"}
        </p>
      </div>

      <div className="flex justify-center mt-small">
        <Button type="confirm" size="medium" onClickAction={onClose}>
          Fechar tudo
        </Button>
      </div>
    </div>
  );
};

export const CreateCampaignModal = ({
  onCloseAction,
  onCreatedAction,
  campaignCount,
  maxCampaigns,
  allowClicks,
}: Props) => {
  const [provider, setProvider] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<string | null>(null);
  const [subaccounts, setSubaccounts] = useState<TaboolaSubaccountModel[]>([]);
  const [loadingSub, setLoadingSub] = useState(true);
  const [metaAdAccounts, setMetaAdAccounts] = useState<TaboolaSubaccountModel[]>([]);
  const [metaCheckLoading, setMetaCheckLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaToken, setMetaToken] = useState<string | null>(null);
  const [externalCampaigns, setExternalCampaigns] = useState<ExternalCampaignModel[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [state, formAction, pending] = useActionState(
    (_state: CampaignState, formData: FormData) =>
      createCampaignAction(formData),
    initialState
  );

  useEffect(() => {
    if (state.success && state.data) {
      onCreatedAction(state.data);
    }
  }, [state.success, state.data, onCreatedAction]);

  useEffect(() => {
    async function fetchSubs() {
      setLoadingSub(true);
      const response = await CallerWrapper(loadSubaccountsAction());
      const subaccounts = response.data?.results;
      if (subaccounts) setSubaccounts(subaccounts);
      setLoadingSub(false);
    }
    fetchSubs();
  }, []);

  // Load Taboola campaigns on mount (main account) when provider is taboola
  useEffect(() => {
    if (provider !== "taboola") return;
    async function fetchTaboolaCampaigns() {
      setLoadingCampaigns(true);
      try {
        const result = await loadTaboolaCampaignsAction();
        if (result.success && result.data) setExternalCampaigns(result.data);
      } catch {
        console.error("Failed to load Taboola campaigns");
      }
      setLoadingCampaigns(false);
    }
    fetchTaboolaCampaigns();
  }, [provider]);

  const handleSubAccountChange = async (value: string) => {
    setExternalCampaigns([]);
    if (provider === "taboola") {
      setLoadingCampaigns(true);
      try {
        const result = await loadTaboolaCampaignsAction(value || undefined);
        if (result.success && result.data) setExternalCampaigns(result.data);
      } catch {
        console.error("Failed to load Taboola campaigns for sub_account");
      }
      setLoadingCampaigns(false);
    } else if (provider === "meta" && metaToken && value) {
      setLoadingCampaigns(true);
      try {
        const result = await fetchMetaCampaigns(metaToken, value);
        if (result.success && result.campaigns) {
          setExternalCampaigns(result.campaigns.map((c) => ({ id: c.id, name: c.name })));
        }
      } catch {
        console.error("Failed to load Meta campaigns");
      }
      setLoadingCampaigns(false);
    }
  };

  const hasFieldErrors = !!(
    state.errors?.campaignName ||
    state.errors?.campaignLink ||
    state.errors?.conversion_name ||
    state.errors?.external_id
  );
  const hasGeneralError = !!state.errors && !hasFieldErrors;

  const getStatus = () => {
    if (pending)
      return {
        color: "muted",
        buttonText: "Criando...",
        canClose: false,
        isFormButton: true,
      };
    if (state.success)
      return {
        color: "highlight",
        buttonText: "Fechar",
        canClose: true,
        isFormButton: true,
      };
    if (hasGeneralError)
      return {
        color: "error",
        buttonText: "Tentar Novamente",
        canClose: true,
        isFormButton: true,
      };
    if (!provider)
      return {
        color: "muted",
        buttonText: "",
        canClose: false,
        isFormButton: false,
      };
    if (!checkout)
      return {
        color: "muted",
        buttonText: "",
        canClose: false,
        isFormButton: false,
      };
    return {
      color: "muted",
      buttonText: "Confirmar",
      canClose: false,
      isFormButton: true,
    };
  };

  const status = getStatus();
  const colorMap = {
    muted: "border-border-muted",
    highlight: "border-border-highlight",
    error: "border-border-error",
  };
  const borderColor = colorMap[status.color as keyof typeof colorMap];

  const renderContent = () => {
    if (state.success && state.data) {
      return (
        <SuccessDisplay
          campaign={state.data}
          checkout={checkout}
          onClose={onCloseAction}
        />
      );
    }

    if (hasGeneralError) {
      return (
        <p className="mt-default">
          Erro ao criar campanha. Por favor, tente novamente.
        </p>
      );
    }

    if (!allowClicks) {
      return (
        <div className="flex flex-col items-center gap-small mt-default">
          <p className="text-text-error font-normal">Clicks desabilitados</p>
          <p className="text-text-secondary text-sm">
            Entre em contato com o suporte para habilitar seus clicks.
          </p>
        </div>
      );
    }

    if (campaignCount >= maxCampaigns) {
      return (
        <div className="flex flex-col items-center gap-small mt-default">
          <p className="text-text-error font-normal">Limite de campanhas atingido</p>
          <p className="text-text-secondary text-sm">
            Seu plano permite {maxCampaigns === Infinity ? "ilimitadas" : maxCampaigns} campanha{maxCampaigns !== 1 ? "s" : ""}.
            Faça upgrade para criar mais campanhas.
          </p>
        </div>
      );
    }

    if (metaCheckLoading) {
      return (
        <div className="flex flex-col items-center gap-small mt-default">
          <p>Verificando conexão com Meta...</p>
        </div>
      );
    }

    if (metaError) {
      return (
        <div className="flex flex-col items-center gap-small mt-default">
          <p className="text-text-error">{metaError}</p>
          <a
            href="/main/integration"
            className="text-text-highlight underline"
          >
            Ir para integrações
          </a>
          <Button
            type="cancel"
            size="small"
            onClickAction={() => {
              setMetaError(null);
            }}
          >
            Voltar
          </Button>
        </div>
      );
    }

    if (!provider) {
      return (
        <LogoSelectionStep
          title="Selecione um provedor de anúncios."
          logos={providerLogos}
          onSelect={async (alt) => {
            if (alt === "meta") {
              setMetaCheckLoading(true);
              try {
                const result = await getMetaData();
                if (result.success && result.metaData?.metaAdsToken) {
                  const accounts = (result.metaData.allowedAccounts || []).map(
                    (acc: { account_id: string; name: string }) => ({
                      id: acc.account_id,
                      account_id: acc.account_id,
                      name: acc.name,
                    })
                  );
                  setMetaAdAccounts(accounts);
                  setMetaToken(result.metaData.metaAdsToken);
                  setProvider("meta");
                } else {
                  setMetaError(
                    "Conecte sua conta Meta na página de integrações"
                  );
                }
              } catch {
                setMetaError(
                  "Erro ao verificar conexão com Meta"
                );
              }
              setMetaCheckLoading(false);
            } else {
              setProvider(alt);
            }
          }}
        />
      );
    }

    if (!checkout) {
      return (
        <LogoSelectionStep
          title="Selecione um provedor de checkout."
          logos={checkoutLogos}
          onSelect={setCheckout}
        />
      );
    }

    return (
      <FormComponent action={formAction} type="default">
        <CampaignFormStep
          state={state}
          subaccounts={provider === "meta" ? metaAdAccounts : subaccounts}
          loadingSub={provider === "meta" ? false : loadingSub}
          provider={provider}
          checkout={checkout}
          subAccountLabel={
            provider === "meta"
              ? "Selecione a conta de anúncio"
              : "Nenhuma subconta"
          }
          externalCampaigns={externalCampaigns}
          loadingCampaigns={loadingCampaigns}
          onSubAccountChange={handleSubAccountChange}
        />
        <div className="flex justify-center mt-small">
          {status.isFormButton && (
            <Button
              type={status.color === "error" ? "cancel" : "confirm"}
              onClickAction={() => {
                if (status.canClose) onCloseAction();
              }}
              size="medium"
              htmlType={status.color === "error" ? "button" : "submit"}
              disabled={pending}
            >
              {status.buttonText}
            </Button>
          )}
        </div>
      </FormComponent>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/30 backdrop-blur-sm"
      onClick={onCloseAction}
    >
      <div
        className={`relative px-medium py-medium rounded-xl border-3 w-2xl text-center shadow-lg shadow-black/30 font-content text-content text-text-main bg-bg-card ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute flex top-small right-small p-1 rounded-full hover:bg-bg-app/50 transition"
          onClick={onCloseAction}
          aria-label="Close modal"
        >
          <Icon type="close" size="medium" color="cancel" />
        </button>

        <ModalHeader title="Criar nova campanha" hrClass={borderColor} />

        {renderContent()}
      </div>
    </div>
  );
};
