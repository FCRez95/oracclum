"use server";

import { validator } from "@/utils/validator/validator";
import { getSessionData } from "@/app/(DataAccessLayer)/(appServices)/calls/getSession/callGetSessionData";
import { ChangePassword } from "@/app/(DataAccessLayer)/(appServices)/calls/changePassword/callChangePassword";
import { ChangePasswordState } from "./components/accountSettings";
import { cookies, headers } from "next/headers";
import { verifySession } from "@/lib/session";
import { createSession } from "@/app/(DataAccessLayer)/(appServices)/calls/createSession/callCreateSession";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { loadEnrichedUserData } from "@/app/(DataAccessLayer)/(appServices)/calls/user/callLoadEnrichedUserData";
import { abortTimeout } from "@/app/(DataAccessLayer)/(routeHandlers)/api/abortTimeout";
import { ExternalURL } from "@/utils/apiRouter";
import { isFrontendMockDemoSession } from "@/demo/demoMode";
import { getDemoEnrichedUserData } from "@/demo/demoData";

export async function getAccountSession() {
  const session = await getSessionData();

  if (!session) {
    return { success: false, session: null };
  }

  return { success: true, session };
}

export async function getEnrichedUserData() {
  const session = await getSessionData();

  if (!session?.accessToken) {
    return { success: false, data: null };
  }

  if (isFrontendMockDemoSession(session)) {
    return { success: true, data: getDemoEnrichedUserData() };
  }

  const result = await loadEnrichedUserData(session.accessToken);

  if (!result.success) {
    return { success: false, data: null };
  }

  return { success: true, data: result.data };
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const result = await CallerWrapper(validator("changePassword", formData));
  if (!result.success) {
    const msg =
      Object.values(result.errors || {})[0]?.[0] ||
      "Erro de validação nos campos.";
    return { success: false, message: msg };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmNewPassword = formData.get("confirmNewPassword") as string;

  if (newPassword !== confirmNewPassword) {
    return { success: false, message: "As senhas não coincidem." };
  }

  const { success, session } = await getAccountSession();
  if (!success || !session?.accessToken)
    return { success: false, message: "Usuário não autenticado." };

  if (isFrontendMockDemoSession(session)) {
    return {
      success: true,
      message: "Senha alterada no modo demo.",
    };
  }

  const response = await ChangePassword(session.accessToken, currentPassword, newPassword);

  if (response.success) {
    return {
      success: true,
      message: "Senha alterada com sucesso!",
    };
  }

  return { success: false, message: response.message || "Erro ao alterar a senha." };
}

export async function acceptContractTermsAction() {
  const cookieStore = await cookies();
  const sessionEncrypted = cookieStore.get("session")?.value;

  if (!sessionEncrypted) {
    return { success: false, message: "Sessão não encontrada." };
  }

  const sessionPayload = await verifySession(sessionEncrypted);

  if (!sessionPayload) {
    return {
      success: false,
      message: "Falha ao descriptografar a sessão.",
    };
  }

  if (isFrontendMockDemoSession(sessionPayload)) {
    return {
      success: true,
      message: "Termos aceitos no modo demo.",
    };
  }

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  const forwarded = requestHeaders.get("forwarded");
  const { controller, timeoutId } = abortTimeout();

  try {
    const response = await fetch(`${ExternalURL}/accept-terms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": sessionPayload.accessToken,
        ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
        ...(realIp ? { "x-real-ip": realIp } : {}),
        ...(forwarded ? { forwarded } : {}),
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      return {
        success: false,
        message:
          errorData?.message || "Error accepting terms. Please try again.",
      };
    }
  } catch (error) {
    console.error("Error accepting terms:", error);

    return {
        success: false,
        message:
          error instanceof Error
          ? error.message
          : "Unexpected error accepting terms.",
    };
  } finally {
    clearTimeout(timeoutId);
  }

  await createSession(
    sessionPayload.accessToken,
    sessionPayload.userData,
    sessionPayload.taboolaData,
    {
      ...sessionPayload.contract,
      contract_signed: true,
    },
    sessionPayload.metaData
  );

  return {
    success: true,
    message: "Termos aceitos com sucesso e sessão atualizada!",
  };
}
