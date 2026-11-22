/*
Pseudocode:
Objective: render the admin users directory from the backend admin endpoint.
Input: adminUsers, load state, and errors from useInstaMallStore plus local search/filter input.
Process: filter the real user records by name or email and by backend role. Phone numbers and
order counts are absent from the admin DTO, so show "—" rather than fabricating values.
Output: a searchable, role-filtered, backend-backed users management screen.
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

const AdminUsersPage = () => {
  const { adminUsers, isLoading, error } = useInstaMallStore();
  const [search, setSearch] = useState("");
  const [usersTab, setUsersTab] = useState<RoleFilter>("الكل");

  const filteredUsers = adminUsers.filter((user) => {
    if (usersTab !== "الكل" && user.role !== usersTab) return false;
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 text-right">
      <div className="space-y-1 border-b border-[#EBE1D6]/70 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">المستخدمون</h1>
        <p className="text-sm text-[#475569]">
          الحسابات المسجلة في المنصة · الهاتف وعدد الطلبات غير متوفرين في بيانات الإدارة.
        </p>
      </div>

      {error && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {error}
        </div>
      )}

      {/* Toolbar: Search + Role Pills */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[#94A3B8]">
            <SearchIcon className="size-4" />
          </span>
          <input
            type="text"
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-full border border-[#94A3B8]/60 bg-white pe-4 ps-10 text-xs text-[#0F172A] focus:border-[#0F172A] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_FILTERS.map((filter) => {
            const isActive = usersTab === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setUsersTab(filter.value)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
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
        <table dir="rtl" className="w-full min-w-[640px] text-right text-sm">
          <thead className="bg-[#F6F0E9] border-b border-[#EBE1D6]">
            <tr>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">الاسم</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">الدور</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">الهاتف</th>
              <th className="py-3.5 px-4 text-center text-xs font-semibold text-[#475569]">عدد الطلبات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-[#475569]">
                  {isLoading ? "جارٍ تحميل المستخدمين..." : "لا يوجد مستخدمون مطابقون لمعايير البحث"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#FBF8F4] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FDE7EA] text-xs font-bold text-[#0F172A]">
                        {user.fullName.trim().charAt(0) || "م"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{user.fullName}</p>
                        <p className="text-[11px] text-[#94A3B8]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${roleClass(user.role)}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-[#475569]">—</td>
                  <td className="py-4 px-4 text-center font-mono text-sm text-[#475569]">—</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
