/*
Pseudocode:
Objective: provide one accessible notification surface for the whole app.
Input: optional title, required description, notification type, and optional timeout.
Process: keep a global Base UI toast manager, configure a bounded viewport and
type-aware timing, render stacked toasts with distinct variants, and expose
small notify helpers for client features.
Output: a provider plus notify helpers; Base UI owns focus, dismissal, swipe,
and screen-reader announcement behavior.
*/
"use client";

import { Toast } from "@base-ui/react/toast";
import { useTranslations } from "next-intl";
import {
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  OctagonAlertIcon,
  XIcon,
} from "@/icons";
import { cn } from "@/utils";

export type NotificationType = "success" | "warning" | "info" | "error";

interface NotificationOptions {
  title?: string;
  description: string;
  type?: NotificationType;
  timeout?: number;
}

const DEFAULT_TIMEOUTS: Record<NotificationType, number> = {
  success: 4000,
  info: 5000,
  warning: 6000,
  error: 8000,
};

const TITLE_KEYS = {
  success: "toastSuccess",
  info: "toastInfo",
  warning: "toastWarning",
  error: "toastError",
} as const;

const toastManager = Toast.createToastManager<Record<string, never>>();

export const notify = ({
  title,
  description,
  type = "info",
  timeout,
}: NotificationOptions): string =>
  toastManager.add({
    title,
    description,
    type,
    timeout: timeout ?? DEFAULT_TIMEOUTS[type],
    priority: type === "error" ? "high" : "low",
  });

export const notifySuccess = (
  description: string,
  title?: string,
): string => notify({ description, title, type: "success" });

export const notifyError = (
  description: string,
  title?: string,
): string => notify({ description, title, type: "error" });

const ToastTypeIcon = ({ type }: { type: NotificationType }) => {
  const iconClassName = "size-5 shrink-0";

  if (type === "success") {
    return <CheckCircleIcon aria-hidden className={iconClassName} />;
  }
  if (type === "warning") {
    return <AlertIcon aria-hidden className={iconClassName} />;
  }
  if (type === "error") {
    return <OctagonAlertIcon aria-hidden className={iconClassName} />;
  }
  return <InfoIcon aria-hidden className={iconClassName} />;
};

const ToastRegion = () => {
  const manager = Toast.useToastManager<Record<string, never>>();
  const t = useTranslations("common");

  return (
    <Toast.Portal>
      <Toast.Viewport className="pointer-events-none fixed inset-x-4 top-4 z-999999 flex flex-col sm:inset-x-auto sm:start-4 sm:w-96">
        {manager.toasts.map((toast) => {
          const type: NotificationType =
            toast.type === "success" ||
            toast.type === "warning" ||
            toast.type === "error"
              ? toast.type
              : "info";

          return (
            <Toast.Root
              key={toast.id}
              toast={toast}
              swipeDirection="up"
              className={cn(
                "pointer-events-auto absolute start-0 top-0 w-full origin-top overflow-hidden rounded-form border shadow-card outline-none",
                "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
                "h-[var(--height)] [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]",
                "transition-[transform,opacity,height] duration-200 ease-out data-[expanded]:h-[var(--toast-height)] data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
                "data-[limited]:opacity-0 data-[starting-style]:opacity-0 data-[starting-style]:[transform:translateY(-150%)] data-[ending-style]:opacity-0 data-[ending-style]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
                "border-lineStrong bg-surface text-navy dark:border-gray-700 dark:bg-navy2 dark:text-white",
                "data-[type=success]:border-ok/40 data-[type=success]:bg-okBg data-[type=success]:text-ok dark:data-[type=success]:border-ok/60 dark:data-[type=success]:bg-ok/15",
                "data-[type=warning]:border-warn/40 data-[type=warning]:bg-warnBg data-[type=warning]:text-warn dark:data-[type=warning]:border-warn/60 dark:data-[type=warning]:bg-warn/15",
                "data-[type=error]:border-err/40 data-[type=error]:bg-errBg data-[type=error]:text-err dark:data-[type=error]:border-err/60 dark:data-[type=error]:bg-err/15",
                "data-[type=info]:border-kpi3 data-[type=info]:bg-white dark:data-[type=info]:border-kpi3/40 dark:data-[type=info]:bg-kpi3/10",
              )}
            >
              <Toast.Content
                className={cn(
                  "flex items-start gap-3 overflow-hidden p-4 transition-opacity duration-200",
                  "data-[behind]:opacity-0 data-[expanded]:opacity-100",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/60 dark:bg-white/10">
                  <ToastTypeIcon type={type} />
                </span>
                <div className="grid min-w-0 flex-1 gap-1 text-current">
                  <Toast.Title className="text-sm font-bold text-current">
                    {toast.title ?? t(TITLE_KEYS[type])}
                  </Toast.Title>
                  {toast.description ? (
                    <Toast.Description className="break-words text-xs leading-5 text-current opacity-80">
                      {toast.description}
                    </Toast.Description>
                  ) : null}
                </div>
                <Toast.Close
                  aria-label={t("close")}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-current opacity-70 transition-opacity hover:bg-white/60 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current dark:hover:bg-white/10"
                >
                  <XIcon aria-hidden className="size-4" />
                </Toast.Close>
              </Toast.Content>
            </Toast.Root>
          );
        })}
      </Toast.Viewport>
    </Toast.Portal>
  );
};

const ToastProvider = ({ children }: { children: React.ReactNode }) => (
  <Toast.Provider toastManager={toastManager} timeout={5000} limit={4}>
    {children}
    <ToastRegion />
  </Toast.Provider>
);

export default ToastProvider;
