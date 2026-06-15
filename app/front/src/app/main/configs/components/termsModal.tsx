"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "../../../../components/Button/buttonComponent";
import { Modal } from "../../../../components/Modal/modalComponent";
import { acceptContractTermsAction } from "../accountActions";
import TermsOfUse from "./termsOfUse";

type Status = "default" | "success" | "error" | "loading";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccepted: () => void;
  alreadyAccepted: boolean;
}

export default function TermsModal({
  isOpen,
  onClose,
  onAccepted,
  alreadyAccepted,
}: TermsModalProps) {
  const [status, setStatus] = useState<Status>("default");

  async function handleAccept() {
    if (alreadyAccepted || status === "loading") return;

    setStatus("loading");

    const result = await acceptContractTermsAction();

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  function handleClose() {
    if (status === "success") {
      onAccepted();
    }
    onClose();
  }

  const modalBorderType = (() => {
    if (status === "success") return "success";
    if (status === "error") return "error";
    if (status === "loading") return "muted";
    return "muted";
  })();

  const separatorClass = (() => {
    if (status === "success") return "bg-border-highlight";
    if (status === "error") return "bg-border-error";
    return "bg-border-muted";
  })();

  return (
    <Modal
      isOpen={isOpen}
      onCloseAction={handleClose}
      borderType={modalBorderType}
      paddingType="medium"
    >
      <div className="flex flex-col max-h-[90vh]">
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-small text-center py-small">
            <h2 className="text-title">Aceitar termos de uso</h2>

            <div
              className={clsx(
                "w-2/3 h-[2px] my-extra-small mx-auto rounded-full",
                separatorClass
              )}
            />

            <p className="text-subtitle mb-small">
              Termos aceitos com sucesso!
            </p>

            <Button type="confirm" size="small" onClickAction={handleClose}>
              Fechar
            </Button>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center gap-small text-center py-small">
            <h2 className="text-title">Aceitar termos de uso</h2>

            <div
              className={clsx(
                "w-2/3 h-[2px] my-extra-small mx-auto rounded-full",
                separatorClass
              )}
            />

            <p className="text-subtitle mb-small">
              Erro ao aceitar os termos. Tente novamente.
            </p>

            <Button type="cancel" size="small" onClickAction={handleClose}>
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overflow-x-auto scroll-smooth">
              <TermsOfUse />
            </div>

            <div className="flex mt-small justify-center gap-small tablet:gap-large">
              <Button
                type="cancel"
                size="small"
                onClickAction={handleClose}
                disabled={status === "loading"}
              >
                Fechar
              </Button>

              <Button
                type="confirm"
                size="small"
                onClickAction={handleAccept}
                disabled={alreadyAccepted || status === "loading"}
              >
                {alreadyAccepted
                  ? "Termos já aceitos"
                  : status === "loading"
                  ? "Aceitando..."
                  : "Aceitar Termos"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
