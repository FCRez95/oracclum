import { internalApiUrl } from "@/utils/apiRouter";

export const loadEnrichedUserData = async (accessToken: string) => {
  try {
    const response = await fetch(
      internalApiUrl("/user/loadEnrichedUserData"),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Falha ao carregar dados do usuário.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Erro ao carregar dados enriquecidos do usuário:", error);
    return {
      success: false,
      message: "Ocorreu um erro inesperado ao carregar dados do usuário.",
    };
  }
};
