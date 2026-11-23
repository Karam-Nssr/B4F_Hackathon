/*
Pseudocode:
Objective: render Storefront Navbar with strict RBAC visibility rules.
Input: reads currentUser, cartCount from useInstaMallStore.
Process:
- If Guest (!currentUser):
  - Show ONLY 'الرئيسية' in nav links.
  - Show 'السلة' and 'تسجيل الدخول / حساب جديد' button.
  - Hide 'دليل المتاجر' and 'طلباتي والفواتير'.
- If Logged-in Customer (currentUser.role === 'user'):
  - Show 'الرئيسية', 'دليل المتاجر', and 'طلباتي والفواتير'.
  - Show 'السلة' and User Avatar Monogram linking to /account.
- If Shop Owner / Admin:
  - Provide direct link to their authorized dashboard (/shop or /admin).
Output: a role-aware, responsive navbar matching the exact business requirements.
*/
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { authRoutes } from "@/lib/auth-routes";
import { useInstaMallStore } from "@/context/instamall-store";
import { BrandLogo } from "./brand-logo";
import { CartIcon, SearchIcon } from "@/icons";
import ThemeToggleButton from "@/layout/header/theme-toggler";

const StorefrontNavbar = () => {
  const t = useTranslations("storefront");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const { cartCount, currentUser, logout } = useInstaMallStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isGuest = !currentUser;
  const isCustomer = currentUser?.role === "user";
  const isShopOwner = currentUser?.role === "shop";
  const isAdmin = currentUser?.role === "admin";

  const userInitial =
    currentUser?.fullName
      ?.trim()
      ?.split(/\s+/)
      .map((n) => n[0])
      .slice(0, 1)
      .join("") || "ك";

  return (
    <header className="sticky top-0 z-40 h-[72px] w-full shrink-0 border-b border-[#1E293B] bg-[#0F172A] shadow-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Right side in RTL: Brand Logo + Conditional Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <BrandLogo className="size-9" />
            <span className="hidden font-brand text-2xl font-normal tracking-wide text-white select-none sm:inline">
              InstaMall
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {/* Always visible: الرئيسية */}
            <Link
              href="/"
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/" || pathname === ""
                  ? "bg-[#1E293B] text-white"
                  : "text-[#BEC6E0] hover:bg-[#1E293B]/70 hover:text-white"
              }`}
            >
              الرئيسية
            </Link>

            {/* Customer Only: دليل المتاجر & طلباتي والفواتير */}
            {isCustomer && (
              <>
                <Link
                  href="/stores"
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/stores")
                      ? "bg-[#1E293B] text-white"
                      : "text-[#BEC6E0] hover:bg-[#1E293B]/70 hover:text-white"
                  }`}
                >
                  دليل المتاجر
                </Link>
                <Link
                  href="/orders"
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    pathname.startsWith("/orders")
                      ? "bg-[#1E293B] text-white"
                      : "text-[#BEC6E0] hover:bg-[#1E293B]/70 hover:text-white"
                  }`}
                >
                  طلباتي والفواتير
                </Link>
              </>
            )}

            {/* Shop Owner Only: لوحة المتجر */}
            {isShopOwner && (
              <Link
                href="/shop"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith("/shop")
                    ? "bg-[#1E293B] text-white"
                    : "text-[#BEC6E0] hover:bg-[#1E293B]/70 hover:text-white"
                }`}
              >
                لوحة تحكم المتجر
              </Link>
            )}

            {/* Admin Only: لوحة المشرف */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-[#1E293B] text-white"
                    : "text-[#BEC6E0] hover:bg-[#1E293B]/70 hover:text-white"
                }`}
              >
                لوحة تحكم المنصة
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="mx-4 hidden max-w-md flex-1 items-center lg:flex">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-[#BEC6E0]">
              <SearchIcon className="size-4" />
            </span>
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-[#94A3B8]/40 bg-[#1E293B] ps-11 pe-4 text-sm text-white placeholder-[#BEC6E0] transition-all focus:border-[#C40027] focus:ring-1 focus:ring-[#C40027] focus:outline-none"
            />
          </div>
        </div>

        {/* Left side in RTL: Cart + Auth (Sign In or Avatar) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton className="hidden border-[#BEC6E0]/60 bg-transparent text-[#BEC6E0] hover:bg-[#26354D] hover:text-white md:inline-flex dark:border-[#BEC6E0]/60 dark:bg-transparent dark:text-white dark:hover:bg-[#26354D]" />

          {/* Cart Pill (Visible to everyone) */}
          <Link
            href="/cart"
            className="flex h-11 items-center gap-2 rounded-full border border-[#BEC6E0]/60 bg-[#1E293B] px-3 text-white transition-all hover:border-white hover:bg-[#26354D] sm:px-4"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-[#C40027] font-mono text-xs font-bold text-white shadow-[0_2px_8px_rgba(196,0,39,0.4)]">
              {cartCount}
            </span>
            <CartIcon className="size-4.5 shrink-0" />
            <span className="hidden text-sm font-medium sm:inline">السلة</span>
          </Link>

          {/* Guest State: Sign In Button */}
          {isGuest ? (
            <Link
              href="/signin"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#C40027] px-3 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95 sm:px-5"
            >
              {tAuth("signInLink")}
            </Link>
          ) : (
            /* Logged-In State: Monogram Avatar / Account Link */
            <div className="flex items-center gap-2">
              <Link
                href={
                  isCustomer ? "/account" : isShopOwner ? "/shop" : "/admin"
                }
                className="flex size-11 items-center justify-center rounded-full bg-[#1E293B] text-sm font-bold text-white transition-all hover:bg-[#26354D] hover:ring-2 hover:ring-[#C40027]"
                title={currentUser?.fullName || "حسابي"}
              >
                {userInitial}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden text-xs font-medium text-[#BEC6E0] transition-colors hover:text-[#FFB3AF] xl:block"
                title="تسجيل الخروج"
              >
                خروج
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-[#1E293B] text-white hover:bg-[#26354D] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="القائمة"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#1E293B] bg-[#0F172A] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1.5 text-right">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white"
            >
              الرئيسية
            </Link>

            {isCustomer && (
              <>
                <Link
                  href="/stores"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white"
                >
                  دليل المتاجر
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white"
                >
                  طلباتي والفواتير
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white"
                >
                  حسابي والهوية المحفوظة
                </Link>
              </>
            )}

            {isShopOwner && (
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white"
              >
                لوحة تحكم المتجر
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white"
              >
                لوحة تحكم المنصة
              </Link>
            )}

            <div className="my-2 h-px bg-[#1E293B]" />

            {isGuest ? (
              <div className="space-y-2">
                <Link
                  href={authRoutes.signIn}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg bg-red px-3 py-2 text-center text-sm font-semibold text-white hover:bg-red/90"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href={authRoutes.signupFor("buyer")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg bg-navy2 px-3 py-2 text-center text-sm font-medium text-white hover:bg-navy2/80"
                >
                  {t("footer.buyerAction")}
                </Link>
                <Link
                  href={authRoutes.signupFor("seller")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg bg-navy2 px-3 py-2 text-center text-sm font-medium text-white hover:bg-navy2/80"
                >
                  {t("footer.sellerAction")}
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-right text-sm font-semibold text-[#BA1A1A] hover:bg-[#1E293B]"
              >
                تسجيل الخروج ({currentUser?.fullName})
              </button>
            )}

            <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[#BEC6E0]">
              <span>المظهر</span>
              <ThemeToggleButton className="border-[#BEC6E0]/60 bg-transparent text-[#BEC6E0] hover:bg-[#26354D] hover:text-white dark:border-[#BEC6E0]/60 dark:bg-transparent dark:text-white dark:hover:bg-[#26354D]" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default StorefrontNavbar;
