"use client";

import Image from "next/image";
import OracclumLogo from "../../assets/logos/logoOracclum.png";
import NavLink from "./navLink";
import { Icon } from "../Icon/iconComponent";
import React, { useEffect, useState } from "react";
import NavMenu from "./navMenu";
import { getAccountSession } from "@/app/main/configs/accountActions";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await getAccountSession();
      if (result.success && result.session?.userData) {
        const userData = typeof result.session.userData === "string"
          ? JSON.parse(result.session.userData)
          : result.session.userData;
        setIsAdmin(userData.user_type === "admin");
      }
    })();
  }, []);

  return (
    <nav
      className="w-full flex items-center md:px-large bg-bg-navbar text-text-main 
                rounded-t-extra-large md:rounded-t-none md:rounded-br-extra-large border-t-2 border-bg-primary md:dark:border-b-1 md:border-t-0 md:rounded-bl-0 dark:border-border-highlight z-10"
    >
      <div className="hidden lg:flex items-center pr-small">
        <Image
          src={OracclumLogo}
          alt="Oracclum Logo"
          width={200}
          height={200}
          className="w-[24px]"
          priority
        />
      </div>

      <div className="hidden md:flex gap-small items-center flex-grow">
        <NavLink href="/main/integration">Integrações</NavLink>
        <NavLink href="/main/campaign">Campanhas</NavLink>
        <NavLink href="/main/configs">Configurações</NavLink>
        {isAdmin && <NavLink href="/main/admin/users">Admin</NavLink>}

        <div className="flex flex-grow justify-end">
          <Icon
            type="menu"
            color="primary"
            size="medium"
            onClickAction={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>

        <div className="flex md:hidden justify-center w-full items-center gap-small">
          <NavLink href="/main/campaign">Campanhas</NavLink>
          <NavLink href="/main/integration">Integrações</NavLink>
          {isAdmin && <NavLink href="/main/admin/users">Admin</NavLink>}
          <NavMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>

        <div className="flex md:hidden pr-default">
          <Icon
            type="menu"
            color="primary"
            size="medium"
            onClickAction={() => setIsOpen(!isOpen)}
          />
        </div>

    </nav>
  );
}
