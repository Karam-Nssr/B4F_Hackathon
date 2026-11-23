/*
Pseudocode:
Objective: render the registered-shops directory from the backend admin endpoint.
Input: adminShops, load state, and errors from useInstaMallStore.
Process: list each shop's real name, category, description, and active flag. City, product
count, and activation controls are omitted because the backend does not expose them.
Output: a read-only, honest registered-shops management page.
*/
"use client";

import { useInstaMallStore } from "@/context/instamall-store";
import AdminShopsTable from "@/components/admin/admin-shops-table";

const AdminShopsPage = () => {
  const { adminShops, adminStats, isLoading, error } = useInstaMallStore();

  return (
    <div className="space-y-6 text-right">
      <div className="space-y-1 border-b border-[#EBE1D6]/70 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">
          المتاجر المسجلة
        </h1>
        <p className="text-sm text-[#475569]">
          {adminStats
            ? `${adminStats.totalShops} متجر مسجّل، منها ${adminStats.activeShops} متجر نشط.`
            : "بيانات المتاجر المسجلة في المنصة."}
        </p>
        <p className="mt-1 text-xs text-[#B45309]">
          لا تتوفر في واجهة الخلفية حالة مدينة أو عدد منتجات أو إجراء لتغيير
          حالة المتجر.
        </p>
      </div>

      {error && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {error}
        </div>
      )}

      <AdminShopsTable shops={adminShops} isLoading={isLoading} />
    </div>
  );
};

export default AdminShopsPage;
