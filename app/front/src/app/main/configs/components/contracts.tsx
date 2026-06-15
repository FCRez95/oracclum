"use client";

import { useState } from "react";
import TermsModal from "./termsModal";
import { Button } from "@/components/Button/buttonComponent";
interface ContractsProps {
  contractSigned: boolean;
  onContractAccepted: () => void;
}

export default function Contracts({ contractSigned, onContractAccepted }: ContractsProps) {
  const [showTerms, setShowTerms] = useState(false);

  function closeModal() {
    setShowTerms(false);
  }

  function showAcceptedMessage() {
    setShowTerms(false);
    onContractAccepted();
  }

  return (
    <div className="flex flex-col pb-medium gap-default">

      {contractSigned ? (
        <div>
          Os termos de uso ja foram aceitos!
        </div>
      ) : (
        <div>
          Para acessar todos os recursos do Oracclum, aceite nossos Termos de Uso.
        </div>
      )}

      <div className="flex flex-col gap-medium justify-center items-start">
        <Button
          type="confirm"
          onClickAction={() => setShowTerms(true)}
          size="small"
        >
          {contractSigned ? "Ver Termos de Uso" : "Aceitar Termos de Uso"}
        </Button>
      </div>

      {showTerms && (
        <TermsModal
          isOpen={showTerms}
          onClose={closeModal}
          onAccepted={showAcceptedMessage}
          alreadyAccepted={contractSigned}
        />
      )}

    </div>
  );
}
