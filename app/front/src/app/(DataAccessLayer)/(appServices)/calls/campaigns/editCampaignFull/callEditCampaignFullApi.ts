import { InternalURL } from "@/utils/apiRouter";

export const EditCampaignFullApi = async (
  payload: {
    idCampaign: number;
    name: string;
    link: string;
    ad_provider: string;
    sub_account?: string;
    conversion_name: string;
    checkout_provider?: string;
    external_id?: string;
  },
  cookiesHeader: string,
) => {
  try {
    const response = await fetch(`${InternalURL}/campaign/editCampaignFull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        errors: errorData.errors || {
          form: ["Erro ao editar campanha. Tente novamente."],
        },
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error editing campaign:", error);
    return {
      success: false,
      errors: {
        form: [
          error instanceof Error
            ? error.message
            : "Unexpected error editing campaign.",
        ],
      },
    };
  }
};
