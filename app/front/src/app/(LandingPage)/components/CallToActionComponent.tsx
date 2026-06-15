"use client";

import RightTitleLine from "@/assets/decorators/linhaDoTituloDireita.svg";
import LeftTitleLine from "@/assets/decorators/linhaDoTituloEsquerda.svg";
import Image from "next/image";

const CallToActionComponent = () => {
  const scrollToTrialSection = () => {
    const trialSection = document.getElementById("trial");
    if (trialSection) {
      trialSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="z-3 font-title font-light flex absolute top-1/2 -translate-y-1/2 gap-10">
      <Image
        alt=""
        className=" max-w-full overflow-x-hidden h-min block self-center"
        src={LeftTitleLine}
      />
      <section className="z-3 font-title flex justify-center flex-col items-center w-80 h-100 text-[#5EC899]">
        <h1 className=" text-[76px] ">ANALISE</h1>
        <h2 className="text-[28px] text-center">DADOS VERDADEIROS</h2>
        <p className="text-[16px] text-white text-center">
          conheça o impacto de um <br />
          trackeamento de qualidade
          <br />
          na sua operação{" "}
        </p>
        <button
          type="button"
          onClick={scrollToTrialSection}
          className="mt-20 rounded-full bg-[#5EC899] px-medium py-small text-[18px] text-[#10171f] transition hover:bg-[#4db483]"
        >
          INICIAR DEMO
        </button>
      </section>
      <Image
        alt=""
        className="z-3 max-w-full overflow-x-hidden h-min block self-center"
        src={RightTitleLine}
      />
    </section>
  );
};
export default CallToActionComponent;
