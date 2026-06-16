"use server";

import { getSessionData } from "@/app/(DataAccessLayer)/(appServices)/calls/getSession/callGetSessionData";
import { addTaboolaInfoInternal } from "@/app/(DataAccessLayer)/(appServices)/calls/taboola/callAddTaboolaInfo";
import { ChangeTaboolaState } from "./components/taboolaIntegration";
import { createSession } from "@/app/(DataAccessLayer)/(appServices)/calls/createSession/callCreateSession";
import { cookies } from "next/headers";
import { CallerWrapper } from "@/utils/CallerWrapper";
import { InternalURL } from "@/utils/apiRouter";
import { META_OAUTH_TOKEN_COOKIE } from "@/lib/metaOauth";
import { metaApiVersion } from "@/config/appConfig";
import {
  isAnyDemoSession,
  isBackendDemoSession,
  isFrontendMockDemoSession,
} from "@/demo/demoMode";
import {
  getDemoMetaAdAccounts,
  getDemoMetaCampaigns,
} from "@/demo/demoData";

async function clearSessionOnForbidden(status: number) {
  if (status === 403) {
    (await cookies()).delete("session");
  }
}

export async function getAccountSession() {
  const session = await getSessionData();
  if (!session) {
    return { success: false, session: null };
  }

  return { success: true, session };
}

export async function consumeMetaOauthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(META_OAUTH_TOKEN_COOKIE)?.value ?? null;
  cookieStore.delete(META_OAUTH_TOKEN_COOKIE);

  return {
    success: Boolean(token),
    token,
    message: token ? undefined : "Token de autorizacao nao encontrado.",
  };
}

export async function fetchMetaAdAccounts(token: string) {
  try {
    if (token === "demo-meta-token") {
      return {
        success: true,
        adAccounts: getDemoMetaAdAccounts(),
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/${metaApiVersion}/me/adaccounts?access_token=${token}&fields=account_id,name`
    );
    const data = await response.json();

    if (!response.ok || !data.data) {
      return {
        success: false,
        message: data.error?.message || "Erro ao buscar contas de anúncio.",
        adAccounts: [],
      };
    }

    return {
      success: true,
      adAccounts: data.data as { id: string; account_id: string; name: string }[],
    };
  } catch (error) {
    console.error("[Meta] Error fetching ad accounts:", error);
    return { success: false, message: "Erro ao buscar contas de anúncio.", adAccounts: [] };
  }
}

export async function fetchMetaCampaigns(token: string, adAccountId: string) {
  try {
    if (token === "demo-meta-token") {
      return {
        success: true,
        campaigns: getDemoMetaCampaigns(),
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/${metaApiVersion}/act_${adAccountId}/campaigns?access_token=${token}&fields=id,name`
    );
    const data = await response.json();

    if (!response.ok || !data.data) {
      return {
        success: false,
        message: data.error?.message || "Erro ao buscar campanhas.",
        campaigns: [],
      };
    }

    return {
      success: true,
      campaigns: data.data as { id: string; name: string }[],
    };
  } catch (error) {
    console.error("[Meta] Error fetching campaigns:", error);
    return { success: false, message: "Erro ao buscar campanhas.", campaigns: [] };
  }
}

export async function getMetaData() {
  const { success, session } = await getAccountSession();

  const sessionMetaData = typeof session?.metaData === "string"
  ? JSON.parse(session?.metaData)
  : session?.metaData;

  const sessionUserData = typeof session?.userData === "string"
  ? JSON.parse(session?.userData)
  : session?.userData;

  if (!success || !session?.accessToken)
    return { success: false, message: "Usuário não autenticado." };

  let metaData = { metaAdsToken: "", allowedAccounts: [] as { account_id: string; name: string }[] };

  if (sessionMetaData) {
    try {
      if (sessionMetaData.access_token) {
        metaData = {
          metaAdsToken: sessionMetaData.access_token,
          allowedAccounts: sessionMetaData.allowed_accounts || [],
        };
      }
    } catch (err) {
      console.error("[Meta] Error parsing session metaData:", err);
    }
  }

  if (!metaData.metaAdsToken) {
    try {
      const baseUrl = InternalURL
      const response = await fetch(`${baseUrl}meta/getMetaData`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });

      if (response.ok) {
        const backendData = await response.json();
        if (backendData.data?.meta_access_token) {
          metaData = {
            metaAdsToken: backendData.data.meta_access_token,
            allowedAccounts: backendData.data.allowed_accounts || [],
          };

          (await cookies()).delete("session");
          const metaDataString = JSON.stringify({
            access_token: backendData.data.meta_access_token,
            allowed_accounts: backendData.data.allowed_accounts || [],
          });
          const userData = session.userData || "{}";
          const taboolaData = session.taboolaData || "{}";
          const contract = session.contract ?? {
            id_user: sessionUserData.id,
            contract_signed: false,
            signed_at: null,
          };
          await createSession(session.accessToken, userData, taboolaData, contract, metaDataString, session.demoMode);
        }
      }
    } catch (err) {
      console.warn("[Meta] Error fetching meta data from backend:", err);
    }
  }

  return { success: true, metaData };
}


export async function changeTaboolaData(
  _prevState: ChangeTaboolaState,
  formData: FormData
): Promise<ChangeTaboolaState> {
  const { success, session } = await CallerWrapper(getAccountSession());
  if (!success || !session?.accessToken)
    return { success: false, message: "Usuário não autenticado." };

  if (isFrontendMockDemoSession(session)) {
    return {
      success: true,
      message: "Dados da Taboola atualizados no modo demo.",
    };
  }

  const clientId = formData.get("clientId") as string;
  const clientSecret = formData.get("clientSecret") as string;
  const accountId = formData.get("accountId") as string;

  const taboolaInfo = {
    account_id: accountId,
    client_id: clientId,
    client_secret: clientSecret,
  };

  const response = await addTaboolaInfoInternal(session.accessToken, taboolaInfo);

  if (response.success) {
    try {
      (await cookies()).delete("session");

      const updatedTaboolaData = JSON.stringify({
        access_token: response.tb_access_token,
        account_id: accountId,
        client_id: clientId,
        client_secret: clientSecret,
      });
      const userData = JSON.stringify(session.userData ?? {});
      const contract = session.contract ?? {
        id_user: JSON.parse(session.userData)?.id,
        contract_signed: false,
        signed_at: null,
      };
      await createSession(session.accessToken, userData, updatedTaboolaData, contract, undefined, session.demoMode);

      return {
        success: true,
        message: "Dados da Taboola atualizados com sucesso!",
      };
    } catch (err) {
      console.error("[Taboola] Failed to refresh session after update:", err);
      return {
        success: true,
        message:
          "As informações da Taboola foram atualizadas com sucesso, mas será necessário atualizar a página para aplicar as mudanças.",
      };
    }
  }

  await clearSessionOnForbidden(response.status ?? 0);

  return { success: false, message: response.message || "Erro ao atualizar dados da Taboola." };
}

export async function saveMetaToken(
  token: string,
  allowedAccounts: { account_id: string; name: string }[]
) {
  const { success, session } = await CallerWrapper(getAccountSession());
  if (!success || !session?.accessToken)
    return { success: false, message: "Usuário não autenticado." };

  if (isFrontendMockDemoSession(session)) {
    return { success: true, message: "Dados do Meta salvos no modo demo." };
  }

  const userId = session.contract?.id_user;
  if (!userId) {
    return { success: false, message: "ID do usuário não encontrado." };
  }
  try {
    const baseUrl = InternalURL
    const response = await fetch(`${baseUrl}meta/addMetaInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        metaAccessToken: token,
        allowedAccounts: allowedAccounts,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      await clearSessionOnForbidden(response.status);
      return {
        success: false,
        message: data.message || "Erro ao salvar dados do Meta.",
      };
    }

    (await cookies()).delete("session");
    const metaData = JSON.stringify({
      access_token: token,
      allowed_accounts: allowedAccounts,
    });
    const userData = session.userData || "{}";
    const taboolaData = session.taboolaData || "{}";
    const contract = session.contract ?? {
      id_user: userId,
      contract_signed: false,
      signed_at: null,
    };
    await createSession(session.accessToken, userData, taboolaData, contract, metaData, session.demoMode);

    return { success: true, message: "Dados do Meta salvos com sucesso!" };
  } catch (err) {
    console.error("[Meta] Failed to save token:", err);
    return { success: false, message: "Erro ao salvar dados do Meta." };
  }
}

export async function checkMetaTokenExpiration(): Promise<{
  connected: boolean;
  needsRenewal: boolean;
  daysUntilExpiry?: number;
  isExpired?: boolean;
}> {
  const { success, session } = await getAccountSession();
  if (!success || !session?.accessToken)
    return { connected: false, needsRenewal: false };

  if (isAnyDemoSession(session)) {
    return { connected: true, needsRenewal: false, daysUntilExpiry: 365, isExpired: false };
  }

  const metaData = typeof session.metaData === "string"
    ? JSON.parse(session.metaData)
    : session.metaData;

  if (!metaData?.access_token)
    return { connected: false, needsRenewal: false };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${metaApiVersion}/debug_token?input_token=${metaData.access_token}&access_token=${metaData.access_token}`
    );
    const data = await response.json();

    if (!data.data?.is_valid)
      return { connected: true, needsRenewal: true, isExpired: true, daysUntilExpiry: 0 };

    const expiresAt = data.data.expires_at; // unix timestamp
    const now = Math.floor(Date.now() / 1000);
    const daysUntilExpiry = Math.floor((expiresAt - now) / 86400);

    return {
      connected: true,
      needsRenewal: daysUntilExpiry <= 7,
      daysUntilExpiry,
      isExpired: daysUntilExpiry <= 0,
    };
  } catch {
    // If debug_token fails, don't block — skip check
    return { connected: true, needsRenewal: false };
  }
}

export async function removeMetaToken() {
  const { success, session } = await CallerWrapper(getAccountSession());
  if (!success || !session?.accessToken)
    return { success: false, message: "Usuário não autenticado." };

  if (isFrontendMockDemoSession(session)) {
    return { success: true, message: "Desconectado do Facebook no modo demo." };
  }

  try {
    // Revoke token on Meta Graph API (best-effort)
    const metaData = typeof session.metaData === "string"
      ? JSON.parse(session.metaData)
      : session.metaData;
    if (metaData?.access_token && !isBackendDemoSession(session)) {
      const revokeResponse = await fetch(
        `https://graph.facebook.com/${metaApiVersion}/me/permissions?access_token=${metaData.access_token}`,
        { method: "DELETE" }
      );
      if (!revokeResponse.ok) {
        console.warn("[Meta] Token revocation failed:", await revokeResponse.text().catch(() => ""));
      }
    }

    // Delete from backend DB
    const baseUrl = InternalURL;
    const deleteResponse = await fetch(`${baseUrl}meta/deleteMetaInfo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!deleteResponse.ok) {
      const deleteData = await deleteResponse.json().catch(() => ({}));
      console.warn("[Meta] Backend delete failed:", deleteData);
    }

    // Clear session regardless of backend result
    (await cookies()).delete("session");
    const userData = session.userData || "{}";
    const taboolaData = session.taboolaData || "{}";
    const contract = session.contract ?? {
      id_user: JSON.parse(session.userData as string)?.id,
      contract_signed: false,
      signed_at: null,
    };
    await createSession(session.accessToken, userData, taboolaData, contract, undefined, session.demoMode);

    return { success: true, message: "Desconectado do Facebook." };
  } catch (err) {
    console.error("[Meta] Failed to remove token:", err);
    return { success: false, message: "Erro ao desconectar do Meta." };
  }
}
