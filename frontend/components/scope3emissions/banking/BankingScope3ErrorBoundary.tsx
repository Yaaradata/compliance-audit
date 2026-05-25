"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { bankBtnPrimary, bankCallout } from "./banking-ui";

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class BankingScope3ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "An unexpected error occurred.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[BankingScope3]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--dashboard-canvas)] p-8 text-center">
          <div className="max-w-md space-y-2">
            <h1 className="text-lg font-semibold text-[var(--foreground)]">This workspace hit an error</h1>
            <p className={`${bankCallout} text-left text-xs`}>{this.state.message}</p>
            <p className="text-xs text-[var(--foreground-muted)]">If this persists after refresh, capture the console stack and report it.</p>
          </div>
          <button
            type="button"
            className={bankBtnPrimary}
            onClick={() => this.setState({ hasError: false, message: undefined })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
