// components/CardContainer.tsx

import { ReactNode } from "react";
type CardContainerProps = {
  children: ReactNode;
};

export default function FilterCard({ children }: CardContainerProps) {
  return (
    <div
      className="bg-bg-navbar
      border-2 border-solid border-border-highlight rounded-extra-large p-small py-extra-small md:py-small mx-small md:mx-0 flex flex-col gap-3 text-text-primary"
    >
      {children}
    </div>
  );
}
