import Image from "next/image";

import NavbarComponent from "./NavbarComponent";
import CallToActionComponent from "./CallToActionComponent";
import DemoButton from "./DemoButton";
import bgImg from "@/assets/images/globalBusinessBackground.jpg";
import { Suspense } from "react";
import Loading from "@/components/Loading";

interface Props {
  id: string;
}

export const Block1 = ({}: Props) => {
  return (
    <>
      <section className="relative w-screen min-h-screen flex flex-col items-center overflow-clip snap-start">
        <Suspense fallback={<Loading />}>
          <NavbarComponent />
        </Suspense>
        <Image
          src={bgImg}
          alt=""
          className="h-screen w-full grayscale-50 object-cover absolute top-0 left-0 z-1"
        />
        <div className="bg-[#2a3c51] mix-blend-multiply w-screen h-screen absolute z-2" />
        <CallToActionComponent />
        <DemoButton />
      </section>
    </>
  );
};
