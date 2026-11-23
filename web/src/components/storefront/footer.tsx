/*
Pseudocode:
Render the brand summary, storefront navigation, and separate buyer/seller registration links.
Use localized copy and the shared canonical authentication routes.
*/
import { Link } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth-routes";
import { useTranslations } from "next-intl";
import { BrandLogo } from "./brand-logo";

const StorefrontFooter = () => {
  const t = useTranslations("storefront");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-navy text-onNavy">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <BrandLogo className="size-10" />
              <span className="font-brand text-2xl">InstaMall</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-onNavyMuted">
              {t("footer.description")}
            </p>
          </div>

          <nav aria-label={t("footer.navigationTitle")}>
            <h2 className="text-sm font-bold">{t("footer.navigationTitle")}</h2>
            <ul className="mt-4 space-y-3 text-sm text-onNavyMuted">
              <li>
                <Link href="/" className="transition-colors hover:text-onNavy">
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/stores"
                  className="transition-colors hover:text-onNavy"
                >
                  {t("footer.stores")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="transition-colors hover:text-onNavy"
                >
                  {t("footer.cart")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-bold">{t("footer.joinTitle")}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href={authRoutes.signupFor("buyer")}
                className="rounded-card border border-white/10 bg-navy2 p-4 transition-colors hover:border-brand-blue hover:bg-navy2/80 focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
              >
                <span className="block text-sm font-semibold">
                  {t("footer.buyerTitle")}
                </span>
                <span className="mt-2 block text-xs leading-5 text-onNavyMuted">
                  {t("footer.buyerDescription")}
                </span>
                <span className="mt-4 block text-xs font-bold text-white">
                  {t("footer.buyerAction")}
                </span>
              </Link>
              <Link
                href={authRoutes.signupFor("seller")}
                className="rounded-card border border-brand-blue bg-brand-blue p-4 transition-colors hover:bg-brand-blue-hover focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              >
                <span className="block text-sm font-semibold">
                  {t("footer.sellerTitle")}
                </span>
                <span className="mt-2 block text-xs leading-5 text-white/80">
                  {t("footer.sellerDescription")}
                </span>
                <span className="mt-4 block text-xs font-bold text-white">
                  {t("footer.sellerAction")}
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-onNavyMuted sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright", { year })}</p>
          <p>{t("footer.businessNote")}</p>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;
