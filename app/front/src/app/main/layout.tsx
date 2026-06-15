import NavBar from "@/components/navBar/navBar";
import { ReactNode } from "react";

export default function Campaign({ children }: { children: ReactNode }) {
  return (
    <div className="flex md:flex-col flex-col-reverse h-dvh max-h-dvh bg-bg-app font-content overflow-hidden">
      <NavBar />
      {children}
    </div>
  );
}
