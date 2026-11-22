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

const AdminShopsPage = () => {
  const { adminShops, adminStats, isLoading, error } = useInstaMallStore();

  return (
    <div className="space-y-6 text-right">
      <div className="space-y-1 border-b border-[#EBE1D6]/70 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">المتاجر المسجلة</h1>
        <p className="text-sm text-[#475569]">
          {adminStats
            ? `${adminStats.totalShops} متجر مسجّل، منها ${adminStats.activeShops} متجر نشط.`
            : "بيانات المتاجر المسجلة في المنصة."}
        </p>
        <p className="mt-1 text-xs text-[#B45309]">
          لا تتوفر في واجهة الخلفية حالة مدينة أو عدد منتجات أو إجراء لتغيير حالة المتجر.
        </p>
      </div>

      {error && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {error}
        </div>
      )}

      <div dir="rtl" className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
        <table dir="rtl" className="w-full min-w-[720px] text-right text-sm">
          <thead className="bg-[#F6F0E9] border-b border-[#EBE1D6]">
            <tr>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">المتجر</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">المدينة</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">التصنيف</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">عدد المنتجات</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">الحالة</th>
              <th className="py-3.5 px-4 text-center text-xs font-semibold text-[#475569]">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {adminShops.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-[#475569]">
                  {isLoading ? "جارٍ تحميل المتاجر..." : "لا توجد متاجر مسجلة"}
                </td>
              </tr>
            ) : (
              adminShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-[#FBF8F4] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-[14px] text-sm font-bold text-[#0F172A] ${shop.avatarBg}`}
                      >
                        {shop.avatarChar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{shop.shopName}</p>
                        <p className="text-xs text-[#475569]">{shop.description || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#475569]">—</td>
                  <td className="py-4 px-4 text-sm text-[#475569]">{shop.category}</td>
                  <td className="py-4 px-4 text-sm text-[#475569]">—</td>
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4 text-center text-xs text-[#94A3B8]">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminShopsPage;
