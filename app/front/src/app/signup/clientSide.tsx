"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction } from "./signupActions";
import { maskPhone } from "@/helper/dataMasks";

type SignupState = {
  success: boolean;
  errors?: Record<string, string[]>;
  status?: number;
};

const initialState: SignupState = {
  success: false,
  errors: {},
};

const ClientSignupPage = () => {
  const [state, formAction, pending] = useActionState(
    signupAction as (
      state: SignupState,
      formData: FormData
    ) => Promise<SignupState>,
    initialState
  );
  const router = useRouter();
  const isRedirecting = Boolean(state?.success);

  useEffect(() => {
    if (state?.success) {
      router.push("/login");
    }

    if (state?.errors && Object.keys(state.errors).length > 0) {
      console.error("Erros de cadastro:", state.errors);
    }
  }, [state, router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value;
    const phone = maskPhone(value);
    e.target.value = phone;
  };

  /* const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 11) {
      e.target.value = maskCpf(digits);
    } else {
      e.target.value = maskCnpj(digits);
    }
  }; */

  return (
    <form
      action={formAction}
      className="relative z-[1] flex w-full flex-col gap-7 px-medium py-large md:px-large"
    >
      <div className="mx-auto max-w-[34rem] text-center font-content text-content font-medium leading-7 text-[rgba(232,230,226,0.94)]">
        Cadastre-se para usar a API real ou acesse o modo demo pela tela de login.
      </div>

      {(state.status === 409 || state.status === 500) && (
        <div className="mx-auto w-full max-w-[34rem] rounded-2xl border border-border-error bg-bg-cancel/10 px-medium py-small text-center text-small text-text-error">
          {state.status === 409
            ? "Email ja cadastrado"
            : "Erro interno do servidor. Tente novamente mais tarde."}
        </div>
      )}

      <div className="grid w-full gap-medium md:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-[0.04em] text-[rgba(232,230,226,0.72)]"
          >
            Email:
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-2xl border border-[rgba(195,209,224,0.12)] bg-[rgba(8,16,24,0.56)] px-small py-small font-content text-base text-[rgba(232,230,226,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_20px_rgba(0,0,0,0.14)] transition duration-200 placeholder:text-[rgba(232,230,226,0.36)] focus:-translate-y-px focus:border-[rgba(94,200,153,0.95)] focus:bg-[rgba(8,16,24,0.8)] focus:outline-none focus:ring-4 focus:ring-[rgba(94,200,153,0.18)]"
          />
          {state.errors?.email && (
            <span className="text-small text-text-error">{state.errors.email[0]}</span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="phone"
            className="text-xs font-semibold uppercase tracking-[0.04em] text-[rgba(232,230,226,0.72)]"
          >
            Celular:
          </label>
          <input
            id="phone"
            type="text"
            name="phone"
            required
            inputMode="numeric"
            autoComplete="tel"
            onChange={handlePhoneChange}
            maxLength={15}
            className="rounded-2xl border border-[rgba(195,209,224,0.12)] bg-[rgba(8,16,24,0.56)] px-small py-small font-content text-base text-[rgba(232,230,226,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_20px_rgba(0,0,0,0.14)] transition duration-200 placeholder:text-[rgba(232,230,226,0.36)] focus:-translate-y-px focus:border-[rgba(94,200,153,0.95)] focus:bg-[rgba(8,16,24,0.8)] focus:outline-none focus:ring-4 focus:ring-[rgba(94,200,153,0.18)]"
          />
          {state.errors?.phone && (
            <span className="text-small text-text-error">{state.errors.phone[0]}</span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-[0.04em] text-[rgba(232,230,226,0.72)]"
          >
            Senha:
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
            className="rounded-2xl border border-[rgba(195,209,224,0.12)] bg-[rgba(8,16,24,0.56)] px-small py-small font-content text-base text-[rgba(232,230,226,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_20px_rgba(0,0,0,0.14)] transition duration-200 placeholder:text-[rgba(232,230,226,0.36)] focus:-translate-y-px focus:border-[rgba(94,200,153,0.95)] focus:bg-[rgba(8,16,24,0.8)] focus:outline-none focus:ring-4 focus:ring-[rgba(94,200,153,0.18)]"
          />
          {state.errors?.password && (
            <span className="text-small text-text-error">{state.errors.password[0]}</span>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="passwordConfirmation"
            className="text-xs font-semibold uppercase tracking-[0.04em] text-[rgba(232,230,226,0.72)]"
          >
            Confirmar Senha:
          </label>
          <input
            id="passwordConfirmation"
            type="password"
            name="passwordConfirmation"
            required
            autoComplete="new-password"
            className="rounded-2xl border border-[rgba(195,209,224,0.12)] bg-[rgba(8,16,24,0.56)] px-small py-small font-content text-base text-[rgba(232,230,226,0.94)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_20px_rgba(0,0,0,0.14)] transition duration-200 placeholder:text-[rgba(232,230,226,0.36)] focus:-translate-y-px focus:border-[rgba(94,200,153,0.95)] focus:bg-[rgba(8,16,24,0.8)] focus:outline-none focus:ring-4 focus:ring-[rgba(94,200,153,0.18)]"
          />
          {state.errors?.passwordConfirmation && (
            <span className="text-small text-text-error">
              {state.errors.passwordConfirmation[0]}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending || isRedirecting}
        className={`mx-auto inline-flex min-w-[13rem] items-center justify-center rounded-2xl bg-bg-primary px-8 py-small font-content text-base font-semibold text-text-on-primary shadow-[0_18px_30px_rgba(94,200,153,0.22)] transition duration-200 ${
          pending || isRedirecting
            ? "cursor-not-allowed opacity-70"
            : "hover:-translate-y-px hover:bg-[#74d5a5] hover:text-text-main hover:shadow-[0_22px_34px_rgba(94,200,153,0.2)]"
        }`}
      >
        {pending || isRedirecting ? (
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 animate-spin text-text-on-primary"
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
            Cadastrando...
          </div>
        ) : (
          "Cadastrar"
        )}
      </button>

      <Link
        href="/login"
        className="self-center text-center text-sm text-[rgba(232,230,226,0.62)] transition hover:text-bg-primary"
      >
        Ja tem uma conta? Entrar
      </Link>
    </form>
  );
};

export default ClientSignupPage;
