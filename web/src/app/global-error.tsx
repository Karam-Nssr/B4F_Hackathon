/*
Pseudocode:
Objective: recover from failures in the root layout itself.
Input: an unknown error value and Next.js retry callback.
Process: log the failure and show a minimal standalone document with retry.
Output: an accessible fallback independent of providers inside the failed layout.
*/
"use client";

import getErrorMessage from "@/utils/get-error-message";
import { useEffect } from "react";
import "./globals.css";

interface GlobalErrorProps {
  error: unknown;
  retry: () => void;
}

const GlobalError = ({ error, retry }: GlobalErrorProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-title-sm font-semibold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="max-w-lg text-gray-500 dark:text-gray-400">
            {getErrorMessage(error)}
          </p>
          <button
            type="button"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            onClick={retry}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
};

export default GlobalError;
