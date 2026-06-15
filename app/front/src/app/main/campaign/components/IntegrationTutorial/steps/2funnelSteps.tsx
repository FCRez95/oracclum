"use client";

import { useState } from "react";
import { Button } from "@/components/Button/buttonComponent";
import { FunnelStep } from "./2funnelStepsData";

export const SelectFunnelStep = ({
  funnelSteps,
  funnelStepHandler,
}: {
  funnelSteps: FunnelStep[];
  funnelStepHandler: (key: number) => void;
}) => {
  const [copiedTarget, setCopiedTarget] = useState<"head" | "body" | null>(
    null
  );
  const selectedStep = funnelSteps.find((step) => step.selected);
  const headerCode = `
  <head> <!-- Header Code --> </head>
  `;
  const bodyCode = `
  <body> <!-- Body Code --> </body>
  `;

  const handleCopy = async (
    content: string,
    target: "head" | "body"
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
      <div className="rounded-extra-large border border-border-muted bg-bg-card p-small">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Etapas do funil
        </p>
        <div className="mt-small grid grid-cols-2 gap-small md:grid-cols-4">
          {funnelSteps.map((step) => (
            <Button
              key={step.key}
              onClickAction={() => funnelStepHandler(step.key)}
              type={step.selected ? "select" : "unselect"}
              size="small"
            >
              Etapa {step.key}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-extra-large border border-border-highlight/50 bg-bg-card p-medium">
        <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
          Scripts da etapa selecionada
        </p>
        <p className="mt-small text-content text-text-main">
          Copie e cole os codigos abaixo na pagina correspondente da etapa
          escolhida.
        </p>
      </div>

      <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
        <div className="flex flex-col gap-small">
          <div className="rounded-extra-large border border-border-highlight/40 bg-bg-app p-small">
            <div className="flex flex-col gap-small md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                  Script para o head
                </p>
                <p className="mt-extra-small text-small text-text-secondary">
                  Copie e cole o script o mais alto possivel dentro do header da
                  pagina {headerCode}
                </p>
                <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
                  <code>
                    {selectedStep
                      ? selectedStep.head
                      : "Selecione o passo do funil."}
                  </code>
                </pre>
              </div>

              <div className="flex flex-col items-start gap-extra-small">
                <Button
                  type="confirm"
                  size="small"
                  onClickAction={() =>
                    selectedStep
                      ? void handleCopy(selectedStep.head, "head")
                      : undefined
                  }
                  disabled={!selectedStep}
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
                  Script para o body
                </p>
                <p className="mt-extra-small text-small text-text-secondary">
                  Copie e cole o script o mais alto possivel dentro do body da
                  pagina {bodyCode}
                </p>
                <pre className="mt-small overflow-x-auto rounded-large border border-border-highlight/40 bg-bg-card/40 p-small font-mono text-extra-small text-text-main whitespace-pre-wrap">
                  <code>
                    {selectedStep
                      ? selectedStep.body
                      : "Selecione o passo do funil."}
                  </code>
                </pre>
              </div>

              <div className="flex flex-col items-start gap-extra-small">
                <Button
                  type="confirm"
                  size="small"
                  onClickAction={() =>
                    selectedStep
                      ? void handleCopy(selectedStep.body, "body")
                      : undefined
                  }
                  disabled={!selectedStep}
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

      <div className="grid gap-small lg:grid-cols-2">
        <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
            Orientacao importante
          </p>
          <p className="mt-small text-content text-text-main">
            Caso seu funil nao tenha todas as etapas, nao precisa copiar os
            proximos passos.
          </p>
        </div>

        <div className="rounded-extra-large border border-border-muted bg-bg-app p-medium">
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
            Teste do funil
          </p>
          <p className="mt-small text-content text-text-main">
            Gere uma URL de teste para validar se o funil esta capturando os
            dados corretamente e percorra as paginas usando os botoes de etapa
            para conferir os scripts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectFunnelStep;
