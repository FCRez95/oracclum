"use client";

import { Button } from "@/components/Button/buttonComponent";
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { saveMetaToken, removeMetaToken, getMetaData, fetchMetaAdAccounts, consumeMetaOauthToken } from "../integrationActions";

type AdAccount = { id: string; account_id: string; name: string };

export default function MetaIntegration() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [oauthError, setOauthError] = useState<string | null>(null);
    const [oauthSuccess, setOauthSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [fadingOut, setFadingOut] = useState(false);

    // Account selection state
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [savingAccount, setSavingAccount] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    const handleTokenReceived = useCallback(async (token: string) => {
        setPendingToken(token);
        setLoadingAccounts(true);
        setLoading(false);

        try {
            const result = await fetchMetaAdAccounts(token);
            if (result.success && result.adAccounts.length > 0) {
                setAdAccounts(result.adAccounts);
                setSelectedAccountId(result.adAccounts[0].account_id);
            } else {
                setOauthError(result.message || "Nenhuma conta de anúncio encontrada.");
                setPendingToken(null);
            }
        } catch (err) {
            setOauthError("Erro ao buscar contas de anúncio.");
            setPendingToken(null);
            console.error("Error fetching ad accounts:", err);
        } finally {
            setLoadingAccounts(false);
        }
    }, []);

    // Handle OAuth callback params
    useEffect(() => {
        const success = searchParams.get('meta_success');
        const error = searchParams.get('meta_error');
        const errorDescription = searchParams.get('meta_error_description');

        if (success === 'true') {
            (async () => {
                const result = await consumeMetaOauthToken();
                if (result.success && result.token) {
                    await handleTokenReceived(result.token);
                } else {
                    setOauthError(result.message || "Token de autorizacao nao encontrado.");
                    setLoading(false);
                }
                router.replace('/main/integration?tab=meta');
            })();
        } else if (error) {
            setOauthError(errorDescription || error);
            setLoading(false);
            router.replace('/main/integration?tab=meta');
        }
    }, [searchParams, router, handleTokenReceived]);

    async function handleSaveAccount() {
        if (!pendingToken || !selectedAccountId) return;

        const account = adAccounts.find(a => a.account_id === selectedAccountId);
        if (!account) return;

        setSavingAccount(true);
        setOauthError(null);

        try {
            const result = await saveMetaToken(pendingToken, [
                { account_id: account.account_id, name: account.name },
            ]);
            if (result.success) {
                setOauthSuccess(result.message || "Dados do Meta salvos com sucesso!");
                setIsConnected(true);
                setPendingToken(null);
                setAdAccounts([]);
                setTimeout(() => {
                    setFadingOut(true);
                    setTimeout(() => {
                        setOauthSuccess(null);
                        setFadingOut(false);
                    }, 500);
                }, 4000);
            } else {
                setOauthError(result.message || "Erro ao salvar dados.");
            }
        } catch (err) {
            setOauthError("Erro ao salvar dados do Meta.");
            console.error("Error saving account:", err);
        } finally {
            setSavingAccount(false);
        }
    }

    async function handleConnectFacebook() {
        setIsConnecting(true);
        setOauthError(null);

        try {
            const response = await fetch('/api/meta/oauth/login');
            const data = await response.json();

            if (data.authUrl) {
                window.location.href = data.authUrl;
            } else {
                setOauthError(data.error || 'Erro ao iniciar conexão');
                setIsConnecting(false);
            }
        } catch (error) {
            setOauthError('Erro ao conectar com Facebook');
            setIsConnecting(false);
            console.error('Connection error:', error);
        }
    }

    async function handleDisconnect() {
        setDisconnecting(true);
        setOauthError(null);
        try {
            const result = await removeMetaToken();
            if (result.success) {
                setIsConnected(false);
                setOauthSuccess(null);
                setOauthError(null);
            } else {
                setOauthError(result.message || 'Erro ao desconectar');
            }
        } catch (error) {
            setOauthError('Erro ao desconectar');
            console.error('Disconnect error:', error);
        } finally {
            setDisconnecting(false);
        }
    }

    // Load existing meta data on mount (skip if OAuth callback will handle it)
    useEffect(() => {
        const hasOAuthParams = searchParams.get('meta_success') || searchParams.get('meta_error');
        if (hasOAuthParams) return;
        (async () => {
            try {
                const data = await getMetaData();
                if (data.success && data.metaData?.metaAdsToken) {
                    setIsConnected(true);
                }
            } catch (err) {
                console.error('Error loading meta data:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [searchParams]);

    if (loading) {
        return <p className="mb-medium">Carregando informações...</p>;
    }

    return (
        <div className="flex flex-col pb-medium gap-default">
            {oauthSuccess && (
                <div className={`px-small py-extra-small border border-text-success rounded-small transition-opacity duration-500 ${fadingOut ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-text-success">{oauthSuccess}</p>
                </div>
            )}

            {oauthError && (
                <div className="px-small py-extra-small border border-text-error rounded-small">
                    <p className="text-text-error">Erro: {oauthError}</p>
                </div>
            )}

            <div className="flex flex-col gap-medium">
                {/* State: token generated, picking account */}
                {pendingToken && !isConnected && (
                    <>
                        <div className="px-small py-extra-small border border-text-success rounded-small">
                            <p className="text-text-success">Token gerado</p>
                        </div>

                        {loadingAccounts ? (
                            <p>Buscando contas de anúncio...</p>
                        ) : adAccounts.length > 0 ? (
                            <div className="flex flex-col gap-small">
                                <label htmlFor="adAccountSelect">Selecione a conta de anúncio</label>
                                <select
                                    id="adAccountSelect"
                                    value={selectedAccountId}
                                    onChange={(e) => setSelectedAccountId(e.target.value)}
                                    className="bg-bg-primary border border-bg-tertiary rounded-small px-small py-extra-small text-content"
                                >
                                    {adAccounts.map((acc) => (
                                        <option key={acc.account_id} value={acc.account_id}>
                                            {acc.name} ({acc.account_id})
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    onClickAction={handleSaveAccount}
                                    type="confirm"
                                    size="small"
                                    disabled={savingAccount || !selectedAccountId}
                                >
                                    {savingAccount ? "Salvando..." : "Salvar"}
                                </Button>
                            </div>
                        ) : null}
                    </>
                )}

                {/* State: disconnected */}
                {!pendingToken && !isConnected && (
                    <>
                        <p>Conecte sua conta do Facebook para acessar dados do Meta Ads</p>
                        <Button
                            onClickAction={handleConnectFacebook}
                            type="confirm"
                            size="small"
                            disabled={isConnecting}
                        >
                            {isConnecting ? "Conectando..." : "Conectar com Facebook"}
                        </Button>
                    </>
                )}

                {/* State: connected */}
                {isConnected && (
                    <>
                        <p className="text-text-success">Conta do Facebook conectada</p>
                        <Button
                            onClickAction={handleDisconnect}
                            type="cancel"
                            size="small"
                            disabled={disconnecting}
                        >
                            {disconnecting ? "Desconectando..." : "Desconectar"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
