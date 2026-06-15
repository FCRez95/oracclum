
import { internalApiUrl } from "@/utils/apiRouter";

export const MetaApi = async (accessToken: string): Promise<string | null> => {
  try {
    const response = await fetch(internalApiUrl("/meta/getMetaData"), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;

    const result = await response.json();
    const data = result.data;

    if (!data?.access_token) return null;

    return JSON.stringify({
      access_token: data.access_token,
      allowed_accounts: data.allowed_accounts || [],
    });
  } catch (error) {
    console.error("Erro ao buscar dados do Meta via BFF:", error);
    return null;
  }
};
