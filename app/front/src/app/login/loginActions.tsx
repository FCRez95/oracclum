"use server";

import { validator } from "@/utils/validator/validator";
import { LoginApi } from "../(DataAccessLayer)/(appServices)/callLoginApi";
import { UserDataApi } from "../(DataAccessLayer)/(appServices)/callUserDataApi";
import { TaboolaApi } from "../(DataAccessLayer)/(appServices)/callTaboolaApi";
import { MetaApi } from "../(DataAccessLayer)/(appServices)/callMetaApi";
import { UserConsentsApi } from "../(DataAccessLayer)/(appServices)/calls/userConsents/loadUserConsents/callUserConsentsApi";
import { createSession } from "../(DataAccessLayer)/(appServices)/calls/createSession/callCreateSession";
import { createDemoSession } from "@/demo/demoSession";

export const loginAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<{
  success: boolean;
  errors?: Record<string, string[]>;
  initialState?: unknown;
}> => {
  const result = await validator("login", formData);
  if (!result.success) {
    return { success: false, errors: result.errors };
  }

  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const loginResponse = await LoginApi(email as string, password as string);
    if (loginResponse.errors) {
      return { success: false, errors: loginResponse.errors };
    }

    const accessToken = loginResponse.accessToken;
    const userData = await UserDataApi(accessToken);
    const taboolaData = await TaboolaApi(accessToken);
    const consentsResponse = await UserConsentsApi(accessToken);
    const metaData = await MetaApi(accessToken);

    const contract = {
      id_user: userData.id,
      contract_signed: consentsResponse.success
        ? Number(consentsResponse.data.contract_signed) === 1
        : false,
      signed_at: consentsResponse.success ? consentsResponse.data.signed_at : null,
    };

    await createSession(accessToken, userData, taboolaData, contract, metaData ?? undefined);

    return { success: true };
  } catch {
    return {
      success: false,
      initialState: result,
    };
  }
};

export const demoLoginAction = async (): Promise<{
  success: boolean;
  errors?: Record<string, string[]>;
}> => {
  try {
    await createDemoSession();
    return { success: true };
  } catch (error) {
    console.error("Demo login failed:", error);
    return {
      success: false,
      errors: { form: ["Nao foi possivel iniciar o modo demo."] },
    };
  }
};
