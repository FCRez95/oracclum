import Image from "next/image";

import mockupTelas from "@/assets/images/mockup_telas.png";
import symbolOracclum from "@/assets/logos/symbolOracclum.svg";

interface Props {
  id: string;
}

export function BenefitsSection({ id }: Props) {
  return (
    <section
      id={id}
      className="flex flex-col items-center px-medium pb-large bg-[#e8e6e2] font-content md:px-large snap-start"
    >
      <Image src={mockupTelas} alt="Celular" className="w-[400px] sm:w-[1000px]" />

      <div className="w-full flex justify-center items-center md:mt-[-50px]">
        <div className="flex items-center gap-5 sm:min-w-[500px]">
          <Image
            src={symbolOracclum}
            alt="Símbolo Oracclum"
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
          />
          <h1 className="text-[#10171f] text-title font-title uppercase font-normal sm:text-title">
            Conheça o Oracclum
          </h1>
        </div>

        <div className="hidden sm:block w-full h-[2px] bg-[#c3d1e0]" />
      </div>

      <div className="w-full flex justify-center items-start gap-large md:gap-extra-large flex-col md:flex-row mt-large">
        <div className="flex flex-col items-start">
          <h2 className="text-subtitle text-[#10171f] font-light">
            Maximize Seus Resultados
          </h2>
          <p className="text-content font-detail text-[#243446] mt-medium">
            Com o Oracclum, você não precisa mais adivinhar. Nosso poderoso
            trackeador de clicks oferece insights em tempo real sobre o
            desempenho das suas campanhas. Deixe a incerteza para trás e comece
            a tomar decisões informadas para maximizar seus resultados.
          </p>
        </div>

        <div className="flex flex-col items-start">
          <h2 className="text-subtitle text-[#10171f] font-light">
            Otimização Contínua
          </h2>
          <p className="text-content font-detail text-[#243446] mt-medium">
            O mundo do marketing digital é dinâmico, e suas campanhas devem
            acompanhar o ritmo. Com o Oracclum, você pode otimizar suas
            estratégias em tempo real. Identifique oportunidades, ajuste sua
            abordagem e mantenha-se à frente da concorrência.
          </p>
        </div>

        <div className="flex flex-col items-start">
          <h2 className="text-subtitle text-[#10171f] font-light">
            Poderoso em Resultados
          </h2>
          <p className="text-content font-detail text-[#243446] mt-medium">
            Não importa o seu nível de experiência em marketing digital, nossa
            plataforma foi projetada para ser intuitiva e acessível. Comece a
            rastrear seus clicks em poucos minutos e experimente o impacto
            imediato na sua performance.
          </p>
        </div>
      </div>
    </section>
  );
}
