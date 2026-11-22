/*
Pseudocode:
Objective: render an accessible loading state for route navigation.
Input: none.
Process: announce loading to assistive technology and show a small spinner.
Output: a lightweight centered status indicator.
*/
import { getTranslations } from "next-intl/server";

const RouteLoading = async () => {
  const t = await getTranslations("common");

  return (
    <div
      role="status"
      className="flex min-h-40 items-center justify-center"
      aria-label={t("loading")}
    >
      <span className="size-8 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
};

export default RouteLoading;
