"use client";

import React from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { AdminConsoleModal } from "@/components/auth/admin-console-modal";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          {children}
          <AuthModal />
          <AdminConsoleModal />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};
