"use client";

import Link from "next/link";

export const FooterSection = () => {
  return (
    <footer
      className="flex flex-col md:flex-row justify-between items-center gap-default p-default font-light bg-[#10171f] text-[#e8e6e2]
      md:items-start md:p-extra-medium w-full md:text-[1.25rem] font-content snap-start"
    >
      <div className="text-center md:text-left ">
        <p>Oracclum Portfolio Project</p>
        <p>Frontend demo showcase</p>
      </div>

      <div className="flex flex-col items-center text-[#e8e6e2]">
        <Link href="/policies" className="underline cursor-pointer">
          Políticas de Privacidade
        </Link>
      </div>

      <div className="text-center md:text-right">
        <p>Operação comercial encerrada</p>
        <p>Modo demo disponível</p>
      </div>
    </footer>
  );
};
