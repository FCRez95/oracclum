import { ReactNode } from "react";

interface SideBarProps {
  children: ReactNode;
}

export default function SideBar({ children }: SideBarProps) {
  return (
    <div className="flex flex-col-reverse md:flex-col items-center p-small bg-bg-card text-content text-text-main text-left grow w-full md:w-[25%] md:max-w-[300px]">
        {children}
    </div>
  );
}
