export const PLAN_MAX_CLICKS: Record<string, number> = {
  trial: 3_000_000,
  inicial: 15_000,
  básico: 50_000,
  crescente: 85_000,
  essencial: 200_000,
  expansivo: 320_000,
  escalado: 450_000,
  sênior: 1_500_000,
  mestre: 2_000_000,
  ancient: 3_000_000,
  admin: 3_000_000,
};

export function getMaxClicks(userType: string): number {
  return PLAN_MAX_CLICKS[userType.toLowerCase()] ?? 0;
}

export const PLAN_MAX_CAMPAIGNS: Record<string, number> = {
  trial: Infinity,
  inicial: 1,
  básico: 3,
  crescente: 5,
  essencial: 20,
  expansivo: 30,
  escalado: 40,
  sênior: Infinity,
  mestre: Infinity,
  ancient: Infinity,
  admin: Infinity,
};

export function getMaxCampaigns(userType: string): number {
  return PLAN_MAX_CAMPAIGNS[userType.toLowerCase()] ?? 0;
}
