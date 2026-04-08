"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/providers/app-provider";
import { Sidebar } from "./sidebar";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isLoadingAuth } = useAppStore();
  const pathname = usePathname();

  // Na página de login, não exibir sidebar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-v4-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-[var(--color-v4-red)] rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Validando sessão...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-v4-bg)]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
};
