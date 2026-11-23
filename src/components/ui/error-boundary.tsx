"use client";

import React from "react";
import { WarningCircle, ArrowsClockwise } from "phosphor-react";

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "An unexpected interface error occurred.",
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Application ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--sys-surface-canvas)] text-[var(--sys-on-surface)] flex items-center justify-center p-6">
          <div className="tonal-card max-w-lg w-full p-8 space-y-5">
            <div className="flex items-center gap-3 text-[var(--text-feedback-error)]">
              <WarningCircle size={24} weight="fill" />
              <h2 className="text-lg font-bold text-[var(--sys-on-surface)]">
                Something went wrong
              </h2>
            </div>
            <p className="text-sm text-[var(--sys-on-surface-secondary)] leading-relaxed">
              The workbench encountered an unexpected error while syncing data. Your portfolio
              settings remain safely protected.
            </p>
            <div className="p-3 rounded-xl bg-[var(--sys-surface-lowest)] border border-[var(--sys-outline-variant)] font-mono text-xs text-[var(--sys-on-surface-tertiary)] break-words max-h-32 overflow-y-auto">
              {this.state.message}
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="min-h-[40px] px-4 py-2 rounded-[var(--sys-radius-md)] bg-[var(--sys-primary)] text-[var(--sys-on-primary)] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowsClockwise size={15} weight="bold" />
              <span>Reload Workbench</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
