import { EnrichedAccount } from "@/models/enriched-account";

export const loadAllUsers = async (signal?: AbortSignal): Promise<EnrichedAccount[]> => {
    const response = await fetch("/api/admin/users", {
        method: "GET",
        signal,
        cache: "no-store",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch users: " + response.status);
    }

    return response.json();
};
