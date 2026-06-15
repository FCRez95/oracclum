"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/logos/logoOracclumTextRight.svg";

const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

interface NavbarClickableProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const NavbarClickable: React.FC<NavbarClickableProps> = ({
  children,
  onClick,
  className = "",
}) => {
  const baseClasses =
    " font-title h-fit relative mx-2.5 text-[19px] text-[#ffffff] cursor-pointer hover:text-[#5ec899] transition-colors duration-300 pr-2.5 pb-[3px]";
  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

interface NavbarLowerWidthWrapperProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

import React from "react";

interface NavbarLowerWidthWrapperProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

const NavbarLowerWidthWrapper: React.FC<NavbarLowerWidthWrapperProps> = ({
  children,
  isOpen,
  className = "",
}) => {
  const baseClasses = `
    font-title
    relative
    flex-col
    z-2
    // Apply transitions to opacity and right
    transition-[opacity,right] duration-800 ease-in-out

    h-fit pt-[60px] pb-2.5 bg-[#5b6f6f28]

    top-0 max-lg:bottom-0 max-lg:w-[200px]
    max-lg:flex            // Always flex on max-lg, control visibility with opacity/pointer-events
    max-lg:align-end      

    lg:contents            
    lg:static              
    lg:flex-row            
    lg:h-[100px]           
    lg:justify-between     
    lg:items-stretch       
  `;

  const dynamicClasses = isOpen
    ? "right-0 opacity-100 pointer-events-auto" // When open: fully visible, clickable
    : "right-[-300px] opacity-0 pointer-events-auto"; // When closed: hidden, not clickable

  const combinedClasses = `${baseClasses} ${dynamicClasses} ${className}`;

  return <div className={combinedClasses}>{children}</div>;
};

interface IconMenuProps {
  onClick: () => void;
  className?: string;
}

const IconMenu: React.FC<IconMenuProps> = ({ onClick, className = "" }) => {
  const baseClasses = `
    absolute top-6 right-5
    text-transparent        
    z-[100]                 
    lg:hidden               
    max-lg:block            
    max-lg:text-white       
    max-lg:cursor-pointer   
  `;

  const combinedClasses = `${baseClasses} ${className}`;

  return (
    <div onClick={onClick} className={combinedClasses}>
      <svg
        style={{ fontSize: "40px" }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-10"
      >
        <path
          fillRule="evenodd"
          d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
};

const NavbarComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams()
  const qs = searchParams?.toString()
  const href = `/signup?${qs}`
  return (
    <>
      <nav
        className="
          z-3
          relative
          flex
          w-full
          box-border
          flex-row
          overflow-x-hidden\
          justify-between
          h-fit
          items-stretch
          lg:h-[100px]
          font-title
        "
      >
        <Image
          src={logo}
          onClick={() => router.push("/")}
          alt="ORACCLUM LOGO"
          className="
            cursor-pointer
            ml-[3%]
            max-w-sm:hidden
            w-[180px] h-[100px]
            sm:w-[250px] sm:h-[100px]
          "
        />
        <IconMenu onClick={() => setIsOpen((isOpen) => !isOpen)} />
        <NavbarLowerWidthWrapper isOpen={isOpen}>
          <hr className="border-t border-solid border-[#5ec899] w-full opacity-30 lg:hidden " />
          <section className="font-title relative top-[40%] flex max-lg:flex-col max-lg:items-end max-lg:top-[5%] lg:flex-row ">
            <NavbarClickable onClick={() => scrollToElement("inicio")}>
              Inicio
            </NavbarClickable>
            <NavbarClickable onClick={() => scrollToElement("benefits")}>
              Benefícios
            </NavbarClickable>
            <NavbarClickable onClick={() => scrollToElement("integration")}>
              Integração
            </NavbarClickable>
            <NavbarClickable onClick={() => scrollToElement("about")}>
              Sobre
            </NavbarClickable>
            <NavbarClickable onClick={() => scrollToElement("plans")}>
              Contato
            </NavbarClickable>
          </section>
          <hr className="border-t border-solid border-[#5ec899] w-full opacity-30 lg:hidden " />
          <section className="font-title relative top-[40%] flex max-lg:flex-col max-lg:items-end max-lg:top-[5%] lg:flex-row">
            <NavbarClickable
              className={"text-[18px] underline"}
              onClick={() => router.push(href)}
            >
              Cadastro
            </NavbarClickable>
            <NavbarClickable
              className={"text-[18px] underline"}
              onClick={() => router.push("/login")}
            >
              Login
            </NavbarClickable>
          </section>
        </NavbarLowerWidthWrapper>
      </nav>
    </>
  );
};
export default NavbarComponent;
