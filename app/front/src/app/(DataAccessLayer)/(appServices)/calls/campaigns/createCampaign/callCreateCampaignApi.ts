import { InternalURL } from "@/utils/apiRouter";

export const CreateCampaignApi = async (
  payload: {
    name: string;
    link: string;
    ad_provider: string;
    subAccountId?: string;
    external_id: string;
  },
  cookiesHeader: string,
) => {
  try {
    const response = await fetch(`${InternalURL}/campaign/addCampaign`, {
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
          form: ["Error creating campaign. Please try again."],
        },
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating campaign:", error);
    return {
      success: false,
      errors: {
        form: [
          error instanceof Error
            ? error.message
            : "Unexpected error creating campaign.",
        ],
      },
    };
  }
};
