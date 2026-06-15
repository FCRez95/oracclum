import Image from "next/image";
import IconSignUp from "@/assets/icons/iconeCadastro.svg";
import IconPresentation from "@/assets/icons/iconeApresentacao.svg";
import IconData from "@/assets/icons/iconeColetaDeDados.svg";
import IconDevelopment from "@/assets/icons/iconeDesenvolvimento.svg";

import LogoTaboola from "@/assets/logos/logoTaboolaBlue.png";
import LogoMeta from "@/assets/logos/logoMeta.png";
import LogoPayt from "@/assets/logos/logoPayt.svg";
import LogoYampi from "@/assets/logos/logo-yampiLP2.png";
import LogoUnicopag from "@/assets/logos/logo-unicopagLP2.webp";
import LogoCartpanda from "@/assets/logos/logoCartpanda.png";
import symbolOracclum from "@/assets/logos/symbolOracclum.svg";
import { MessageCircleQuestion } from "lucide-react";

interface Props {
  id: string;
}

export function IntegrationSection({ id }: Props) {
  const steps = [
    {
      icon: IconSignUp,
      title: "1. Crie sua conta",
      text: "Entre no modo demo em poucos segundos e explore uma conta preenchida com campanhas, anúncios e dados simulados. Sem cadastro real ou backend obrigatório, você já acessa a experiência principal do Oracclum.",
    },
    {
      icon: IconPresentation,
      title: "2. Ative sua conta",
      text: "Aceite os termos de uso para ativar sua conta instantaneamente. Tudo foi pensado para que você possa começar a usar a plataforma de forma rápida, segura e totalmente transparente.",
    },
    {
      icon: IconData,
      title: "3. Conecte seu provedor de anúncios",
      text: "Acesse a página de integrações e conecte seus provedores de anúncios com poucos cliques. A conexão é simples, segura e leva apenas alguns minutos.",
    },
    {
      icon: IconDevelopment,
      title: "4. Crie sua campanha e integre seu funil",
      text: "Crie sua campanha dentro do Oracclum, integre seu funil de vendas e comece a acompanhar seus dados imediatamente. Nossa estrutura foi desenhada para que você tenha total controle e visibilidade desde o primeiro clique até a conversão.",
    },
  ];

  const supportContent = {
    title: "Explore como o fluxo funciona.",
    text: "O modo demo apresenta os principais caminhos da plataforma com dados fictícios, incluindo campanhas, integrações e análises. Ele foi preparado para avaliação de portfólio sem depender da operação comercial original.",
  };

  return (
    <section
      id={id}
      className="flex flex-col items-center justify-center w-full px-medium py-large bg-[#e4e2dd] font-content md:px-large snap-start"
    >
      <div className="max-w-[1400px] text-center">
        <Image
          src={symbolOracclum}
          alt="Símbolo Oracclum"
          className="w-24 mx-auto"
        />

        <h2 className="text-title font-title font-normal mt-medium mb-extra-large text-[#10171f]">
          PRIMEIROS PASSOS
        </h2>

        <div className="grid gap-large lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] lg:items-start">
          <div className="flex flex-col gap-large">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-medium text-left bg-[#e8e6e2] pr-0 rounded-[150px_150px_100px_100px] sm:rounded-full sm:pr-large"
              >
                <div className="bg-[#ebe9e5] flex items-center justify-center p-large rounded-[150px_150px_70px_70px] sm:rounded-full">
                  <Image src={step.icon} alt={step.title} className="max-w-24" />
                </div>

                <div className="flex flex-col px-medium pb-large sm:px-medium sm:py-small">
                  <h3 className="text-subtitle font-title font-normal mt-small text-[#10171f]">
                    {step.title}
                  </h3>
                  <p className="text-content font-detail mt-medium mb-small text-[#243446]">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <aside className="self-start rounded-[100px] bg-[#10171f] px-large py-large text-left shadow-[0_20px_60px_rgba(16,23,31,0.12)] lg:sticky lg:top-8">
            <div className="flex items-center gap-small text-[#c9d6e3]">
              <MessageCircleQuestion size={22} strokeWidth={1.8} className="text-text-primary" />
              <p className="font-title text-content tracking-[4px] lowercase text-text-primary">
                demo
              </p>
            </div>
            <h3 className="mt-small text-title font-title font-normal text-text-primary leading-normal">
              {supportContent.title}
            </h3>
            <p className="mt-medium text-content font-detail leading-relaxed">
              {supportContent.text}
            </p>
          </aside>
        </div>

        <div className="text-center">
          <p className="font-title text-content font-detail tracking-[4px] lowercase mt-large text-[#243446]">
            integrações
          </p>
          <div className="flex justify-center gap-large mt-medium flex-wrap">
            <Image src={LogoTaboola} alt="Taboola" height={42} />
            <Image src={LogoMeta} alt="Meta" height={42} />
            <Image src={LogoPayt} alt="Payt" height={42} />
            <Image src={LogoCartpanda} alt="Cartpanda" height={42} />
            <Image src={LogoYampi} alt="Yampi" height={42} />
            <Image src={LogoUnicopag} alt="Unicopag" height={36} className="py-[3px] px-[10px] rounded-[10px] bg-[#10171f]"/>
          </div>
          <p className="font-title text-small font-detail tracking-[3px] lowercase mt-medium text-[#243446] w-full lg:w-[50%] justify-center mx-auto">
            A vitrine de integrações representa o escopo original do produto e pode ser explorada com dados simulados no modo demo.
          </p>
        </div>
      </div>
    </section>
  );
}
