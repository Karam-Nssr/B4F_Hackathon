/*
Pseudocode:
Objective: provide a single accessible notification surface for the app.
Input: children and typed notification details (success, warning, info, error).
Process: keep one Base UI toast manager, render its queue in a portal, and
provide a small notify function to client-side features.
Output: a provider and notification function; Base UI manages focus, dismissal,
and announcement behavior.
*/
"use client";

import { Toast } from "@base-ui/react/toast";
import { useTranslations } from "next-intl";

export type NotificationType = "success" | "warning" | "info" | "error";

interface NotificationOptions {
  title: string;
  description?: string;
  type?: NotificationType;
  timeout?: number;
}

const toastManager = Toast.createToastManager();

export const notify = ({
  title,
  description,
  type = "info",
  timeout,
}: NotificationOptions) =>
  toastManager.add({ title, description, type, timeout });

const ToastRegion = () => {
  const manager = Toast.useToastManager();
  const t = useTranslations("common");

  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed inset-x-4 top-4 z-999999 flex flex-col gap-2 sm:inset-x-auto sm:end-4 sm:w-96">
        {manager.toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className="rounded-xl border border-gray-200 bg-white p-4 text-gray-700 shadow-theme-lg dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 data-[type=success]:border-green-500 data-[type=warning]:border-amber-500 data-[type=error]:border-red-500 data-[type=info]:border-sky-500"
          >
            <Toast.Content className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <Toast.Title className="text-sm font-semibold text-gray-900 dark:text-white">
                  {toast.title}
                </Toast.Title>
                {toast.description ? (
                  <Toast.Description className="text-sm text-gray-500 dark:text-gray-400">
                    {toast.description}
                  </Toast.Description>
                ) : null}
              </div>
              <Toast.Close
                aria-label={t("close")}
                className="shrink-0 rounded-md px-2 text-sm text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ×
              </Toast.Close>
            </Toast.Content>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <Toast.Provider toastManager={toastManager}>
    {children}
    <ToastRegion />
  </Toast.Provider>
);

export default ToastProvider;
