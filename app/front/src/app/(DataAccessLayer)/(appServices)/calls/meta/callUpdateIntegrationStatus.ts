import { InternalURL } from "@/utils/apiRouter";
import { type MetaIntegrationStatus } from "@/app/main/campaign/components/MetaIntegrationTutorial/metaIntegrationSteps";

export type UpdateIntegrationStatusPayload = {
  idCampaign: number;
  step: keyof MetaIntegrationStatus;
  status: 0 | 1;
};

export type UpdateIntegrationStatusResult =
  | { success: true; message: string }
  | { success: false; status: number; message: string };

export async function callUpdateIntegrationStatus(
  payload: UpdateIntegrationStatusPayload,
  sessionCookies: string
): Promise<UpdateIntegrationStatusResult> {
  const response = await fetch(`${InternalURL}/meta/updateIntegrationStatus`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: sessionCookies,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let responseMessage = response.ok
    ? "Status da integração atualizado com sucesso."
    : "Erro ao atualizar status da integração.";

  try {
    const body = (await response.json()) as {
      message?: string;
      data?: { message?: string; detail?: string };
    };

    responseMessage =
      body.message || body.data?.message || body.data?.detail || responseMessage;
  } catch {
    responseMessage = response.ok
      ? "Status da integração atualizado com sucesso."
      : responseMessage;
  }

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      message: responseMessage,
    };
  }

  return {
    success: true,
    message: responseMessage,
  };
}
