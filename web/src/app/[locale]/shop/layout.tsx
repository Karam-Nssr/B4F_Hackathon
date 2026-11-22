/*
Pseudocode:
Objective: enforce RBAC authentication protection for the Shop Vendor Dashboard.
Input: reads currentUser, loginAsDemo from useInstaMallStore.
Process:
- Verify if currentUser exists and has role === 'shop'.
- If unauthorized (guest or non-shop):
  - Render a styled, Arabic access-control screen explaining the role requirement.
  - Provide direct 'تسجيل الدخول كتاجر' CTA and 1-click 'الدخول كتاجر تجريبي (Demo)' for evaluator convenience.
- If authorized:
  - Render standard ShopSidebar, ShopHeader, and main content.
Output: secure, role-protected Shop Layout shell.
*/
"use client";

import { useState } from "react";
import ShopSidebar from "@/components/shop/shop-sidebar";
import ShopHeader from "@/components/shop/shop-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useInstaMallStore } from "@/context/instamall-store";
import { Link } from "@/i18n/navigation";

const ShopLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loginAsDemo, error } = useInstaMallStore();
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setDemoError(null);
    try {
      await loginAsDemo("shop");
    } catch (caught) {
      setDemoError(caught instanceof Error ? caught.message : "تعذر تسجيل الدخول");
    }
  };

  const isAuthorizedShopOwner = currentUser && currentUser.role === "shop";

  if (!isAuthorizedShopOwner) {
    return (
      <div className="min-h-screen bg-[#FBF8F4] flex flex-col justify-center items-center p-4 text-center">
        <div className="w-full max-w-md rounded-[28px] border border-[#EBE1D6] bg-white p-8 shadow-card space-y-6">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-[20px] bg-[#FFF1D2] border border-[#B45309]/30 text-2xl font-bold text-[#B45309]">
              🔒
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">بوابة التاجر محمية</h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              هذه اللوحة مخصصة لأصحاب المتاجر المسجلين فقط لإدارة الطلبات الفرعية والمنتجات.
            </p>
          </div>

          {(demoError || error) && (
            <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-xs font-semibold text-[#BA1A1A]">
              {demoError || error}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => void handleDemoLogin()}
              className="w-full inline-flex h-12 items-center justify-center rounded-full bg-[#C40027] text-sm font-semibold text-white shadow-red hover:bg-[#a50021] transition-all"
            >
              الدخول المباشر كصاحب متجر تجريبي (Demo)
            </button>

            <Link
              href="/auth"
              className="w-full inline-flex h-12 items-center justify-center rounded-full border border-[#0F172A] bg-white text-sm font-semibold text-[#0F172A] hover:bg-[#F6F0E9] transition-all"
            >
              تسجيل الدخول بحساب تاجر
            </Link>

            <Link
              href="/"
              className="block pt-2 text-xs font-medium text-[#475569] hover:text-[#0F172A] hover:underline"
            >
              الرجوع إلى المتجر الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-[#FBF8F4]">
        <ShopSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ShopHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ShopLayout;
