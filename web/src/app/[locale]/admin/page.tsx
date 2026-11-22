/*
Pseudocode:
Objective: render the Admin Dashboard Overview from backend admin endpoints only.
Input: adminStats, adminShops, adminUsers, and load state from useInstaMallStore.
Process:
- Show the real active-shops and total-users KPIs; show "—" for metrics the API lacks.
- List admin shops with their real active flag and a disabled action (no activation endpoint exists).
- List admin users from /admin/users with local search and role filtering; phone and order
  counts are unavailable in that DTO, so render an honest fallback.
Output: a responsive platform admin overview with no fabricated data.
*/
"use client";

import { useState } from "react";
import { useInstaMallStore } from "@/context/instamall-store";
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

const AdminOverview = () => {
  const { adminStats, adminShops, adminUsers, error, isLoading } =
    useInstaMallStore();
  const [search, setSearch] = useState("");
  const [usersRoleFilter, setUsersRoleFilter] = useState<RoleFilter>("الكل");

  const filteredUsers = adminUsers.filter((user) => {
    if (usersRoleFilter !== "الكل" && user.role !== usersRoleFilter) return false;
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

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
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-[12px] text-xs font-bold text-[#0F172A] ${shop.avatarBg}`}
                          >
                            {shop.avatarChar}
                          </div>
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

        {/* Users Directory */}
        <div className="space-y-4 lg:col-span-5">
          <div className="border-b border-[#EBE1D6]/70 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">المستخدمون</h2>
            <p className="text-xs text-[#475569]">قائمة الحسابات المسجلة من الخادم</p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[#94A3B8]">
                <SearchIcon className="size-4" />
              </span>
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-full border border-[#94A3B8]/50 bg-white pe-4 ps-10 text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {ROLE_FILTERS.map((filter) => {
                const isActive = usersRoleFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setUsersRoleFilter(filter.value)}
                    className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#0F172A] text-white"
                        : "border border-[#94A3B8]/60 bg-white text-[#0F172A] hover:bg-[#F6F0E9]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div dir="rtl" className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
            <table dir="rtl" className="w-full text-right text-sm">
              <thead className="bg-[#F6F0E9] border-b border-[#EBE1D6]">
                <tr>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">الاسم</th>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">الدور</th>
                  <th className="py-3 px-3 text-xs font-semibold text-[#475569]">الهاتف</th>
                  <th className="py-3 px-3 text-center text-xs font-semibold text-[#475569]">الطلبات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D6]/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-[#475569]">
                      لا يوجد مستخدمون مطابقون
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#FBF8F4] transition-colors">
                      <td className="py-3 px-3">
                        <p className="text-xs font-bold text-[#0F172A]">{user.fullName}</p>
                        <p className="text-[11px] text-[#94A3B8]">{user.email}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleClass(user.role)}`}>
                          {roleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-[#475569]">—</td>
                      <td className="py-3 px-3 text-center font-mono text-xs text-[#475569]">—</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
