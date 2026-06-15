// components/SideMenu.tsx
"use client";

import { createPortal } from "react-dom";
import NavLink from "./navLink";
import { Icon } from "../Icon/iconComponent";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/logoutActions";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavMenu({ isOpen, onClose }: SideMenuProps) {
  const router = useRouter();

  async function handleLogout() {
    const success = await logoutAction();
    if (success) {
      router.push("/");
    }
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[99] h-screen" onClick={onClose} />
      <div
        className={`fixed top-0 right-0 h-full w-[75%] md:w-[200px] bg-bg-navbar shadow-lg z-[9999]
                    transform transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-border-highlight md:hidden">
          <h2 className="text-lg font-semibold text-text-main">Menu</h2>
          <Icon
            type="close"
            color="primary"
            size="medium"
            onClickAction={onClose}
          />
        </div>

        <div className="flex flex-col justify-between items-center gap-medium mt-large">
          <div onClick={onClose} className="md:hidden">
            <NavLink href="/main/configs">Configurações</NavLink>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-small font-content text-text-primary no-underline text-base px-small py-1 transition-colors hover:cursor-pointer"
          >
            <Icon type="logout" color="primary" size="medium" />
            Logout
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
