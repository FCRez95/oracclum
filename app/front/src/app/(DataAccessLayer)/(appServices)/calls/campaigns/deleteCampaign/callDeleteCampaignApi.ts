import { InternalURL } from "@/utils/apiRouter";

export const DeleteCampaignApi = async (idCampaign: number, cookiesHeader: string) => {
    if (!idCampaign) {
        return {
            success: false,
            errors: { form: ["ID of campaign is required."] },
        };
    }

    try {
        const response = await fetch(`${InternalURL}/campaign/deleteCampaign`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookiesHeader,
            },
            body: JSON.stringify({ idCampaign }),
        });

        if (!response.ok) {
            const errorData = await response.json();

            return {
                success: false,
                errors: errorData.errors || {
                    form: ["Error deleting campaign."],
                },
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return {
            success: false,
            errors: {
                form: [
                    error instanceof Error
                    ? error.message
                    : "Unknown error.",
                ],
            },
        };
    }
};
