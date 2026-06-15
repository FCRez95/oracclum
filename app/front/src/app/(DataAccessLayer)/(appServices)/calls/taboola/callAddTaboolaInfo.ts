import { internalApiUrl } from "@/utils/apiRouter";

interface TaboolaInfoProps {
  account_id: string;
  client_id: string;
  client_secret: string;
}

export const addTaboolaInfoInternal = async (accessToken: string, taboolaInfo: TaboolaInfoProps) => {
  try {

    if (!accessToken) {
      return {
        success: false,
        message: "Missing access token.",
      };
    }
  
    const response = await fetch(
      internalApiUrl("/taboola/addTaboolaInfo"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          accountId: taboolaInfo.account_id,
          clientId: taboolaInfo.client_id,
          clientSecret: taboolaInfo.client_secret,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: data?.message || "Failed to update Taboola data.",
      };
    }

    return {
      success: true,
      status: response.status,
      message: data?.message || "Taboola data updated successfully!",
      tb_access_token: data?.data,
    };
  } catch (error) {
    console.error("Error updating Taboola data:", error);
    return {
      success: false,
      status: 500,
      errors: {
        form: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while calling the internal API.",
        ],
      },
    };
  }
}
