import { InternalURL } from "@/utils/apiRouter";

export async function LoadSubaccountsApi(cookiesHeader: string) {
  try {
    const response = await fetch(`${InternalURL}/subaccounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Error loading subaccounts" };
  }
}
