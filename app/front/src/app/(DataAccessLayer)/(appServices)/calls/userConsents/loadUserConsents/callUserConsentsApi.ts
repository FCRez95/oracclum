import { internalApiUrl } from "@/utils/apiRouter";

export const UserConsentsApi = async (accessToken: string) => {
  try {
    const response = await fetch(
      internalApiUrl("/userConsents/loadUserConsents"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message:
          errorData?.message || "Error loading user consents. Please try again.",
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };

  } catch (error) {
    console.error("Error loading user consents:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unexpected error.",
    };
  }
};
