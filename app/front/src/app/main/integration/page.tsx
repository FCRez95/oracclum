"use server";

import { Suspense } from "react";
import IntegrationPage from "./components/integrationPage";
import { Loading } from "@/components/Loading";

const integrations = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <IntegrationPage />
    </Suspense>
  );
}

export default integrations;
