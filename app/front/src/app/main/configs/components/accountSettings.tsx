"use client";

import { useActionState, useEffect, useState } from 'react';
import FormComponent from "@/components/Forms/FormComponent";
import { changePasswordAction, getAccountSession, getEnrichedUserData } from "../accountActions";
import { Button } from "@/components/Button/buttonComponent";
import InputComponent from '@/components/Forms/InputComponent';
import { getMaxClicks } from '@/constants/planLimits';
import { Loader } from 'lucide-react';

export type ChangePasswordState = {
  success: boolean;
  message?: string;
};

type AccountUser = {
  name?: string;
  email?: string;
  user_type?: string;
  cpfcnpj?: string;
  phone?: string;
};

type EnrichedUserData = {
  total_clicks?: number;
  total_revenue?: number;
  total_sales?: number;
};

const initialState: ChangePasswordState = {
  success: false,
  message: "",
};

function parseAccountUser(userData: unknown): AccountUser | null {
  if (!userData) return null;

  if (typeof userData === "string") {
    try {
      return JSON.parse(userData) as AccountUser;
    } catch {
      return null;
    }
  }

  return userData as AccountUser;
}

export default function AccountSettings() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [enrichedData, setEnrichedData] = useState<EnrichedUserData | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [dismissedState, setDismissedState] =
    useState<ChangePasswordState | null>(null);

  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState
  );

  useEffect(() => {
    (async () => {
      const result = await getAccountSession();
      if (result.success) setUser(parseAccountUser(result.session?.userData));

      const enriched = await getEnrichedUserData();
      if (enriched.success) setEnrichedData(enriched.data as EnrichedUserData | null);
    })();
  }, []);

  useEffect(() => {
    if (state.success) {
      setShowPasswordForm(false);
    }
  }, [state.success]);

  function handlePassword() {
    setShowPasswordForm((prev) => !prev);
    setDismissedState(state);
  }

  const visibleMessage = dismissedState === state ? "" : state.message;

  return (
    <div className="flex flex-col gap-default">
      {!user && <p>Carregando informações...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-small">
        <div className="rounded-lg border border-border bg-card p-small flex flex-col items-center justify-center">
          <p className="text-subtitle text-text-secondary">Total de Clicks</p>
          {enrichedData ? (
            <p className="font-semibold text-text-secondary">
              {enrichedData.total_clicks?.toLocaleString('pt-BR') ?? '0'}/{getMaxClicks(user?.user_type ?? "")?.toLocaleString('pt-BR') ?? '—'}
            </p>
          ) : (
            <Loader className="animate-spin text-text-secondary flex-shrink-0" size={20} />
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-small flex flex-col items-center justify-center">
          <p className="text-subtitle text-text-secondary">Receita Total</p>
          {enrichedData ? (
            <p className="font-semibold text-text-secondary">
              {enrichedData.total_revenue != null
                ? enrichedData.total_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '—'}
            </p>
          ) : (
            <Loader className="animate-spin text-text-secondary flex-shrink-0" size={20} />
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-small flex flex-col items-center justify-center">
          <p className="text-subtitle text-text-secondary">Total de Vendas</p>
          {enrichedData ? (
            <p className="font-semibold text-text-secondary">{enrichedData.total_sales?.toLocaleString('pt-BR') ?? '—'}</p>
          ) : (
            <Loader className="animate-spin text-text-secondary flex-shrink-0" size={20} />
          )}
        </div>
      </div>

      {user &&
        <div className="flex flex-col items-start md:items-center tablet:items-start gap-extra-small">
          <p>Nome: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Tipo: {user.user_type}</p>
          <p>CPF/CNPJ: {user.cpfcnpj}</p>
          <p>Telefone: {user.phone}</p>
        </div>
      }

      {!showPasswordForm && visibleMessage && (
        <p
          className={`text-subtitle mt-small ${state.success ? "text-text-success" : "text-text-error"
            }`}
        >
          {visibleMessage}
        </p>
      )}

      {showPasswordForm ? (
        <FormComponent type="default" action={formAction}>
          <div className="flex mr-auto flex-col gap-extra-small mb-small">
            <label htmlFor="currentPassword">Senha atual</label>
            <InputComponent type="password" name="currentPassword" placeholder="Senha atual" required />
            <label htmlFor="newPassword">Nova senha</label>
            <InputComponent type="password" name="newPassword" placeholder="Nova senha" required />
            <label htmlFor="confirmNewPassword">Confirmar nova senha</label>
            <InputComponent type="password" name="confirmNewPassword" placeholder="Confirmar nova senha" required />
            {visibleMessage && (
              <p
                className={`text-subtitle ${state.success ? "text-text-success" : "text-text-error"
                  }`}
              >
                {visibleMessage}
              </p>
            )}
          </div>
          <div className='flex gap-medium'>
            <Button onClickAction={handlePassword} type="cancel" size="small">
              Cancelar
            </Button>
            <Button onClickAction={() => { }} type="confirm" size="small" htmlType='submit'>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </FormComponent>
      ) : (
        <div className='flex justify-center items-center tablet:justify-start'>
          <Button onClickAction={handlePassword} type="confirm" size="small">
            Alterar senha
          </Button>
        </div>
      )}
    </div>
  );
}
