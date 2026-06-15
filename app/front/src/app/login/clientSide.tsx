"use client";
import { useEffect } from "react";

import FormComponent from "@/components/Forms/FormComponent";
import InputComponent from "@/components/Forms/InputComponent";
import { demoLoginAction, loginAction } from "@/app/login/loginActions";
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

  const router = useRouter();
  const isRedirecting = Boolean(state?.success || demoState?.success);

  useEffect(() => {
    if (state?.success || demoState?.success) {
      router.push("/main/campaign");
    }

    if (state?.errors && Object.keys(state.errors).length > 0) {
      console.error("Erros de login:", state.errors);
    }
  }, [state, demoState, router]);

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
          disabled={pending || demoPending || isRedirecting}
          className={`bg-bg-primary text-text-on-primary mx-auto px-large p-small rounded-large transition duration-300 ease-in-out
            ${
              pending || demoPending || isRedirecting
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

      <form action={demoFormAction} className="mt-small flex justify-center">
        <button
          type="submit"
          disabled={pending || demoPending || isRedirecting}
          className={`text-text-main border border-border-muted bg-bg-card px-large py-small rounded-large transition duration-300 ease-in-out
            ${
              pending || demoPending || isRedirecting
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
            "Entrar em modo demo"
          )}
        </button>
      </form>

      {demoState.errors?.form && (
        <span className="mt-extra-small block text-center text-sm text-text-error">
          {demoState.errors.form[0]}
        </span>
      )}
    </>
  );
};

export default ClientLoginPage;
