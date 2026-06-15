"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button/buttonComponent";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";

export const UtmStep = ({
  campaign,
}: {
  campaign: CampaignOptimizationModel;
}) => {
  const [utmCopied, setUtmCopied] = useState(false);
  const trackingUtm = useMemo(
    () =>
      `utm_campaign=${campaign.click_auth}&campaign_id={campaign_id}&ad_id={campaign_item_id}&site_id={site_id}&utm_source={click_id}`,
    [campaign.click_auth]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingUtm);
      setUtmCopied(true);
      window.setTimeout(() => setUtmCopied(false), 2000);
    } catch {
      setUtmCopied(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-small">
      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Parametros UTM
        </p>
        <p className="mt-small text-content text-text-main">
          Copie e cole a URL abaixo no campo determinado pelo provedor de
          anuncios da Taboola.
        </p>
      </div>

      <div className="rounded-extra-large border border-border-highlight/40 bg-bg-card p-medium">
        <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
              UTM de trackeamento
            </p>
            <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-app p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
              <code>{trackingUtm}</code>
            </pre>
          </div>

          <div className="flex flex-col items-start gap-extra-small">
            <Button
              type="confirm"
              size="small"
              onClickAction={() => void handleCopy()}
            >
              Copiar
            </Button>
            {utmCopied ? (
              <p className="text-extra-small text-text-secondary">
                UTM copiada.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Observacao
        </p>
        <p className="mt-small text-content text-text-main">
          O valor de <strong>utm_campaign</strong> ja sai preenchido com o
          identificador desta campanha, enquanto os demais parametros devem ser
          mantidos exatamente com os placeholders atuais do provedor.
        </p>
      </div>
    </div>
  );
};

export default UtmStep;
