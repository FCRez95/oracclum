import { InternalURL } from "@/utils/apiRouter";
import { MetaClickStepsModel } from "@/models/click/meta-click-steps";

export const loadMetaClickByClickID = async (
  idClick: string,
  cookiesHeader: string,
  signal?: AbortSignal
): Promise<MetaClickStepsModel> => {
  const response = await fetch(`${InternalURL}click-meta/${encodeURIComponent(idClick)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookiesHeader,
    },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload = await response
      .json()
      .catch(() => ({ message: "Erro ao buscar click de teste da Meta." }));
    const detail = errorPayload?.detail ? ` ${errorPayload.detail}` : "";
    throw new Error(
      `${response.status} ${errorPayload?.message || "Erro ao buscar click de teste da Meta."}${detail}`
    );
  }

  return response.json();
};
