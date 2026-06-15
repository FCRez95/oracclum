"use server";

import { cookies } from "next/headers";
import { deleteSessionApi } from "../(DataAccessLayer)/(appServices)/calls/deleteSession/callDeleteSession";

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionCookies = cookieStore.toString();

  const success = await deleteSessionApi(sessionCookies);

  if (!success) {
    throw new Error("Logout failed");
  }

  cookieStore.delete("session");

  return true;
}
