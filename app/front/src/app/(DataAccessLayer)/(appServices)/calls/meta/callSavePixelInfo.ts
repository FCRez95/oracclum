import { InternalURL } from "@/utils/apiRouter";

export type SavePixelInfoPayload = {
  id_campaign: number;
  pixel_id: string;
  access_token: string;
};

export type SavePixelInfoResult =
  | { success: true; message: string }
  | { success: false; status: number; message: string };

export async function callSavePixelInfo(
  payload: SavePixelInfoPayload,
  sessionCookies: string
): Promise<SavePixelInfoResult> {
  const response = await fetch(`${InternalURL}/meta/savePixelInfo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: sessionCookies,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let responseMessage = response.ok
    ? "Dados do pixel salvos com sucesso."
    : "Erro ao salvar dados do pixel.";

  try {
    const body = (await response.json()) as {
      message?: string;
      data?: { message?: string; detail?: string };
    };

    responseMessage =
      body.message || body.data?.message || body.data?.detail || responseMessage;
  } catch {
    responseMessage = response.ok
      ? "Dados do pixel salvos com sucesso."
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
    message: responseMessage || "Dados do pixel salvos com sucesso.",
  };
}
