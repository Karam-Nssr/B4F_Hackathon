/*
Pseudocode:
Objective: render the footer bar for the storefront with brand attribution and localization note.
Input: none (uses next-intl for localization).
Process: render a navy footer with centered text describing the platform and currency.
Output: a footer element anchored to the page bottom.
*/
import { useTranslations } from "next-intl";

const StorefrontFooter = () => {
  const t = useTranslations("storefront");
  return (
    <footer className="bg-navy px-4 pb-4 pt-3 text-start text-[13px] text-[var(--color-onNavyMuted)]">
      <p className="text-center font-normal">
        InstaMall — منصة المتاجر السورية المستقلة · الأسعار بالليرة السورية · الدفع والتسليم مباشرة مع المتجر
      </p>
    </footer>
  );
};

export default StorefrontFooter;
