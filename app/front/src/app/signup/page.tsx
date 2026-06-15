import Image from "next/image";
import logoOracclumText from "@/assets/logos/logoOracclumText.svg";
import logoOracclum from "@/assets/logos/logoOracclum.png";
import ClientSignupPage from "./clientSide";
import BackToLandingLink from "./backToLandingLink";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-bg-navbar px-small py-large md:px-medium">
      <div className="flex w-full max-w-4xl flex-col items-center gap-medium">
        <div className="flex w-full max-w-2xl justify-start">
          <Suspense fallback={<div>Loading...</div>}>
            <BackToLandingLink />
          </Suspense>
        </div>
        <Image src={logoOracclum} alt="Logo" className="w-24 md:w-36" />
        <Image src={logoOracclumText} alt="Text Logo" className="w-80 md:w-112" />
        <section className="w-full max-w-2xl rounded-[28px] border border-border-highlight/45 bg-[#16202a] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <ClientSignupPage />
        </section>
      </div>
    </main>
  );
}
