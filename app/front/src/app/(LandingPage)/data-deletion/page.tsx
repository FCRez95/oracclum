import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logos/logoOracclumTextRight.svg";

export const metadata: Metadata = {
  title: "Exclusão de Dados | Oracclum",
  description:
    "Instruções para exclusão de dados da conta na plataforma ORACCLUM.",
};

const deletionSteps = [
  "Acesse a página Configurações dentro da plataforma.",
  "Navegue até a seção Preferências.",
  "Clique na opção Deletar meus dados.",
  "Confirme a ação para prosseguir com a exclusão.",
];

export default function DataDeletionPage() {
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
            Instruções públicas
          </p>
          <h1 className="font-title text-[2rem] font-strong leading-title text-white md:text-[3rem]">
            Instruções para Exclusão de Dados
          </h1>
          <p className="mt-default max-w-4xl text-medium leading-content text-[#e8e6e2]/85">
            Esta página explica como usuários da plataforma ORACCLUM podem
            solicitar a remoção dos dados da própria conta usando o fluxo já
            disponível dentro do ambiente autenticado.
          </p>
        </section>

        <section className="rounded-large border border-white/10 bg-white/[0.03] p-default md:p-medium">
          <h2 className="font-title text-large font-strong leading-title text-white md:text-[1.75rem]">
            Passo a passo
          </h2>

          <ol className="mt-default space-y-small pl-default text-content leading-content text-[#e8e6e2]/85">
            {deletionSteps.map((step, index) => (
              <li key={step}>
                <span className="font-normal text-[#5ec899]">{index + 1}.</span>{" "}
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-medium rounded-large border border-[#5ec899]/20 bg-[#10171f] p-default md:p-medium">
          <h2 className="font-title text-large font-strong leading-title text-white md:text-[1.75rem]">
            Resultado da ação
          </h2>
          <p className="mt-default text-content leading-content text-[#e8e6e2]/85">
            Após a confirmação, todos os dados relacionados àquela conta serão
            descartados automaticamente e a conta será redefinida como uma
            conta nova.
          </p>
        </section>
      </article>
    </main>
  );
}
