/*
Pseudocode:
Objective: display the shared localized not-found experience.
Input: none.
Process: resolve translated title, message, and home link; render a return link.
Output: a route-safe 404 screen that preserves the active locale.
*/
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const RouteNotFound = async () => {
  const t = await getTranslations("notFound");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid max-w-lg gap-4 text-center">
        <h1 className="text-heading-two font-semibold text-gray-900 dark:text-white">
          {t("error")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">{t("message")}</p>
        <Link
          href="/"
          className="mx-auto rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
};

export default RouteNotFound;
