import { InternalURL } from "@/utils/apiRouter";

export async function ListTaboolaCampaignsApi(cookiesHeader: string, subAccount?: string) {
  try {
    const response = await fetch(`${InternalURL}/taboola/listTaboolaCampaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
      },
      body: JSON.stringify({ subAccount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Error loading Taboola campaigns" };
  }
}
