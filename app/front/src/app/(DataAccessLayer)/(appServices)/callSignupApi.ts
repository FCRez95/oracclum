import { internalApiUrl } from "@/utils/apiRouter";

export const SignupApi = async (
  name: string,
  email: string,
  password: string,
  passwordConfirmation: string,
  cpfcnpj: string,
  phone: string,
  user_type: string = "trial"
) => {
  try {
    const response = await fetch(internalApiUrl("/auth/signup"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, passwordConfirmation, cpfcnpj, phone, user_type }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          errors: { form: ["Too many attempts. Try again later."] },
          status: 429,
        };
      }
      const errorData = await response.json();
      return {
        success: false,
        errors: errorData.errors || { form: ["Falha no cadastro."] },
        status: response.status,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: {
        form: [
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado durante o cadastro.",
        ],
      },
    };
  }
};
