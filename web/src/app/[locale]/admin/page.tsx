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
<<<<<<< HEAD
import { ShopImage } from "@/components/storefront/shop-image";
import { SearchIcon } from "@/icons";
import type { UserRole } from "@/types/instamall";

type RoleFilter = "الكل" | "user" | "shop" | "admin";

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: "الكل", label: "الكل" },
  { value: "user", label: "مشتري" },
  { value: "shop", label: "صاحب متجر" },
  { value: "admin", label: "مشرف" },
];

const roleLabel = (role: UserRole): string => {
  if (role === "shop") return "صاحب متجر";
  if (role === "admin") return "مشرف";
  return "مشتري";
};

const roleClass = (role: UserRole): string => {
  if (role === "shop") return "bg-[#FFF1D2] text-[#B45309]";
  if (role === "admin") return "bg-[#D8F1E4] text-[#15803D]";
  return "bg-[#E0EEFB] text-[#1D4ED8]";
};
=======
>>>>>>> fe28a030207d08e00b725cecbe5bdaacd15df8a3

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

          <div dir="rtl" className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
            <table dir="rtl" className="w-full min-w-[620px] text-right text-sm">
              <thead className="bg-[#F6F0E9] border-b border-[#EBE1D6]">
                <tr>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">المتجر</th>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">التصنيف</th>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">المدينة</th>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">المنتجات</th>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">الحالة</th>
                  <th className="py-3 px-3 text-center text-xs font-semibold text-[#475569]">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D6]/60">
                {adminShops.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-[#475569]">
                      لا توجد متاجر مسجلة
                    </td>
                  </tr>
                ) : (
                  adminShops.map((shop) => (
                    <tr key={shop.id} className="hover:bg-[#FBF8F4] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <ShopImage shop={shop} sizeClassName="size-9" />
                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">{shop.shopName}</p>
                            <p className="text-[11px] text-[#475569]">{shop.description || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[#475569]">{shop.category}</td>
                      <td className="py-3.5 px-3 text-xs text-[#475569]">—</td>
                      <td className="py-3.5 px-3 text-xs text-[#475569]">—</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            shop.isActive
                              ? "bg-[#D8F1E4] text-[#15803D]"
                              : "bg-[#FDDFDC] text-[#BA1A1A]"
                          }`}
                        >
                          {shop.isActive ? "نشط" : "متوقف"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-xs text-[#94A3B8]">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AdminUsersDirectory compact />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
