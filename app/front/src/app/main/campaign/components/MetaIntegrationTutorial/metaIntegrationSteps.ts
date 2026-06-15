export type MetaIntegrationStep = {
  key: number;
  statusField: "ad_provider" | "funnel" | "checkout" | "test";
  shortLabel: string;
  label: string;
  title: string;
  description: string;
  placeholderTitle: string;
  placeholderDescription: string;
};

export const metaIntegrationSteps: MetaIntegrationStep[] = [
  {
    key: 1,
    statusField: "ad_provider",
    shortLabel: "Anúncios",
    label: "Integração Meta",
    title: "Integração com a Meta",
    description:
      "Este passo vai concentrar as orientações específicas para conectar corretamente sua campanha da Meta à coleta de dados da Oracclum.",
    placeholderTitle: "Conteúdo deste passo será adicionado em breve",
    placeholderDescription:
      "Aqui entrarão as instruções detalhadas de configuração da campanha Meta no provedor de anúncios.",
  },
  {
    key: 2,
    statusField: "funnel",
    shortLabel: "Funil",
    label: "Integração com Funil",
    title: "Integração com o funil",
    description:
      "Este passo vai reunir o material necessário para configurar o funil da campanha Meta com a estrutura esperada pela plataforma.",
    placeholderTitle: "Passo de funil ainda sem conteúdo",
    placeholderDescription:
      "As instruções específicas para o funil Meta serão implementadas em uma próxima etapa, sem subpassos neste v1.",
  },
  {
    key: 3,
    statusField: "checkout",
    shortLabel: "Checkout",
    label: "Integração com Checkout",
    title: "Integração com o checkout",
    description:
      "Este passo vai orientar a ligação entre o checkout da campanha e os eventos usados para começar a coleta de dados.",
    placeholderTitle: "Instruções de checkout pendentes",
    placeholderDescription:
      "Aqui serão adicionadas as orientações práticas para a integração de checkout da campanha Meta.",
  },
  {
    key: 4,
    statusField: "test",
    shortLabel: "Teste",
    label: "Teste de Integração",
    title: "Teste de integração",
    description:
      "Este passo valida se a configuração da campanha Meta está pronta e enviando os sinais esperados ao longo do funil.",
    placeholderTitle: "Área de validação do teste",
    placeholderDescription:
      "Aqui fica o acompanhamento do clique de teste e a validação final da integração Meta.",
  },
];

export type MetaIntegrationStatus = {
  ad_provider: 0 | 1;
  funnel: 0 | 1;
  checkout: 0 | 1;
  test: 0 | 1;
};

export const emptyMetaIntegrationStatus: MetaIntegrationStatus = {
  ad_provider: 0,
  funnel: 0,
  checkout: 0,
  test: 0,
};
