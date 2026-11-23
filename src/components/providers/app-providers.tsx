"use client";

import React, { useEffect } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { AdminConsoleModal } from "@/components/auth/admin-console-modal";

function isThirdPartyExtensionError(filename?: string, message?: string): boolean {
  const file = (filename || "").toLowerCase();
  if (
    file.startsWith("chrome-extension://") ||
    file.startsWith("moz-extension://") ||
    file.startsWith("safari-extension://") ||
    file.startsWith("safari-web-extension://")
  ) {
    return true;
  }
  const msg = (message || "").toLowerCase();
  return msg.includes("cannot set property ethereum of #<window>");
}

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Prevent third-party browser wallet extensions (e.g. window.ethereum getter conflicts)
  // from bubbling into the application's runtime error overlay.
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (isThirdPartyExtensionError(event.filename, event.message)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = reason instanceof Error ? reason.message : String(reason || "");
      const stack = reason instanceof Error ? reason.stack || "" : "";
      if (isThirdPartyExtensionError(stack, msg) || stack.includes("chrome-extension://")) {
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleWindowError, true);
    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);
    return () => {
      window.removeEventListener("error", handleWindowError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            {children}
            <AuthModal />
            <AdminConsoleModal />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
