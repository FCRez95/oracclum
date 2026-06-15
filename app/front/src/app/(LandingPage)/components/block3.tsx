import Image from "next/image";
import symbolOracclum from "@/assets/logos/symbolOracclum.svg";
import mockupTelas from "@/assets/images/mockup_cel_pc_ipad.png";

const title = `TENHA O CONTROLE DA SUAS 
OPERAÇÕES NA PALMA DA SUA MÃO.`;

const text = `Para o mercado de marketing digital, que busca facilidade para analisar e otimizar suas campanhas, evitar desperdício atraves da alocação correta de recursos e assim escalar sua operação.
O Oracclum oferece um sistema de coleta de dados profissional e um serviço de integração personalizado. Mais que qualquer outro competidor, o Oracclum está próximo dos seus clientes, conhece suas necessidades e assim alcançou a melhor UX/Ui do mercado.`;

export const PhoneSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center w-full min-h-screen bg-[#e8e6e2] snap-start px-medium py-large">
      {/* Logo no topo */}
      <Image
        src={symbolOracclum}
        alt="Oracclum Logo"
        className="w-[80px] md:w-[100px] mb-default z-10"
      />

      {/* Título */}
      <h2 className="text-center font-title text-subtitle text-[#10171f] font-normal whitespace-pre-line max-w-[700px] z-10">
        {title}
      </h2>

      {/* Mockup + fundo arredondado */}
      <div className="relative flex items-center justify-center w-full mb-extra-small md:mb-0 md:mt-[-30px]">
        {/* Fundo circular */}
        <div
          className="absolute left-1/2 top-1/2
                    -translate-x-1/2 -translate-y-1/2 
                    md:w-[800px] md:h-[800px]
                    lg:w-[900px] lg:h-[900px] 
                    2xl:w-[1000px] 2xl:h-[1000px] rounded-full 
                    bg-[#e5e3df] hidden lg:block"
        />

        {/* Mockup sempre centralizado em cima */}
        <Image
          src={mockupTelas}
          alt="Telas"
          className="relative z-10 max-w-full"
        />
      </div>

      {/* Texto descritivo */}
      <p className="text-center md:text-left font-content text-content text-[#243446] max-w-[700px] whitespace-pre-line mt-[-10px] z-10">
        {text}
      </p>
    </section>
  );
};
