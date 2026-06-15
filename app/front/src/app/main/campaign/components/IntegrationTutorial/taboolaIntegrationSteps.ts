export type TaboolaIntegrationStep = {
  key: number;
  shortLabel: string;
  label: string;
  title: string;
  description: string;
};

export const taboolaIntegrationSteps: TaboolaIntegrationStep[] = [
  {
    key: 1,
    shortLabel: "Anuncios",
    label: "Provedor de anuncios",
    title: "Integracao com o provedor de anuncios",
    description:
      "Configure os parametros de tracking que precisam ser adicionados na campanha Taboola para que a Oracclum consiga reconhecer os cliques e conectar os eventos seguintes.",
  },
  {
    key: 2,
    shortLabel: "Funil",
    label: "Integracao com funil",
    title: "Integracao com o funil",
    description:
      "Instale os scripts correspondentes a cada etapa do funil para capturar as visitas, transportar o click_id e manter a leitura da jornada consistente ao longo das paginas.",
  },
  {
    key: 3,
    shortLabel: "Checkout",
    label: "Integracao com checkout",
    title: "Integracao com o checkout",
    description:
      "Cadastre o postback da campanha no checkout e, quando possivel, inclua os scripts adicionais para completar a passagem dos sinais finais para a Oracclum.",
  },
  {
    key: 4,
    shortLabel: "Teste",
    label: "Teste de integracao",
    title: "Teste de integracao",
    description:
      "Gere uma URL de validacao para percorrer o funil e acompanhe, em tempo real, a chegada dos sinais esperados em cada etapa da campanha.",
  },
];
