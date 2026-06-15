"use client";

import React, { useState } from "react";
import clsx from "clsx";

import { Button } from "@/components/Button/buttonComponent";
import { Icon } from "@/components/Icon/iconComponent";
import { deleteCampaignAction } from "@/app/main/campaign/components/campaignActions";
import { CallerWrapper } from "@/utils/CallerWrapper";

type Status = "idle" | "loading" | "success" | "error";

interface Props {
  onClose: () => void;
  onDeleted: (deletedId: number) => void;
  onDeleteSuccess: () => void;
  campaignId?: number;
  campaignName?: string;
}

export const DeleteCampaignModal = ({
  onClose,
  campaignId,
  campaignName,
  onDeleted,
  onDeleteSuccess,
}: Props) => {
  const [status, setStatus] = useState<Status>("idle");

  const hasError = status === "error";

  async function handleDelete() {
    setStatus("loading");
    if (!campaignId) {
      setStatus("error");
      return;
    }
    const result = await CallerWrapper(
      deleteCampaignAction(campaignId)
    );

    if (result.success) {
      setStatus("success");
      onDeleteSuccess();
      onDeleted(campaignId);
    } else {
      setStatus("error");
    }
  }

  function getStatus(): {
    colorClass: string;
    hrClass: string;
    buttonType: "confirm" | "cancel";
    buttonText: string;
    canClose: boolean;
  } {
    switch (status) {
      case "loading":
        return {
          colorClass: "border-border-muted",
          hrClass: "border-border-muted",
          buttonType: "cancel",
          buttonText: "Deletando...",
          canClose: false,
        };
      case "success":
        return {
          colorClass: "border-border-highlight",
          hrClass: "border-border-highlight",
          buttonType: "confirm",
          buttonText: "Fechar",
          canClose: true,
        };
      case "error":
        return {
          colorClass: "border-border-error",
          hrClass: "border-border-error",
          buttonType: "cancel",
          buttonText: "Fechar",
          canClose: true,
        };
      default:
        return {
          colorClass: "border-border-muted",
          hrClass: "border-border-muted",
          buttonType: "cancel",
          buttonText: "Deletar",
          canClose: false,
        };
    }
  }

  const statusInfo = getStatus();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={clsx(
          "relative px-medium py-medium rounded-xl border-3 w-2xl text-center shadow-lg shadow-black/30 font-content text-content text-text-main bg-bg-card",
          statusInfo.colorClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute flex top-small right-small p-1 cursor-pointer rounded-full hover:bg-bg-app/20 transition"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
          onKeyDown={(e) => e.key === "Enter" && onClose()}
        >
          <Icon type="close" size="medium" color="cancel" />
        </div>

        <div className="flex flex-col h-full justify-between">
          <div>
            <h2 className="mb-extra-small font-title text-title font-normal">
              Deletar Campanha
            </h2>
            <hr
              className={clsx(
                "border-t-2 w-2/3 mx-auto mb-default rounded-full",
                statusInfo.hrClass
              )}
            />

            {status === "success" ? (
              <p>
                Campanha <strong>{campaignName}</strong> deletada com sucesso!
              </p>
            ) : hasError ? (
              <p>
                Erro ao deletar a campanha <strong>{campaignName}</strong>.
                Tente novamente.
              </p>
            ) : (
              <>
                <p>Tem certeza que deseja deletar a campanha:</p>
                <p className="mt-extra-small text-title font-normal">
                  {campaignName}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Essa ação não poderá ser desfeita!
                </p>
              </>
            )}
          </div>

          <div className="flex justify-center mt-default gap-small">
            <Button
              type={statusInfo.buttonType}
              onClickAction={() => {
                if (statusInfo.canClose) {
                  onClose();
                } else {
                  handleDelete();
                }
              }}
              size="medium"
              disabled={status === "loading"}
            >
              {statusInfo.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
