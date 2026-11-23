/*
Pseudocode:
Objective: render an accessible loading state for route navigation.
Input: none.
Process: resolve the active locale and render the localized orbital loader.
Output: an accessible, animated marketplace loading screen.
*/
import LuxuryOrbitalHero from "@/components/LuxuryOrbitalHero";
import { getLocale, getTranslations } from "next-intl/server";

const RouteLoading = async () => {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("common"),
  ]);

  return (
    <LuxuryOrbitalHero
      variant="loader"
      locale={locale}
      loadingLabel={t("loading")}
    />
  );
};

export default RouteLoading;
