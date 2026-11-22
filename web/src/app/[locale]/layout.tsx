/*
Pseudocode:
Objective: render the localized document shell with InstaMall typography, RTL direction, and CSS variables.
Input: locale route params and child route content.
Process: validate the locale, set request locale, derive text direction, inject Google fonts
(Rubik as sans UI, Spline Sans Mono as numeric/mono, Alatsi as brand wordmark), and wrap children
with NextIntl, ThemeProvider, DirectionProvider, InstaMallStoreProvider, TooltipProvider, and ToastProvider.
Output: a fully-localized, right-to-left document shell with proper font variable scopes.
*/
import { Rubik, Spline_Sans_Mono, Alatsi } from "next/font/google";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/theme-context";
import { isRtl } from "@/i18n/languages";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/utils";
import { InstaMallStoreProvider } from "@/context/instamall-store";
import ToastProvider from "@/components/ui/toast";
import "flatpickr/dist/flatpickr.css";
import "simplebar-react/dist/simplebar.min.css";
import "swiper/css/bundle";
import "../globals.css";

const rubik = Rubik({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const alatsi = Alatsi({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-brand",
  display: "swap",
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
        className={cn(
          "relative isolate min-h-screen bg-[#FBF8F4] text-[#0F172A] antialiased",
          rubik.variable,
          splineSansMono.variable,
          alatsi.variable,
          rubik.className,
        )}
      >
        <NextIntlClientProvider>
          <ThemeProvider>
            <DirectionProvider direction={rtl ? "rtl" : "ltr"}>
              <InstaMallStoreProvider>
                <TooltipProvider>
                  <ToastProvider>{children}</ToastProvider>
                </TooltipProvider>
              </InstaMallStoreProvider>
            </DirectionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
