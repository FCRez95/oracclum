import type { Metadata, Viewport } from "next";
import "./globals.css";
import Provider from "./provider";

export const metadata: Metadata = {
  title: "Oracclum",
  description: "Tracker de campanhas de marketing",
  applicationName: "Oracclum",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Oracclum",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-content antialiased">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
