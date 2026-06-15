"use server";
import Image from "next/image";
import { Card } from "@/components/Card";
import logoOracclumText from "@/assets/logos/logoOracclumText.svg";
import logoOracclum from "@/assets/logos/logoOracclum.png";
import ClientLoginPage from "./clientSide";

export default async function LoginPage() {
  return (
    <main className="bg-bg-navbar min-h-[100dvh] h-[100dvh] overflow-hidden flex flex-col items-center justify-center gap-medium font-extra-small md:font-content">
      <Image src={logoOracclum} alt="Logo" className="w-24 md:w-36" />
      <Image src={logoOracclumText} alt="Text Logo" className="w-80 md:w-112" />
      <Card borderType="success" paddingType="medium">
        <ClientLoginPage></ClientLoginPage>
      </Card>
    </main>
  );
}
