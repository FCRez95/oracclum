import { internalApiUrl } from "@/utils/apiRouter";

export const ChangePassword = async (accessToken: string, currentPassword: string, newPassword: string) => {
  try {
    const response = await fetch(
      internalApiUrl("/user/changePassword"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      }
    );

    if (response.status === 429) {
      return {
        success: false,
        message: "Too many attempts. Try again later.",
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Falha ao alterar a senha.",
      };
    }

    return {
      success: true,
      message: data?.message || "Senha alterada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao alterar senha via BFF:", error);
    return {
      success: false,
      errors: {
        form: [
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado durante a troca de senha.",
        ],
      },
    };
  }
};
