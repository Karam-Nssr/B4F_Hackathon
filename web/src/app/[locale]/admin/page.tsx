/*
Pseudocode:
Objective: render the Admin Dashboard Overview from backend admin endpoints only.
Input: adminStats, adminShops, and load state from useInstaMallStore.
Process:
- Show backend-provided shop and user totals; use an honest fallback for unavailable metrics.
- List admin shops with their real active flag and a disabled action (no activation endpoint exists).
- Compose the shared admin user directory without exposing restricted phone data.
Output: a responsive platform admin overview with no fabricated data.
*/
"use client";

import AdminUsersDirectory from "@/components/main/admin/users-directory";
import { useInstaMallStore } from "@/context/instamall-store";
import AdminShopsTable from "@/components/admin/admin-shops-table";

const AdminOverview = () => {
  const { adminStats, adminShops, error, isLoading } = useInstaMallStore();

  return (
    <div className="space-y-8 text-right">
      {error && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {error}
        </div>
      )}

      {/* Platform KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#DFF3EA] p-5 shadow-xs">
          <p className="text-sm font-medium text-[#475569]">طلبات مؤكدة خلال 24 ساعة</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#15803D]">—</p>
          <p className="mt-1 text-xs text-[#475569]">غير متوفر في واجهة الإدارة</p>
        </div>

        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#E0EEFB] p-5 shadow-xs">
          <p className="text-sm font-medium text-[#475569]">الطلبات المقسّمة</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#0F172A]">—</p>
          <p className="mt-1 text-xs text-[#475569]">غير متوفر في واجهة الإدارة</p>
        </div>

        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#EBE7FA] p-5 shadow-xs">
          <p className="text-sm font-medium text-[#475569]">المتاجر النشطة</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#0F172A]">
            {isLoading && adminStats === null ? "—" : (adminStats?.activeShops ?? "—")}
          </p>
        </div>

        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#FDE7EA] p-5 shadow-xs">
          <p className="text-sm font-medium text-[#475569]">إجمالي المستخدمين</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#0F172A]">
            {isLoading && adminStats === null ? "—" : (adminStats?.totalUsers ?? "—")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Shops Governance */}
        <div className="space-y-4 lg:col-span-7">
          <div className="border-b border-[#EBE1D6]/70 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">المتاجر المسجلة</h2>
            <p className="text-xs text-[#475569]">
              {adminStats ? `إجمالي المتاجر: ${adminStats.totalShops}` : "بيانات المتاجر من الخادم"}
            </p>
            <p className="mt-1 text-xs text-[#B45309]">
              واجهة الخلفية لا توفر تفعيلاً أو إيقافاً للمتاجر، لذلك عرض الحالة للقراءة فقط.
            </p>
          </div>

          <AdminShopsTable compact shops={adminShops} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-5">
          <AdminUsersDirectory compact />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
