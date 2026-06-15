"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon/iconComponent";
import { landingUrl } from "@/config/appConfig";

const BackToLandingLink = () => {
  const searchParams = useSearchParams();

  const href = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${landingUrl}?${queryString}` : landingUrl;
  }, [searchParams]);

  return (
    <a
      href={href}
      className="inline-flex items-center gap-extra-small text-medium text-[rgba(232,230,226,0.72)] transition hover:text-bg-primary"
    >
      <Icon type="arrowLeft" size="small" color="primary" />
      <span>Voltar</span>
    </a>
  );
};

export default BackToLandingLink;
