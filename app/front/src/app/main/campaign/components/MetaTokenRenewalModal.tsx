"use client";

import { useState } from "react";
import { Button } from "@/components/Button/buttonComponent";
import { removeMetaToken } from "@/app/main/integration/integrationActions";

interface MetaTokenRenewalModalProps {
  daysUntilExpiry?: number;
  isExpired?: boolean;
  onCloseAction: () => void;
}

export default function MetaTokenRenewalModal({
  daysUntilExpiry,
  isExpired,
  onCloseAction,
}: MetaTokenRenewalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRenew() {
    setLoading(true);
    setError(null);

    try {
      await removeMetaToken();

      const response = await fetch("/api/meta/oauth/login");
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError(data.error || "Erro ao iniciar conexão");
        setLoading(false);
      }
    } catch {
      setError("Erro ao renovar acesso");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-default">
      <h2 className="text-subtitle font-semibold text-text-main text-center">
        {isExpired
          ? "Token do Meta Ads expirou"
          : `Token do Meta Ads expira em ${daysUntilExpiry} dias`}
      </h2>

      <p className="text-content text-text-secondary text-center">
        Renove o acesso para continuar acompanhando suas campanhas.
      </p>

      {error && (
        <p className="text-content text-text-error text-center">{error}</p>
      )}

      <div className="flex gap-small justify-center">
        <Button type="cancel" size="small" onClickAction={onCloseAction}>
          Fechar
        </Button>
        <Button
          type="confirm"
          size="small"
          onClickAction={handleRenew}
          disabled={loading}
        >
          {loading ? "Renovando..." : "Renovar Acesso"}
        </Button>
      </div>
    </div>
  );
}
