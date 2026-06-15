'use client';

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import PwaRegistration from "@/components/PwaRegistration";

export default function Provider({ children, ...props }: ThemeProviderProps) {

  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" {...props}>
      <PwaRegistration />
      {children}
    </NextThemesProvider>
  );
}
