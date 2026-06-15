"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button/buttonComponent";
import { buildPostbackUrl } from "@/config/appConfig";

const GTM_HEAD_SCRIPT = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N3KSN9K6');</script>
<!-- End Google Tag Manager -->`;

const GTM_BODY_SCRIPT = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N3KSN9K6"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

export const CheckoutStep = ({ checkout }: { checkout?: string | null }) => {
  const [copiedTarget, setCopiedTarget] = useState<"url" | "head" | "body" | null>(
    null
  );
  const postbackUrl = useMemo(
    () => buildPostbackUrl(checkout ?? "") ?? "",
    [checkout]
  );

  const handleCopy = async (
    content: string,
    target: "url" | "head" | "body"
  ) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTarget(target);
      window.setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      setCopiedTarget(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-small">
      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          URL de postback
        </p>
        <p className="mt-small text-content text-text-main">
          Cadastre a URL abaixo no checkout para que a Oracclum receba os
          eventos finais da campanha.
        </p>
      </div>

      <div className="rounded-extra-large border border-border-highlight/40 bg-bg-card p-medium">
        <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="break-words rounded-large border border-border-highlight/40 bg-bg-app p-small font-mono text-small text-text-main">
              {postbackUrl}
            </p>
          </div>

          <div className="flex flex-col items-start gap-extra-small">
            <Button
              type="confirm"
              size="small"
              onClickAction={() => void handleCopy(postbackUrl, "url")}
            >
              Copiar
            </Button>
            {copiedTarget === "url" ? (
              <p className="text-extra-small text-text-secondary">
                URL copiada.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Scripts adicionais
        </p>
        <p className="mt-small text-content text-text-main">
          Caso seu funil permita o uso de scripts adicionais, voce pode colocar
          os codigos abaixo conforme indicado.
        </p>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <div className="flex flex-col gap-small">
          <div className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
            <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Adicionar no head da pagina
                </p>
                <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
                  <code>{GTM_HEAD_SCRIPT}</code>
                </pre>
              </div>

              <div className="flex flex-col items-start gap-extra-small">
                <Button
                  type="confirm"
                  size="small"
                  onClickAction={() => void handleCopy(GTM_HEAD_SCRIPT, "head")}
                >
                  Copiar
                </Button>
                {copiedTarget === "head" ? (
                  <p className="text-extra-small text-text-secondary">
                    Script do head copiado.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
            <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Adicionar no body da pagina
                </p>
                <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
                  <code>{GTM_BODY_SCRIPT}</code>
                </pre>
              </div>

              <div className="flex flex-col items-start gap-extra-small">
                <Button
                  type="confirm"
                  size="small"
                  onClickAction={() => void handleCopy(GTM_BODY_SCRIPT, "body")}
                >
                  Copiar
                </Button>
                {copiedTarget === "body" ? (
                  <p className="text-extra-small text-text-secondary">
                    Script do body copiado.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutStep;
