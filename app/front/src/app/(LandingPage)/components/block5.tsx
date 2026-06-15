import Image from "next/image";

import symbolOracclum from "@/assets/logos/symbolOracclum.svg";
import phone from "@/assets/images/mockup_iphone.png";

interface Props {
  id: string;
}

export function About({ id }: Props) {
  return (
    <section
      id={id}
      className="flex flex-col items-center justify-center px-medium py-large bg-[#e8e6e2] font-content md:px-large snap-start"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <Image
          src={symbolOracclum}
          alt="Símbolo Oracclum"
          className="w-24 mx-auto"
        />

        <h2 className="text-title font-title font-normal mt-medium mb-default lg:mb-extra-large text-[#10171f]">
          SOBRE O ORACCLUM
        </h2>
      </div>

      <div className="w-full flex justify-between items-center gap-large flex-col-reverse lg:flex-row lg:gap-medium">
        <div className="relative flex flex-col w-full lg:w-[70%] z-[1] before:content-[''] before:absolute before:-top-[12.5%] before:-left-[25%] before:w-[140%] before:h-[120%] before:bg-[#e5e3df] before:rounded-full before:-z-[1] before:hidden xl:before:block">
          <h3 className="text-subtitle font-normal mb-medium text-[#10171f]">
            Posicionamento estratégico
          </h3>
          <p className="text-content text-[#243446]">
            Para o mercado de marketing digital, que busca facilidade para
            analisar e otimizar suas campanhas, evitar desperdício através da
            alocação correta de recursos e assim escalar sua operação.
          </p>
          <p className="text-content mt-medium text-[#243446]">
            O Oracclum oferece um sistema de coleta de dados profissional e um
            serviço de integração personalizado. Mais que qualquer outro
            competidor, o Oracclum está próximo dos seus clientes, conhece suas
            necessidades e assim alcança o melhor UX/UI do mercado.
          </p>

          <div className="flex gap-extra-large items-start w-full mt-medium">
            <div
              className="relative w-[6px] bg-[#c3d1e0] self-stretch my-medium
                            before:content-[''] before:absolute before:top-0 before:left-0 before:w-[30px] before:h-[6px] before:bg-[#c3d1e0]
                            after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[6px] after:bg-[#c3d1e0]"
            />

            <div className="flex flex-col w-full">
              <h3 className="text-subtitle font-normal text-[#10171f]">
                Missão
              </h3>
              <p className="text-content text-[#243446]">
                A captura integral e o tratamento refinado dos dados a fim de
                otimizar a alocação de recursos no marketing digital.
              </p>

              <h3 className="text-subtitle font-normal mt-medium text-[#10171f]">
                Visão
              </h3>
              <p className="text-content text-[#243446]">
                Ser uma empresa digital nacional, com reconhecimento e atuação
                globais. Com excelência em serviços ao cliente, produtos e
                processos administrativos.
              </p>

              <h3 className="text-subtitle font-normal mt-medium text-[#10171f]">
                Propósito
              </h3>
              <p className="text-content text-[#243446]">
                Otimização eficiente e escalabilidade.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[60%] flex justify-center items-center">
          <Image
            src={phone}
            alt="Celular"
            className="max-w-full w-[310px] h-[470px]  sm:w-[340px] sm:h-[500px] lg:w-[420px] lg:h-[600px]"
          />
        </div>
      </div>
    </section>
  );
}
