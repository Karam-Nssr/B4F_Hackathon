/*
Pseudocode:
Objective: show a consistent recovery screen for route-level failures.
Input: the caught Error and Next.js reset callback.
Process: log the error for diagnostics, show its safe message, and offer retry.
Output: an accessible, localized error screen without a success-shaped fallback.
*/
"use client";

import { Button } from "@/components/ui/button";
import getErrorMessage from "@/utils/get-error-message";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: unknown;
  retry: () => void;
}

const ErrorBoundary = ({ error, retry }: ErrorBoundaryProps) => {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-96 items-center justify-center px-4 py-12">
      <div className="grid max-w-lg gap-4 text-center">
        <h1 className="text-title-sm font-semibold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getErrorMessage(error)}
        </p>
        <Button className="mx-auto" onClick={retry}>
          {t("retry")}
        </Button>
      </div>
    </main>
  );
};

export default ErrorBoundary;
