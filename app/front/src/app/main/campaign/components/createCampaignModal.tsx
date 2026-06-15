"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { useActionState } from "react";

import { Button } from "@/components/Button/buttonComponent";
import InputComponent from "@/components/Forms/InputComponent";
import FormComponent from "@/components/Forms/FormComponent";
import { Icon } from "../../../../components/Icon/iconComponent";
import { createCampaignAction, loadSubaccountsAction } from "./campaignActions";
import { TaboolaSubaccountModel } from "@/models/taboola-subaccount-model";

type CampaignState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

const initialState: CampaignState = {
  success: false,
  errors: undefined,
  message: "",
};

interface Props {
  onClose: () => void;
  onCreated: (newCampaign: { id: number; name: string; id_user: number; link: string; sub_account?: string; click_auth: string }) => void;
}




export const CreateCampaignModal = ({ onClose, onCreated }: Props) => {
  const [createdCampaign, setCreatedCampaign] = useState<{
    id: number;
    name: string;
    id_user: number;
    link: string;
    sub_account?: string;
    click_auth: string;
  } | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_state: CampaignState, formData: FormData) => {
      const result = await createCampaignAction(formData);

      if (result.success && result.data) {
        setCreatedCampaign(result.data);
        onCreated(result.data);
      }

      return result;
    },
    initialState
  );

  const [subaccounts, setSubaccounts] = React.useState<TaboolaSubaccountModel[]>([]);
  const [loadingSub, setLoadingSub] = React.useState(true);

  useEffect(() => {
    async function fetchSubs() {
      setLoadingSub(true);
      const result = await loadSubaccountsAction();
      if (result.success && Array.isArray(result.data)) {
        setSubaccounts(result.data);
      } else {
        setSubaccounts([]);
      }
      setLoadingSub(false);
    }
    fetchSubs();
  }, []);

  const hasFieldErrors = !!(state.errors?.campaignName || state.errors?.campaignLink);
  const hasGeneralError = !!(state.errors && !hasFieldErrors);

  function getStatus(): {
    colorClass: string;
    hrClass: string;
    buttonType: "confirm" | "cancel";
    buttonText: string;
    canClose: boolean;
    htmlType?: "button" | "submit" | "reset";
  } {
    if (pending) {
      return {
        colorClass: "border-border-muted",
        hrClass: "border-border-muted",
        buttonType: "confirm",
        buttonText: "Criando...",
        canClose: false,
      };
    }
    if (state.success) {
      return {
        colorClass: "border-border-highlight",
        hrClass: "border-border-highlight",
        buttonType: "confirm",
        buttonText: "Fechar",
        canClose: true,
      };
    }
    if (hasGeneralError) {
      return {
        colorClass: "border-border-error",
        hrClass: "border-border-error",
        buttonType: "cancel",
        buttonText: "Fechar",
        canClose: true,
      };
    }
    return {
      colorClass: "border-border-muted",
      hrClass: "border-border-muted",
      buttonType: "confirm",
      buttonText: "Confirmar",
      htmlType: "submit",
      canClose: false,
    };
  }

  const status = getStatus();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          "relative px-medium py-medium rounded-xl border-3 w-2xl text-center shadow-lg shadow-black/30 font-content text-content text-text-main bg-bg-card",
          status.colorClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute flex top-small right-small cursor-pointer p-1 rounded-full hover:bg-bg-app/50 transition"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        >
          <Icon type="close" size="medium" color="cancel" />
        </div>

        <div className="flex flex-col h-full justify-between">
          <FormComponent action={formAction} type="default">
            <div>
              <h2 className="mb-extra-small font-title text-title font-normal">
                Criar nova campanha
              </h2>
              <hr
                className={clsx("border-t-2 w-2/3 mx-auto rounded-full", status.hrClass)}
              />

              {state.success ? (
                <div className="flex flex-col gap-small">
                  <p className="text-lg font-normal mt-small">Campanha criada com sucesso!</p>
                  
                  <div className="flex flex-col gap-extra-small bg-bg-app/20 rounded-lg p-small">
                    <p className="font-normal">UTMs de Trackeamento:</p>
                    <p className="text-left break-words text-sm break-all">
                      utm_campaign={createdCampaign?.click_auth}&campaign_id={"{campaign_id}"}&ad_id={"{campaign_item_id}"}&site_id={"{site_id}"}&utm_source={"{click_id}"}
                    </p>
                  </div>
                </div>
              ) : hasGeneralError && !pending ? (
                <p>Erro ao criar campanha. Tente novamente.</p>
              ) : (
                <div className="flex flex-col gap-small flex-grow mt-default">
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

                  {subaccounts.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <select
                        name="subAccountId"
                        className={`w-full p-extra-small rounded border-2 bg-white ${
                          state.errors?.subAccountId
                            ? "border-border-error"
                            : "border-border-muted"
                        }`}
                        defaultValue=""
                      >
                        <option value="">Nenhuma subconta</option>
                        {loadingSub ? (
                          <option disabled>Carregando...</option>
                        ) : (
                          subaccounts.map((sub) => (
                            <option key={sub.account_id} value={sub.account_id}>
                              {sub.account_id}
                            </option>
                          ))
                        )}
                      </select>
                      {state.errors?.subAccountId && (
                        <span className="text-small text-end text-text-error">
                          {state.errors.subAccountId[0]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center mt-small">
              <Button
                type={status.buttonType}
                onClickAction={() => {
                  if (status.canClose) {
                    onClose();
                  }
                }}
                size="medium"
                htmlType={status.htmlType}
                disabled={pending}
              >
                {status.buttonText}
              </Button>
            </div>
          </FormComponent>
        </div>
      </div>
    </div>
  );
};
