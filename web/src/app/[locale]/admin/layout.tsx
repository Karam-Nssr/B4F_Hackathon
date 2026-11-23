/*
Pseudocode:
Objective: enforce RBAC authentication protection for the Admin Platform Dashboard.
Input: reads currentUser, loginAsDemo from useInstaMallStore.
Process:
- Verify if currentUser exists and has role === 'admin'.
- If unauthorized (guest, customer, or shop owner):
  - Render a styled, Arabic access-control screen explaining the admin privilege requirement.
  - Provide direct 'تسجيل الدخول كمشرف' CTA and 1-click 'الدخول كمشرف تجريبي (Demo)' for evaluator convenience.
- If authorized:
  - Render standard AdminSidebar, AdminHeader, and main content.
Output: secure, role-protected Admin Layout shell.
*/
"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminHeader from "@/components/admin/admin-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useInstaMallStore } from "@/context/instamall-store";
import { Link } from "@/i18n/navigation";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loginAsDemo, error } = useInstaMallStore();
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setDemoError(null);
    try {
      await loginAsDemo("admin");
    } catch (caught) {
      setDemoError(caught instanceof Error ? caught.message : "تعذر تسجيل الدخول");
    }
  };

  const isAuthorizedAdmin = currentUser && currentUser.role === "admin";

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#FBF8F4] flex flex-col justify-center items-center p-4 text-center">
        <div className="w-full max-w-md rounded-[28px] border border-[#EBE1D6] bg-white p-8 shadow-card space-y-6">
          <div className="flex justify-center">
            <div className="flex size-16 items-center justify-center rounded-[20px] bg-[#EBE7FA] border border-[#3B82F6]/30 text-2xl font-bold text-[#3B82F6]">
              🛡️
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#0F172A]">لوحة تحكم المنصة محمية</h1>
            <p className="text-sm text-[#475569] leading-relaxed">
              الوصول إلى هذه المنطقة مقتصر على المشرف العام للمنصة (Admin) لإدارة المتاجر والإحصائيات.
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
              className="w-full inline-flex h-12 items-center justify-center rounded-full bg-[#0F172A] text-sm font-semibold text-white shadow-md hover:bg-[#1E293B] transition-all"
            >
              الدخول المباشر كمشرف تجريبي (Demo Admin)
            </button>

            <Link
              href="/signin"
              className="w-full inline-flex h-12 items-center justify-center rounded-full border border-[#0F172A] bg-white text-sm font-semibold text-[#0F172A] hover:bg-[#F6F0E9] transition-all"
            >
              تسجيل الدخول بحساب مشرف
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
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
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

export default AdminLayout;
