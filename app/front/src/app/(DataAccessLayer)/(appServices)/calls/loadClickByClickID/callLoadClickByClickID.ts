import { InternalURL } from "@/utils/apiRouter";

export const loadClickByClickID = async (
    id_click: string,
    campaign_id: number,
    cookiesHeader: string,
    signal?: AbortSignal
) => {
    try {
        const url = `${InternalURL}/campaign/loadClickByClickID?id_click=${id_click}&campaign_id=${campaign_id}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookiesHeader,
            },
            signal,
            cache: "no-store",
        });

        if (!response.ok) {
            const errorPayload = await response
                .json()
                .catch(() => ({ message: "Erro ao buscar click de teste." }));
            const detail = errorPayload?.detail ? ` ${errorPayload.detail}` : "";
            throw new Error(
                `${response.status} ${errorPayload?.message || "Erro ao buscar click de teste."}${detail}`
            );
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};
