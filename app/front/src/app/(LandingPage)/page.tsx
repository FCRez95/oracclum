import { PhoneSection } from "./components/block3";
import { Block1 } from "./components/block1";

import { BenefitsSection } from "./components/block2";
import { IntegrationSection } from "./components/block4";
import { About } from "./components/block5";
import { TrialSection } from "./components/trialSection";
import { FooterSection } from "./components/Block6/FooterSection";
import { Suspense } from "react";
import Loading from "@/components/Loading";

export default function Home() {
  return (
    <div className="h-screen overflow-y-scroll">
      <Block1 id={"inicio"} />
      <BenefitsSection id="benefits" />
      <PhoneSection />
      <IntegrationSection id="integration" />
      <Suspense fallback={<Loading />}>
        <TrialSection />
      </Suspense>
      <About id="about" />
      <FooterSection />
    </div>
  );
}
