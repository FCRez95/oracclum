"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useActionState } from "react";

import { Button } from "@/components/Button/buttonComponent";
import InputComponent from "@/components/Forms/InputComponent";
import FormComponent from "@/components/Forms/FormComponent";
import { Icon } from "@/components/Icon/iconComponent";

import {
  editCampaignFullAction,
  loadSubaccountsAction,
  loadTaboolaCampaignsAction,
} from "@/app/main/campaign/components/campaignActions";
import {
  getMetaData,
  fetchMetaCampaigns,
} from "@/app/main/integration/integrationActions";
import {
  providerLogos,
  checkoutLogos,
} from "@/app/main/campaign/components/CreateCampaign/logo_export";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { CampaignSummaryModel } from "@/models/campaign-summary";
import { TaboolaSubaccountModel } from "@/models/taboola-subaccount-model";
import { ExternalCampaignModel } from "@/models/external-campaign-model";

type EditState = {
  success: boolean;
  errors?: Record<string, string[]>;
};

const initialState: EditState = { success: false, errors: undefined };

const hasApiProvider = (provider: string) =>
  provider === "taboola" || provider === "meta";

const availableProviders = providerLogos.filter((l) => !l.isComingSoon);
const availableCheckouts = checkoutLogos.filter((l) => !l.isComingSoon);

interface Props {
  onClose: () => void;
  onEditSuccess: (updates: Partial<CampaignSummaryModel>) => void;
  idCampaign: number;
  initialName: string;
  initialLink: string;
  sub_account?: string;
  ad_provider: string;
  checkout_provider?: string;
  external_id?: string;
  initialConversion?: string;
}

export const EditCampaignModal = ({
  onClose,
  idCampaign,
  initialName,
  initialLink,
  sub_account,
  ad_provider,
  checkout_provider,
  external_id,
  onEditSuccess,
}: Props) => {
  const [provider, setProvider] = useState(ad_provider);
  const [checkout, setCheckout] = useState(checkout_provider || "");
  const [selectedSubAccount, setSelectedSubAccount] = useState(sub_account || "");
  const [selectedExternalId, setSelectedExternalId] = useState(external_id || "");

  const [subaccounts, setSubaccounts] = useState<TaboolaSubaccountModel[]>([]);
  const [loadingSub, setLoadingSub] = useState(false);
  const [metaAdAccounts, setMetaAdAccounts] = useState<TaboolaSubaccountModel[]>([]);
  const [metaToken, setMetaToken] = useState<string | null>(null);

  const [externalCampaigns, setExternalCampaigns] = useState<ExternalCampaignModel[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [state, formAction, pending] = useActionState(
    async (_state: EditState, formData: FormData) => {
      const res = await CallerWrapper(
        editCampaignFullAction(idCampaign, formData)
      );
      if (res.success) {
        onEditSuccess({
          name: formData.get("campaignName") as string,
          link: formData.get("campaignLink") as string,
          conversion: "make_purchase",
          ad_provider: formData.get("ad_provider") as string,
          checkout_provider: formData.get("checkout_provider") as string,
          sub_account: (formData.get("sub_account") as string) || undefined,
          external_id: (formData.get("external_id") as string) || undefined,
        });
      }
      return res;
    },
    initialState
  );

  // Load subaccounts for taboola on mount
  useEffect(() => {
    if (provider !== "taboola") return;
    async function fetchSubs() {
      setLoadingSub(true);
      const response = await CallerWrapper(loadSubaccountsAction());
      const subs = response.data?.results;
      if (subs) setSubaccounts(subs);
      setLoadingSub(false);
    }
    fetchSubs();
  }, [provider]);

  // Load meta data on mount if meta
  useEffect(() => {
    if (provider !== "meta") return;
    async function fetchMeta() {
      setLoadingSub(true);
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
        }
      } catch {
        console.error("Failed to load Meta data");
      }
      setLoadingSub(false);
    }
    fetchMeta();
  }, [provider]);

  // Load external campaigns when provider/subaccount are ready
  useEffect(() => {
    if (provider === "taboola") {
      setLoadingCampaigns(true);
      loadTaboolaCampaignsAction(selectedSubAccount || undefined)
        .then((result) => {
          if (result.success && result.data) setExternalCampaigns(result.data);
        })
        .catch(() => console.error("Failed to load Taboola campaigns"))
        .finally(() => setLoadingCampaigns(false));
    } else if (provider === "meta" && metaToken && selectedSubAccount) {
      setLoadingCampaigns(true);
      fetchMetaCampaigns(metaToken, selectedSubAccount)
        .then((result) => {
          if (result.success && result.campaigns) {
            setExternalCampaigns(
              result.campaigns.map((c) => ({ id: c.id, name: c.name }))
            );
          }
        })
        .catch(() => console.error("Failed to load Meta campaigns"))
        .finally(() => setLoadingCampaigns(false));
    }
  }, [provider, metaToken, selectedSubAccount]);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setSelectedSubAccount("");
    setSelectedExternalId("");
    setExternalCampaigns([]);
    setSubaccounts([]);
    setMetaAdAccounts([]);
    setMetaToken(null);
  };

  const handleSubAccountChange = async (value: string) => {
    setSelectedSubAccount(value);
    setSelectedExternalId("");
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
          setExternalCampaigns(
            result.campaigns.map((c) => ({ id: c.id, name: c.name }))
          );
        }
      } catch {
        console.error("Failed to load Meta campaigns");
      }
      setLoadingCampaigns(false);
    }
  };

  const currentSubaccounts = provider === "meta" ? metaAdAccounts : subaccounts;
  const subAccountLabel =
    provider === "meta" ? "Selecione a conta de anúncio" : "Nenhuma subconta";

  const selectClass = (hasError: boolean) =>
    `w-full p-extra-small rounded-small border bg-bg-app text-text-main text-small focus:outline-none ${
      hasError ? "border-border-error" : "border-border-muted"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          "relative px-medium py-small rounded-xl border-3 border-border-muted w-2xl text-center shadow-lg shadow-black/30 font-content text-content text-text-main bg-bg-card"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute flex top-small right-small p-1 cursor-pointer rounded-full hover:bg-bg-app/50 transition"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        >
          <Icon type="close" size="medium" color="cancel" />
        </div>

        <h2 className="mb-extra-small font-title text-title font-normal">
          Editar campanha
        </h2>
        <hr className="border-t-2 w-2/3 mx-auto mb-small rounded-full border-border-muted" />

        <FormComponent action={formAction} type="default">
          <input type="hidden" name="conversion_name" value="make_purchase" />
          <div className="grid grid-cols-2 gap-x-small gap-y-extra-small py-small">
            {/* Campaign Name */}
            <div className="flex flex-col gap-0.5">
              <label className="text-small text-start text-text-muted">Nome</label>
              <InputComponent
                type="text"
                name="campaignName"
                placeholder="Nome da campanha"
                required
                classType="extraSmall"
                defaultValue={initialName}
                error={!!state.errors?.campaignName}
              />
              {state.errors?.campaignName && (
                <span className="text-small text-start text-text-error">
                  {state.errors.campaignName[0]}
                </span>
              )}
            </div>

            {/* Campaign Link */}
            <div className="flex flex-col gap-0.5">
              <label className="text-small text-start text-text-muted">Link</label>
              <InputComponent
                type="text"
                name="campaignLink"
                placeholder="Link da campanha"
                required
                classType="extraSmall"
                defaultValue={initialLink}
                error={!!state.errors?.campaignLink}
              />
              {state.errors?.campaignLink && (
                <span className="text-small text-start text-text-error">
                  {state.errors.campaignLink[0]}
                </span>
              )}
            </div>

            {/* Ad Provider */}
            <div className="flex flex-col gap-0.5">
              <label className="text-small text-start text-text-muted">Provedor</label>
              <select
                name="ad_provider"
                className={selectClass(false)}
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value)}
              >
                {availableProviders.map((p) => (
                  <option key={p.alt} value={p.alt}>{p.alt}</option>
                ))}
              </select>
            </div>

            {/* Checkout Provider */}
            <div className="flex flex-col gap-0.5">
              <label className="text-small text-start text-text-muted">Checkout</label>
              <select
                name="checkout_provider"
                className={selectClass(false)}
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
              >
                <option value="">Selecione</option>
                {availableCheckouts.map((c) => (
                  <option key={c.alt} value={c.alt}>{c.alt}</option>
                ))}
              </select>
            </div>

            {/* Sub Account */}
            <div className="flex flex-col gap-0.5">
              <label className="text-small text-start text-text-muted">Subconta</label>
              <select
                name="sub_account"
                className={selectClass(false)}
                value={selectedSubAccount}
                onChange={(e) => handleSubAccountChange(e.target.value)}
              >
                <option value="">{subAccountLabel}</option>
                {loadingSub ? (
                  <option disabled>Carregando...</option>
                ) : (
                  currentSubaccounts.map((sub) => (
                    <option key={sub.account_id} value={sub.account_id}>
                      {sub.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* External ID */}
            <div className="flex flex-col gap-0.5">
              <label className="text-small text-start text-text-muted">Campanha externa</label>
              {hasApiProvider(provider) ? (
                <select
                  name="external_id"
                  className={selectClass(!!state.errors?.external_id)}
                  value={selectedExternalId}
                  onChange={(e) => setSelectedExternalId(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {loadingCampaigns ? (
                    <option disabled>Carregando...</option>
                  ) : (
                    externalCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              ) : (
                <InputComponent
                  type="text"
                  name="external_id"
                  placeholder="ID externo"
                  required
                  classType="extraSmall"
                  defaultValue={external_id || ""}
                  error={!!state.errors?.external_id}
                />
              )}
              {state.errors?.external_id && (
                <span className="text-small text-start text-text-error">
                  {state.errors.external_id[0]}
                </span>
              )}
            </div>
          </div>

          {state.errors?.form && (
            <span className="text-small text-text-error">{state.errors.form[0]}</span>
          )}
          {state.errors?.general && (
            <span className="text-small text-text-error">{state.errors.general[0]}</span>
          )}
          {state.success && (
            <span className="text-small text-text-success">Campanha atualizada com sucesso!</span>
          )}

          <div className="flex justify-center mt-small">
            <Button
              type="confirm"
              size="small"
              htmlType="submit"
              disabled={pending || state.success}
              onClickAction={() => {}}
            >
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </FormComponent>
      </div>
    </div>
  );
};
