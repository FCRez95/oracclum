"use client";
import Image from "next/image";
import Link from "next/link";

import bannerOracclum from "@/assets/images/banner_oracclum.png";
import symbolOracclum from "@/assets/logos/symbolOracclum.svg";
import { useSearchParams } from "next/navigation";

export function TrialSection() {
  const searchParams = useSearchParams()
  const qs = searchParams?.toString()
  const href = qs ? `/login?${qs}` : "/login"
  
  return (
    <section id="trial" className="bg-[#10171f] px-medium md:py-0 py-large font-content md:px-large snap-start">
      <div className="relative overflow-hidden rounded-[32px] bg-[#10171f] lg:mx-[calc(50%-50vw)] lg:rounded-none items-end">
        <Image
          src={bannerOracclum}
          alt="Banner Oracclum"
          className="hidden h-auto w-full lg:block"
          priority={false}
        />

        <div className="relative z-10 flex flex-col justify-center px-0 py-0 lg:px-medium lg:py-large sm:px-large lg:absolute lg:inset-0 lg:max-w-[45%] justify-self-end lg:right-[150px] right-0">
          <Image
            src={symbolOracclum}
            alt="Símbolo Oracclum"
            className="w-24 mx-auto mb-medium lg:hidden"
          />

          <p className="font-title text-content tracking-[2px] text-[#7fd3aa]">
            DEMO DE PORTFÓLIO
          </p>
          <h2 className="mt-small text-title font-title font-normal text-[#f5efe4]">
            Explore o Oracclum com dados simulados e sem backend obrigatório.
          </h2>
          <p className="mt-small max-w-[560px] text-content leading-relaxed text-[#d6dee8]">
            Entre no modo demo para navegar por campanhas, anúncios,
            integrações e métricas preparadas para apresentar o fluxo principal
            da aplicação.
          </p>
          <Link
            href={href}
            className="mt-large inline-flex items-center justify-center rounded-full bg-[#5ec899] px-large py-small text-medium text-[#10171f] transition hover:bg-[#4db483] lg:w-[350px] w-full"
          >
            ABRIR DEMO
          </Link>
        </div>
      </div>
    </section>
  );
}
