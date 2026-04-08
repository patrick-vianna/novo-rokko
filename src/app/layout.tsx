import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "@/providers/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "V4 Rokko",
  description: "Dashboard de onboarding de clientes — V4 Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" />
        </AppProvider>
      </body>
    </html>
  );
}
