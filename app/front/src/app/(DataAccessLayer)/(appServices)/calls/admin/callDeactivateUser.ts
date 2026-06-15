export const deactivateUser = async (userToDeactivate: number, signal?: AbortSignal) => {
    const response = await fetch("/api/admin/deactivateUser", {
        method: "POST",
        body: JSON.stringify({ userToDeactivate }),
        signal,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Failed to deactivate user: " + response.status);
    }

    return response.json();
};
