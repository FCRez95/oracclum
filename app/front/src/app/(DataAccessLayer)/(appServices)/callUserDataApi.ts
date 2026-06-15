import { internalApiUrl } from "@/utils/apiRouter";

export const UserDataApi = async (accessToken: string) => {
  try {
    const userDataResponse = await fetch(
      internalApiUrl("/user/getUserData"),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!userDataResponse.ok)
      throw new Error("Falha ao obter dados do usuário.");
    const userData = await userDataResponse.json();
    return userData;
  } catch (error) {
    console.error("Erro ao buscar dados do usuário via BFF:", error);
    return {
      success: false,
      errors: {
        form: [
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado durante o login.",
        ],
      },
    }
  }
}
