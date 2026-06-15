export const deleteMyData = async (signal?: AbortSignal) => {
  const response = await fetch("/api/delete-my-data", {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete user data: ${response.status}`;

    try {
      const data = await response.json();
      if (typeof data?.message === "string") {
        errorMessage = data.message;
      }
    } catch {
      // Keep the default error message if the response body is not JSON.
    }

    throw new Error(
      response.status === 401 || response.status === 403
        ? String(response.status)
        : errorMessage
    );
  }

  return response.json();
};
