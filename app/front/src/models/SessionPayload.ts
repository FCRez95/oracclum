export type SessionPayload = {
    accessToken: string;
    userData: string;
    taboolaData: string;
    contract: { id_user: number; contract_signed: boolean; signed_at?: string | null };
    metaData?: string;
    demoMode?: "frontend-mock" | "backend-demo";
}
