import { internalApiUrl } from "@/utils/apiRouter";

export const LoginApi = async (email: string, password: string) => {
    try {
        const response = await fetch(internalApiUrl("/auth/login"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                return {
                    success: false,
                    errors: { form: ["Muitas tentativas. Tente novamente mais tarde."] },
                };
            }
            const errorData = await response.json();
            return {
                success: false,
                errors: errorData.errors || {
                    form: ["Falha no login. Verifique suas credenciais."],
                },
            };
        }

        const data = await response.json();
        return {
            success: true,
            accessToken: data.accessToken,
        };
    } catch (error) {
        console.error("Erro na ação de login:", error);
        return {
            success: false,
            errors: {
                form: [
                    error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado durante o login.",
                ],
            },
        };
    }
};


