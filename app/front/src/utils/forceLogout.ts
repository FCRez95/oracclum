export async function forceLogout() {
  await fetch("/api/session/deleteSession", { method: "POST" });
  window.location.href = "/login";
}
