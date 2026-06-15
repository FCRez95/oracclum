export const activateUser = async (userToActivate: number, signal?: AbortSignal) => {
    const response = await fetch("/api/admin/activateUser", {
        method: "POST",
        body: JSON.stringify({ userToActivate }),
        signal,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Failed to activate user: " + response.status);
    }

    return response.json();
};
