// utils/CallerWrapper.ts
import { forceLogout } from "./forceLogout";

export async function CallerWrapper<T>(caller: Promise<T>): Promise<T> {
  try {
    const result = await caller;

    // Server-action path: resolved result with sessionExpired flag
    if (
      result &&
      typeof result === "object" &&
      "sessionExpired" in result &&
      (result as Record<string, unknown>).sessionExpired === true
    ) {
      await forceLogout();
      return Promise.reject(new Error("403"));
    }

    return result;
  } catch (err: unknown) {
    // Abort handling
    const error = err as Error & { name?: string; message?: string };
    if (
      error.name === "AbortError" ||
      error.message?.includes("signal is aborted")
    ) {
      throw error; // rethrow, so caller can ignore
    }

    // 403 handling (client-fetch path)
    if (error.message?.includes("403")) {
      await forceLogout();
      return Promise.reject(new Error("403")); // reject to stop further code
    }

    // Other errors
    console.error(err);
    throw err;
  }
}
