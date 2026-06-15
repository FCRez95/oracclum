"use client";

import { useState } from "react";
import clsx from "clsx";

import { deleteMyData } from "@/app/(DataAccessLayer)/(appServices)/calls/user/callDeleteMyData";
import { Button } from "@/components/Button/buttonComponent";
import { Icon } from "@/components/Icon/iconComponent";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { forceLogout } from "@/utils/forceLogout";

type Status = "idle" | "loading" | "success" | "error";

interface DeleteMyDataModalProps {
  onClose: () => void;
}

export default function DeleteMyDataModal({
  onClose,
}: DeleteMyDataModalProps) {
  const [status, setStatus] = useState<Status>("idle");

  const hasError = status === "error";

  async function handleDeleteMyData() {
    setStatus("loading");

    try {
      const result = await CallerWrapper(deleteMyData());

      if (result.success) {
        setStatus("success");
        try {
          await forceLogout();
        } catch {
          window.location.href = "/login";
        }
        return;
      }

      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  function getStatus() {
    switch (status) {
      case "loading":
        return {
          colorClass: "border-border-muted",
          hrClass: "border-border-muted",
          buttonType: "cancel" as const,
          buttonText: "Deletando...",
          canClose: false,
        };
      case "success":
        return {
          colorClass: "border-border-highlight",
          hrClass: "border-border-highlight",
          buttonType: "confirm" as const,
          buttonText: "Saindo...",
          canClose: false,
        };
      case "error":
        return {
          colorClass: "border-border-error",
          hrClass: "border-border-error",
          buttonType: "cancel" as const,
          buttonText: "Fechar",
          canClose: true,
        };
      default:
        return {
          colorClass: "border-border-error",
          hrClass: "border-border-error",
          buttonType: "cancel" as const,
          buttonText: "Confirmar",
          canClose: false,
        };
    }
  }

  const statusInfo = getStatus();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={status === "loading" ? undefined : onClose}
    >
      <div
        className={clsx(
          "relative w-2xl rounded-xl border-3 bg-bg-card px-medium py-medium text-center font-content text-content text-text-main shadow-lg shadow-black/30",
          statusInfo.colorClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsx(
            "absolute top-small right-small flex rounded-full p-1 transition",
            status === "loading"
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-bg-app/20"
          )}
          onClick={status === "loading" ? undefined : onClose}
          role="button"
          tabIndex={0}
          aria-label="Close modal"
          onKeyDown={(e) => {
            if (status !== "loading" && e.key === "Enter") onClose();
          }}
        >
          <Icon type="close" size="medium" color="cancel" />
        </div>

        <div className="flex h-full flex-col justify-between">
          <div>
            <h2 className="mb-extra-small font-title text-title font-normal">
              Deletar Meus Dados
            </h2>
            <hr
              className={clsx(
                "mx-auto mb-default w-2/3 rounded-full border-t-2",
                statusInfo.hrClass
              )}
            />

            {status === "success" ? (
              <p>
                Seus dados foram deletados com sucesso. Você será redirecionado
                para o login.
              </p>
            ) : hasError ? (
              <p>
                Não foi possível deletar seus dados agora. Tente novamente em
                instantes.
              </p>
            ) : (
              <>
                <p>
                  Tem certeza que deseja deletar todos os dados da sua conta?
                </p>
                <p className="mt-extra-small text-sm text-text-muted">
                  Essa ação não poderá ser desfeita.
                </p>
                <p className="mt-small">
                  Todos os dados vinculados à sua conta serão descartados e o
                  seu acesso será encerrado, exigindo novo login.
                </p>
              </>
            )}
          </div>

          <div className="mt-default flex justify-center gap-small">
            {status === "idle" ? (
              <>
                <Button
                  type="cancel"
                  size="medium"
                  onClickAction={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="confirm"
                  size="medium"
                  onClickAction={handleDeleteMyData}
                >
                  Confirmar
                </Button>
              </>
            ) : (
              <Button
                type={statusInfo.buttonType}
                size="medium"
                onClickAction={() => {
                  if (statusInfo.canClose) {
                    onClose();
                  }
                }}
                disabled={status === "loading" || status === "success"}
              >
                {statusInfo.buttonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
