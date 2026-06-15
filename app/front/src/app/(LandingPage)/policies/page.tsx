import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logos/logoOracclumTextRight.svg";

export const metadata: Metadata = {
  title: "Política de Privacidade | Oracclum",
  description:
    "Política de Privacidade demonstrativa da Plataforma ORACCLUM.",
};

type PolicySubItem = {
  marker: string;
  text: string;
};

type PolicyClause = {
  marker: string;
  text: string;
  subItems?: PolicySubItem[];
};

type PolicySection = {
  title: string;
  clauses: PolicyClause[];
};

const policySections: PolicySection[] = [
  {
    title: "AGENTES DE TRATAMENTO",
    clauses: [
      {
        marker: "1.1.",
        text: "ORACCLUM, apresentada neste repositório como projeto de portfólio e demonstração técnica, representa a OPERADORA dos dados pessoais inseridos na Plataforma.",
      },
      {
        marker: "1.2.",
        text: "O LICENCIADO, na qualidade de contratante da ORACCLUM, é o CONTROLADOR dos dados pessoais inseridos na Plataforma no âmbito das campanhas e integrações por ele gerenciadas.",
      },
    ],
  },
  {
    title: "DADOS PESSOAIS TRATADOS",
    clauses: [
      {
        marker: "2.1.",
        text: "A ORACCLUM poderá coletar e tratar os seguintes dados do LICENCIADO:",
        subItems: [
          {
            marker: "a)",
            text: "Dados cadastrais: nome, e-mail, telefone, CNPJ/CPF, endereço, informações de faturamento;",
          },
          {
            marker: "b)",
            text: "Dados de uso da Plataforma: credenciais de acesso, logs de atividade, dados de suporte, preferências de configuração;",
          },
          {
            marker: "c)",
            text: "Dados de comunicação: registros de atendimento e interações via canais oficiais;",
          },
          {
            marker: "d)",
            text: "Dados de pagamento: informações fornecidas para transações financeiras, que poderão ser processadas por terceiros contratados (ex: gateways de pagamento), não sendo armazenadas nos servidores da ORACCLUM.",
          },
        ],
      },
      {
        marker: "2.2.",
        text: "Os dados inseridos pelo LICENCIADO na Plataforma (como informações de campanhas e dados de terceiros) serão tratados exclusivamente conforme suas instruções, sendo de sua inteira responsabilidade obter os consentimentos e garantir a base legal para o tratamento.",
      },
    ],
  },
  {
    title: "FINALIDADES DO TRATAMENTO",
    clauses: [
      {
        marker: "3.1.",
        text: "Os dados do LICENCIADO são tratados para as seguintes finalidades:",
        subItems: [
          {
            marker: "a)",
            text: "Execução do contrato de licenciamento e prestação dos serviços de integração e suporte;",
          },
          {
            marker: "b)",
            text: "Emissão de cobranças, comunicação de alterações e obrigações legais;",
          },
          {
            marker: "c)",
            text: "Aperfeiçoamento da Plataforma e melhorias na experiência do usuário;",
          },
          {
            marker: "d)",
            text: "Proteção de direitos da ORACCLUM em eventual disputa judicial ou administrativa.",
          },
        ],
      },
      {
        marker: "3.2.",
        text: "Os dados de terceiros inseridos pelo LICENCIADO serão tratados exclusivamente para fins de execução das funcionalidades da Plataforma, sob a direção do CONTROLADOR.",
      },
    ],
  },
  {
    title: "OBRIGAÇÕES DO LICENCIADO COMO CONTROLADOR",
    clauses: [
      {
        marker: "4.1.",
        text: "O LICENCIADO é exclusivamente responsável por:",
        subItems: [
          {
            marker: "a)",
            text: "Garantir que possui base legal válida para tratamento dos dados pessoais de terceiros, incluindo a coleta de consentimento quando aplicável;",
          },
          {
            marker: "b)",
            text: "Informar adequadamente os titulares de dados sobre as finalidades, compartilhamentos e seus direitos;",
          },
          {
            marker: "c)",
            text: "Instruir a ORACCLUM sobre o tratamento a ser realizado, mantendo-se atualizado com relação à legislação de proteção de dados;",
          },
          {
            marker: "d)",
            text: "Comunicar imediatamente à ORACCLUM sobre qualquer atualização ou revogação de consentimento, ou determinação judicial/administrativa envolvendo dados inseridos na Plataforma.",
          },
        ],
      },
      {
        marker: "4.2.",
        text: "Caso a ORACCLUM seja demandada judicial ou administrativamente por ato ou omissão do LICENCIADO em relação ao tratamento de dados pessoais, o LICENCIADO assume o dever de:",
        subItems: [
          {
            marker: "a)",
            text: "Ressarcir todos os prejuízos e custos decorrentes, inclusive honorários e indenizações;",
          },
          {
            marker: "b)",
            text: "Assumir a responsabilidade ativa no processo, promovendo a substituição processual quando cabível.",
          },
        ],
      },
      {
        marker: "4.3.",
        text: "A inobservância, pelo LICENCIADO, das obrigações previstas nos itens 4.1 e 4.2 ensejará o direito de regresso da ORACCLUM por todos os danos, perdas, multas e condenações decorrentes, inclusive indiretas, judiciais ou extrajudiciais.",
      },
    ],
  },
  {
    title: "SEGURANÇA DOS DADOS",
    clauses: [
      {
        marker: "5.1.",
        text: "A ORACCLUM adota medidas de segurança técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados, divulgação, perda, alteração ou destruição.",
      },
      {
        marker: "5.2.",
        text: "Em caso de incidente de segurança que possa acarretar risco ou dano relevante, a ORACCLUM notificará o LICENCIADO com brevidade, nos termos da LGPD.",
      },
    ],
  },
  {
    title: "ARMAZENAMENTO E RETENÇÃO",
    clauses: [
      {
        marker: "6.1.",
        text: "Os dados pessoais serão armazenados pelo período necessário à execução contratual e cumprimento de obrigações legais.",
      },
      {
        marker: "6.2.",
        text: "Após o término da relação, os dados inseridos na Plataforma serão mantidos por até 90 (noventa) dias para fins de exportação, sendo posteriormente eliminados, salvo obrigação legal de retenção.",
      },
    ],
  },
  {
    title: "DIREITOS DOS TITULARES",
    clauses: [
      {
        marker: "7.1.",
        text: "O LICENCIADO é responsável por assegurar os direitos dos titulares cujos dados forem inseridos na Plataforma, incluindo:",
        subItems: [
          {
            marker: "a)",
            text: "Confirmação do tratamento;",
          },
          {
            marker: "b)",
            text: "Acesso e correção de dados;",
          },
          {
            marker: "c)",
            text: "Anonimização, bloqueio ou eliminação;",
          },
          {
            marker: "d)",
            text: "Portabilidade;",
          },
          {
            marker: "e)",
            text: "Informação sobre compartilhamento;",
          },
          {
            marker: "f)",
            text: "Revogação do consentimento.",
          },
        ],
      },
    ],
  },
  {
    title: "DISPOSIÇÕES GERAIS",
    clauses: [
      {
        marker: "8.1.",
        text: "Esta Política poderá ser atualizada a qualquer tempo. Recomenda-se consulta periódica à documentação do projeto ORACCLUM.",
      },
      {
        marker: "8.2.",
        text: "Em caso de dúvidas sobre a demonstração, consulte a documentação do projeto ou explore o modo demo disponível na Plataforma.",
      },
      {
        marker: "8.3.",
        text: "Esta Política é mantida como material demonstrativo para o projeto de portfólio e não representa uma operação comercial ativa.",
      },
    ],
  },
];

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-[#0f171f] text-[#e8e6e2] font-content">
      <header className="border-b border-[#5ec899]/20 bg-[#10171f]/95">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-small px-default py-small sm:flex-row sm:items-center sm:justify-between md:px-medium">
          <Link href="/" aria-label="Voltar para a página inicial">
            <Image
              src={logo}
              alt="ORACCLUM LOGO"
              className="h-auto w-[190px] sm:w-[240px]"
              priority
            />
          </Link>
          <Link
            href="/"
            className="w-fit rounded-full border border-[#5ec899]/60 px-small py-extra-small text-small font-normal text-[#5ec899] transition-colors hover:bg-[#5ec899] hover:text-[#0f171f]"
          >
            Voltar para o site
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-5xl px-default py-large md:px-medium md:py-extra-large">
        <section className="mb-large rounded-extra-large border border-[#5ec899]/20 bg-[#10171f] p-default shadow-2xl shadow-black/20 md:p-large">
          <p className="mb-small text-small font-normal uppercase tracking-[0.25em] text-[#5ec899]">
            Versão: 24 de novembro de 2025
          </p>
          <h1 className="font-title text-[2rem] font-strong leading-title text-white md:text-[3rem]">
            Política de Privacidade da Plataforma ORACCLUM
          </h1>
          <p className="mt-default max-w-4xl text-medium leading-content text-[#e8e6e2]/85">
            Esta Política de Privacidade tem por objetivo informar ao
            LICENCIADO e aos usuários da Plataforma ORACCLUM sobre como seus
            dados pessoais são coletados, utilizados, armazenados e protegidos,
            em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de
            Dados Pessoais - LGPD).
          </p>
        </section>

        <div className="space-y-medium">
          {policySections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-large border border-white/10 bg-white/[0.03] p-default md:p-medium"
            >
              <h2 className="font-title text-large font-strong leading-title text-white md:text-[1.75rem]">
                <span className="mr-extra-small text-[#5ec899]">
                  {index + 1}.
                </span>
                {section.title}
              </h2>

              <div className="mt-default space-y-small text-content leading-content text-[#e8e6e2]/85">
                {section.clauses.map((clause) => (
                  <div key={clause.marker} className="space-y-extra-small">
                    <p>
                      <span className="font-normal text-[#5ec899]">
                        {clause.marker}
                      </span>{" "}
                      {clause.text}
                    </p>

                    {clause.subItems ? (
                      <ul className="space-y-extra-small pl-default">
                        {clause.subItems.map((item) => (
                          <li key={`${clause.marker}-${item.marker}`}>
                            <span className="font-normal text-[#5ec899]">
                              {item.marker}
                            </span>{" "}
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-medium rounded-large border border-[#5ec899]/20 bg-[#10171f] p-default md:p-medium">
          <h2 className="font-title text-large font-strong leading-title text-white md:text-[1.75rem]">
            Instruções para exclusão de dados
          </h2>
          <p className="mt-default text-content leading-content text-[#e8e6e2]/85">
            Se você deseja remover os dados da sua conta na plataforma
            ORACCLUM, consulte a página dedicada com o passo a passo completo.
          </p>
          <Link
            href="/data-deletion"
            className="mt-default inline-flex w-fit rounded-full border border-[#5ec899]/60 px-small py-extra-small text-small font-normal text-[#5ec899] transition-colors hover:bg-[#5ec899] hover:text-[#0f171f]"
          >
            Ver instruções de exclusão de dados
          </Link>
        </section>
      </article>
    </main>
  );
}
