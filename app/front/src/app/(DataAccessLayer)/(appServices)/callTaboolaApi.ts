
import { internalApiUrl } from "@/utils/apiRouter";

export const TaboolaApi = async (accessToken: string) => {
    try {
        const taboolaDataResponse = await fetch(
            internalApiUrl("/taboola/getTaboolaData"),
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        if (!taboolaDataResponse.ok)
            throw new Error("Falha ao obter dados da Taboola.");
        const taboolaData = await taboolaDataResponse.json();
        return taboolaData;
    } catch (error) {
        console.error("Erro ao buscar dados da Taboola via BFF:", error);
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
};
