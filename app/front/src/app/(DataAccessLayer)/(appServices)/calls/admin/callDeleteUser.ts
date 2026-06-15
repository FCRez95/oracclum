export const deleteUser = async (userToDelete: number, signal?: AbortSignal) => {
    const response = await fetch("/api/admin/deleteUser", {
        method: "POST",
        body: JSON.stringify({ userToDelete }),
        signal,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Failed to delete user: " + response.status);
    }

    return response.json();
};
