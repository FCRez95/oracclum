"use server";

import { validator } from "@/utils/validator/validator";
import { SignupApi } from "../(DataAccessLayer)/(appServices)/callSignupApi";

export const signupAction = async (
  _prevState: unknown,
  formData: FormData
): Promise<{
  success: boolean;
  errors?: Record<string, string[]>;
  status?: number;
}> => {
  const result = await validator("signupUser", formData);
  if (!result.success) {
    return { success: false, errors: result.errors };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirmation = formData.get("passwordConfirmation") as string;
  const cpfcnpj = formData.get("cpfcnpj") as string;
  const phone = formData.get("phone") as string;
  try {
    const signupResponse = await SignupApi(
      name,
      email,
      password,
      passwordConfirmation,
      cpfcnpj,
      phone,
      "trial"
    );

    if (!signupResponse.success) {
      return {
        success: false,
        errors: signupResponse.errors,
        status: signupResponse.status,
      };
    }

    return { success: true };
  } catch {
    return { success: false, status: 500 };
  }
};
