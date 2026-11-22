/*
Pseudocode:
Objective: validate the locale and compose app-wide providers and styles.
Input: locale route params and child route content.
Process: reject unsupported locales, set request locale, derive text direction,
then wrap children with internationalization, theme, direction, tooltip, and toast providers.
Output: a localized document shell; invalid locales use the framework not-found flow.
*/
import ToastProvider from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/theme-context";
import { isRtl } from "@/i18n/languages";
import { type Locale, routing } from "@/i18n/routing";
import { cn } from "@/utils";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import "flatpickr/dist/flatpickr.css";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Outfit } from "next/font/google";
import { notFound } from "next/navigation";
import "simplebar-react/dist/simplebar.min.css";
import "swiper/css/bundle";
import "../globals.css";

const outfit = Outfit({
  subsets: ["latin"],
});

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

const RootLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const rtl = isRtl(locale as Locale);

  return (
    <html lang={locale} dir={rtl ? "rtl" : "ltr"}>
      <body
        className={cn("relative isolate dark:bg-gray-900", outfit.className)}
      >
        <NextIntlClientProvider>
          <ThemeProvider>
            <DirectionProvider direction={rtl ? "rtl" : "ltr"}>
              <TooltipProvider>
                <ToastProvider>{children}</ToastProvider>
              </TooltipProvider>
            </DirectionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
