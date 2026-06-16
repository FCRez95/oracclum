"use client";
import { useEffect } from "react";

import FormComponent from "@/components/Forms/FormComponent";
import InputComponent from "@/components/Forms/InputComponent";
import {
  backendDemoLoginAction,
  demoLoginAction,
  loginAction,
} from "@/app/login/loginActions";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

type LoginState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
  status?: number;
};

const initialState: LoginState = {
  success: false,
  errors: {},
  message: "",
};

const ClientLoginPage = () => {
  const [state, formAction, pending] = useActionState(
    loginAction as (
      state: LoginState,
      formData: FormData
    ) => Promise<LoginState>,
    initialState
  );
  const [demoState, demoFormAction, demoPending] = useActionState(
    demoLoginAction as (state: LoginState) => Promise<LoginState>,
    initialState
  );
  const [backendDemoState, backendDemoFormAction, backendDemoPending] = useActionState(
    backendDemoLoginAction as (state: LoginState) => Promise<LoginState>,
    initialState
  );

  const router = useRouter();
  const isRedirecting = Boolean(state?.success || demoState?.success || backendDemoState?.success);

  useEffect(() => {
    if (state?.success || demoState?.success || backendDemoState?.success) {
      router.push("/main/campaign");
    }
  }, [state, demoState, backendDemoState, router]);

  const isBusy = pending || demoPending || backendDemoPending || isRedirecting;

  return (
    <>
      <FormComponent action={formAction} type="login">
        <div className="flex flex-col gap-extra-small">
          {(state.status === 400 || state.status === 401) && (
            <span className="text-text-error text-sm">
              Usuário ou senha incorretos
            </span>
          )}
          {state.status === 500 && (
            <span className="text-text-error text-sm">
              Erro interno do servidor. Tente novamente mais tarde.
            </span>
          )}

          <label htmlFor="login">Email:</label>
          <InputComponent
            id="email"
            type="email"
            name="email"
            classType="default"
            required
          />
          {state.errors?.email && (
            <span className="text-text-error text-sm">{state.errors.email[0]}</span>
          )}
        </div>

        <div className="flex flex-col gap-extra-small">
          <label htmlFor="password">Senha:</label>
          <InputComponent
            type="password"
            id="password"
            name="password"
            classType="default"
            required
          />
          {state.errors?.password && (
            <span className="text-text-error text-sm">Senha inválida</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className={`bg-bg-primary text-text-on-primary mx-auto px-large p-small rounded-large transition duration-300 ease-in-out
            ${
              isBusy
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-bg-primary-hover hover:cursor-pointer"
            }`}
        >
          {pending || isRedirecting ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-text-on-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Entrando...
            </div>
          ) : (
            "Entrar"
          )}
        </button>

        {state.errors?.form && (
          <span className="text-text-error text-sm max-w-[200px] text-center mx-auto">{state.errors.form[0]}</span>
        )}
      </FormComponent>

      <div className="mt-small flex flex-wrap justify-center gap-small">
      <form action={demoFormAction}>
        <button
          type="submit"
          disabled={isBusy}
          className={`text-text-main border border-border-muted bg-bg-card px-large py-small rounded-large transition duration-300 ease-in-out
            ${
              isBusy
                ? "opacity-70 cursor-not-allowed"
                : "hover:border-border-highlight hover:bg-bg-app hover:cursor-pointer"
            }`}
        >
          {demoPending || (isRedirecting && demoState?.success) ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-text-main"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Abrindo demo...
            </span>
          ) : (
            "Demo frontend"
          )}
        </button>
      </form>
      <form action={backendDemoFormAction}>
        <button
          type="submit"
          disabled={isBusy}
          className={`text-text-main border border-border-muted bg-bg-card px-large py-small rounded-large transition duration-300 ease-in-out
            ${
              isBusy
                ? "opacity-70 cursor-not-allowed"
                : "hover:border-border-highlight hover:bg-bg-app hover:cursor-pointer"
            }`}
        >
          {backendDemoPending || (isRedirecting && backendDemoState?.success) ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-text-main"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Abrindo demo...
            </span>
          ) : (
            "Demo com backend"
          )}
        </button>
      </form>
      </div>

      {(demoState.errors?.form || backendDemoState.errors?.form) && (
        <span className="mt-extra-small block text-center text-sm text-text-error">
          {demoState.errors?.form?.[0] || backendDemoState.errors?.form?.[0]}
        </span>
      )}
    </>
  );
};

export default ClientLoginPage;
