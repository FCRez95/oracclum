"use client";

import { Button } from "@/components/Button/buttonComponent";
import FormComponent from "@/components/Forms/FormComponent";
import InputComponent from "@/components/Forms/InputComponent";
import { useActionState, useEffect, useState } from 'react';
import { changeTaboolaData, getAccountSession } from "../integrationActions";

interface TaboolaInfoProps {
    access_token: string;
    account_id: string;
    client_id: string;
    client_secret: string;
}

export type ChangeTaboolaState = {
    success: boolean;
    message?: string;
};

const initialState: ChangeTaboolaState = {
    success: false,
    message: "",
};

export default function TaboolaIntegration() {
    const [taboolaData, setTaboolaData] = useState<TaboolaInfoProps>({
        access_token: "",
        account_id: "",
        client_id: "",
        client_secret: "",
    });
    const [alreadySent, setAlreadySent] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [dismissedState, setDismissedState] =
        useState<ChangeTaboolaState | null>(null);

    const [state, formAction, pending] = useActionState(
        changeTaboolaData,
        initialState
    );

    useEffect(() => {
        (async () => {
            const data = await getAccountSession();
            if (data.success && data.session?.taboolaData) {
                setTaboolaData(JSON.parse(data.session?.taboolaData));

                const hasValidData = Object.values(data.session?.taboolaData).some(
                    (value) => value !== null && value !== undefined && value !== ""
                );

                setAlreadySent(hasValidData);
                setIsEditing(!hasValidData);
            } else {
                setIsEditing(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (state.message && state.success) {
            setIsEditing(false);
            setAlreadySent(true);
        }
    }, [state.message, state.success]);

    function handleEditData() {
        setIsEditing(true);
        setDismissedState(state);
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setDismissedState(state);
    }

    const visibleMessage = dismissedState === state ? "" : state.message;

    if (!taboolaData) {
        return <p className="text-small md:text-content mb-medium">Carregando informações...</p>;
    }

    return (
        <div className="flex flex-col pb-medium gap-default">
            {visibleMessage && state.success && (
                <p
                    className={`text-subtitle mt-small ${state.success ? "text-text-success" : "text-text-error"
                        }`}
                >
                    {visibleMessage}
                </p>
            )}

            {isEditing ? (
                <FormComponent type="default" action={(formData) => {
                    setDismissedState(state);
                    return formAction(formData);
                }}>
                    <div className="flex mr-auto flex-col gap-extra-small w-fit">
                        <label htmlFor="clientId">Client ID</label>
                        <InputComponent id="clientId" type="text" name="clientId" placeholder="Fornecido pelo Taboola" required />
                        <label htmlFor="clientSecret">Client Secret</label>
                        <InputComponent id="clientSecret" type="text" name="clientSecret" placeholder="Fornecido pelo Taboola" required />
                        <label htmlFor="accountId">Account ID</label>
                        <InputComponent id="accountId" type="text" name="accountId" placeholder="Fornecido pelo Taboola" required />
                        {visibleMessage && (
                            <p
                                className={`text-subtitle ${state.success ? "text-text-success" : "text-text-error"
                                    }`}
                            >
                                {visibleMessage}
                            </p>
                        )}
                        <div className={`flex gap-small mt-small ${alreadySent ? "justify-between" : "justify-center"}`}>
                            {alreadySent && (
                                <Button onClickAction={handleCancelEdit} type="cancel" size="small">
                                    Cancelar
                                </Button>
                            )}
                            <Button onClickAction={() => { }} type="confirm" size="small" htmlType='submit'>
                                {pending ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </div>
                </FormComponent>
            ) : (
                <div className="flex flex-col gap-medium">

                    <p>Dados já enviados!</p>

                    <Button onClickAction={handleEditData} type="confirm" size="small">
                        Alterar
                    </Button>
                </div>
            )}
        </div>
    );
};
