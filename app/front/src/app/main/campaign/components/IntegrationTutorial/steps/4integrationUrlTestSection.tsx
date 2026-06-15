"use client";
import React from "react";
import { Button } from "@/components/Button/buttonComponent";
import { ClickStepsModel } from "@/models/click/click-steps";
import { loadClickByClickID } from "@/app/(DataAccessLayer)/(appServices)/calls/loadClickByClickID/callLoadClickByClickID";
import { CampaignOptimizationModel } from "@/models/campaign-optimization";

const POLL_INTERVAL_MS = 6000;
const STEP_SEQUENCE = [
    { key: "id_click", label: "Passo 1" },
    { key: "step_1", label: "Passo 2" },
    { key: "step_2", label: "Passo 3" },
    { key: "step_3", label: "Passo 4" },
    { key: "checkout", label: "Checkout" }
] as const;

interface Props {
    campaign: CampaignOptimizationModel;
}

export const IntegrationTestSection = ({ campaign }: Props) => {
    const [testUrl, setTestUrl] = React.useState<string>("");
    const [generatedClickId, setGeneratedClickId] = React.useState<string>("");
    const [campaignClick, setCampaignClick] = React.useState<ClickStepsModel | null>({
        id_click: "",
        id_campaign: campaign.id,
        step_1: 0,
        step_2: 0,
        step_3: 0,
        checkout: 0
    });
    const [lastUpdatedAt, setLastUpdatedAt] = React.useState<string>("");
    const [isPolling, setIsPolling] = React.useState(false);
    const [pollError, setPollError] = React.useState<string | null>(null);

    const updateClickData = React.useCallback(async (id_click: string) => {
        if (!id_click) return;

        try {
            const data = await loadClickByClickID(id_click, campaign.id, document.cookie);
            setCampaignClick(data);
            setLastUpdatedAt(new Date().toLocaleTimeString());
            setPollError(null);
        } catch (error) {
            console.error("Failed to load click data:", error);
            setLastUpdatedAt(new Date().toLocaleTimeString());
            setPollError(
                error instanceof Error
                    ? error.message
                    : "Nao foi possivel atualizar o click de teste."
            );
        }
    }, [campaign.id]);

    React.useEffect(() => {
        const clickId = generatedClickId;

        if (!clickId) {
            setIsPolling(false);
            return;
        }

        let cancelled = false;
        setIsPolling(true);

        const poll = () => {
            if (cancelled) return;
            void updateClickData(clickId);
        };

        poll();
        const intervalId = window.setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            setIsPolling(false);
            window.clearInterval(intervalId);
        };
    }, [generatedClickId, updateClickData]);

    const makeRandomString = (length: number, pool: string): string => {
        let result = '';
        const charactersLength = pool.length;
        let counter = 0;
        while (counter < length) {
            result += pool.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    const generateClickID = () => {
        const letters = 'abcdefghijklmABCDEFGHIJKLM';
        const numbers = '0123456789';

        const time = new Date().getTime()
        const result = "test" + makeRandomString(10, letters) + '-' + makeRandomString(8, numbers) + time
        setGeneratedClickId(result);
        setCampaignClick({
            id_click: "",
            id_campaign: campaign.id,
            step_1: 0,
            step_2: 0,
            step_3: 0,
            checkout: 0
        });
        setLastUpdatedAt("");
        setPollError(null);
        return result;
    }
    const generateUrl = () => {
        const numbers = '0123456789';
        if (testUrl) return;
        if (!campaign.link || !campaign.click_auth) {
            setPollError("A campanha precisa ter link e click_auth para gerar a URL de teste.");
            return;
        }

        try {
            const clickId = generateClickID();
            const url = new URL(campaign.link, window.location.origin);
            url.searchParams.set("utm_campaign", campaign.click_auth);
            url.searchParams.set("campaign_id", campaign.external_id || String(campaign.id));
            url.searchParams.set("ad_id", makeRandomString(10, numbers));
            url.searchParams.set("site_id", makeRandomString(7, numbers));
            url.searchParams.set("utm_source", clickId);
            setTestUrl(url.toString());
        } catch (error) {
            console.error("Failed to generate test URL:", error);
            setPollError("Nao foi possivel montar a URL de teste desta campanha.");
        }
    };

    const completedSteps = STEP_SEQUENCE.reduce((acc, step) => {
        const value = campaignClick?.[step.key as keyof ClickStepsModel];
        return acc + (value ? 1 : 0);
    }, 0);
    const progressPercentage = Math.round((completedSteps / STEP_SEQUENCE.length) * 100);

    return (
        <div className="flex flex-col gap-small w-full h-full">
            <div className="rounded-extra-large border border-border-muted bg-bg-card p-medium">
                <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">
                    Validacao da integracao
                </p>
                <p className="mt-small text-content text-text-main">
                    Gere uma URL de teste, percorra o funil e acompanhe abaixo se cada etapa esta chegando corretamente.
                </p>
            </div>

            <div className="rounded-extra-large border border-border-highlight/40 bg-bg-card p-medium">
                <div className="flex flex-col gap-small lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col gap-small min-w-0 flex-1">
                        <Button
                            type={testUrl ? "cancel" : "confirm"}
                            size="medium"
                            onClickAction={generateUrl}
                            disabled={!!testUrl}
                        >
                            {testUrl ? "URL Gerada" : "Gerar url de teste"}
                        </Button>

                        <a
                            href={testUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`break-all rounded-large border p-small text-small ${testUrl ? "border-border-highlight/40 bg-bg-app text-text-primary hover:underline" : "pointer-events-none border-border-muted bg-bg-app text-text-alt-primary"}`}
                        >
                            {testUrl || "Nenhuma url gerada ainda"}
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-small rounded-extra-large border border-border-muted bg-bg-card p-medium">
                <div className="flex flex-wrap items-center justify-between gap-small text-extra-small text-text-alt-primary">
                    <span>Status do funil de teste</span>
                    <span className="flex items-center gap-small">
                        <span className={`rounded-full px-small py-extra-small ${isPolling ? "bg-bg-primary/65 text-text-main" : "bg-bg-card text-text-alt-primary"}`}>
                            {isPolling ? "Atualizando" : "Em espera"}
                        </span>
                        <span>
                            Última atualização: {lastUpdatedAt || "--"}
                        </span>
                    </span>
                </div>
                {pollError ? (
                    <div className="rounded-large border border-border-error bg-bg-cancel/10 p-small text-small text-text-error">
                        {pollError}
                    </div>
                ) : null}
                <div className="h-1 w-full rounded-full bg-bg-card">
                    <div
                        className="h-full rounded-full bg-bg-primary transition-all"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
                <div className="grid grid-cols-2 gap-small">
                    {STEP_SEQUENCE.map(step => {
                        const value = campaignClick?.[step.key as keyof ClickStepsModel];
                        const completed = Boolean(value);
                        return (
                            <div
                                key={step.key}
                                className={`flex items-center justify-between rounded-large border px-small py-small text-extra-small transition-colors ${completed ? "border-bg-primary/60 bg-bg-primary/5 text-text-alt-main" : "border-border-default/20 text-text-alt-primary"}`}
                            >
                                <span>{step.label}</span>
                                <span className={`rounded-full px-small py-extra-small ${completed ? "bg-bg-primary/40" : "bg-bg-card"}`}>
                                    {completed ? value===1 ? "page init" : "page view": "--"}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-end">
                    <Button
                        type={generatedClickId ? "confirm" : "cancel"}
                        size="small"
                        disabled={!generatedClickId}
                        onClickAction={() => generatedClickId && updateClickData(generatedClickId)}
                    >
                        Atualizar agora
                    </Button>
                </div>
            </div>
        </div>
    )
};
export default IntegrationTestSection;
