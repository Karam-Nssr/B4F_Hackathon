/*
Pseudocode:
Objective: render the shared admin user directory.
Input: admin user data and load/error state from the InstaMall store.
Process: filter by name, email, and role; format account creation dates; show
only fields returned and permitted by the admin API.
Output: a reusable directory for the admin overview and users page.
*/
"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInstaMallStore } from "@/context/instamall-store";
import type { UserRole } from "@/types/instamall";
import TablePagination from "@/components/common/table-pagination";
import useTablePagination from "@/hooks/use-table-pagination";

type RoleFilter = UserRole | "all";

interface AdminUsersDirectoryProps {
  compact?: boolean;
  recentOnly?: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  user: "مشتري",
  shop: "صاحب متجر",
  admin: "مشرف",
};

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  user: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
  shop: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
  admin:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
};

const formatCreatedAt = (value: string, locale: string): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";

  const dateLocale = locale === "ar" ? "ar-SY" : "en";
  return new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const AdminUsersDirectory = ({
  compact = false,
  recentOnly = false,
}: AdminUsersDirectoryProps) => {
  const locale = useLocale();
  const { adminUsers, isLoading, error } = useInstaMallStore();
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [createdAtFilter, setCreatedAtFilter] = useState("");
  const nameQuery = nameFilter.trim().toLocaleLowerCase(locale);
  const emailQuery = emailFilter.trim().toLocaleLowerCase(locale);

  const directoryUsers = recentOnly ? adminUsers.slice(0, 5) : adminUsers;
  const filteredUsers = directoryUsers.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (
      nameQuery &&
      !user.fullName.toLocaleLowerCase(locale).includes(nameQuery)
    ) {
      return false;
    }
    if (
      emailQuery &&
      !user.email.toLocaleLowerCase(locale).includes(emailQuery)
    ) {
      return false;
    }
    if (createdAtFilter) {
      const createdAt = new Date(user.createdAt);
      if (!Number.isFinite(createdAt.getTime())) return false;
      const localDate = [
        createdAt.getFullYear(),
        String(createdAt.getMonth() + 1).padStart(2, "0"),
        String(createdAt.getDate()).padStart(2, "0"),
      ].join("-");
      if (localDate !== createdAtFilter) return false;
    }
    return true;
  });
  const { pageItems, resetPage, ...pagination } =
    useTablePagination(filteredUsers);
  const Heading = compact ? "h2" : "h1";
  const filterInputClass =
    "h-9 w-full min-w-[140px] rounded-md px-2.5 text-xs dark:border-gray-700 dark:bg-gray-900";
  const filterSelectClass =
    "h-9 w-full min-w-[140px] rounded-md border border-gray-300 bg-white px-2.5 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <section
      className={compact ? "space-y-4 text-start" : "space-y-6 text-start"}
    >
      <header
        className={`border-b border-gray-200 pb-3 dark:border-gray-800 ${
          compact ? "" : "space-y-1 pb-4"
        }`}
      >
        <Heading
          className={
            compact
              ? "text-lg font-bold text-gray-800 dark:text-white/90"
              : "text-2xl font-bold text-gray-800 md:text-3xl dark:text-white/90"
          }
        >
          {recentOnly ? "أحدث المستخدمين" : "المستخدمون"}
        </Heading>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {compact
            ? "الهواتف محمية بسياسة الخصوصية، وعدد الطلبات غير متاح في بيانات الإدارة."
            : "للحفاظ على الخصوصية لا تعرض لوحة الإدارة أرقام الهاتف، ولا توفر واجهتها عدد الطلبات."}
        </p>
      </header>

      {!compact && error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <div className="shadow-theme-xs rounded-card border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table className="min-w-[620px] text-start text-sm">
            <TableHeader className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold text-gray-500 sm:px-5 dark:text-gray-400"
                >
                  الحساب
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold text-gray-500 sm:px-5 dark:text-gray-400"
                >
                  الدور
                </TableCell>
                <TableCell
                  isHeader
                  className="px-4 py-3 text-xs font-semibold whitespace-nowrap text-gray-500 sm:px-5 dark:text-gray-400"
                >
                  تاريخ التسجيل
                </TableCell>
              </TableRow>
              <TableRow className="border-t border-gray-200 dark:border-gray-800">
                <TableCell
                  isHeader
                  className="min-w-[190px] space-y-1 px-2 py-2 sm:px-3"
                >
                  <Input
                    type="search"
                    aria-label="تصفية حسب اسم المستخدم"
                    placeholder="الاسم"
                    value={nameFilter}
                    onChange={(event) => {
                      setNameFilter(event.target.value);
                      resetPage();
                    }}
                    className={filterInputClass}
                  />
                  <Input
                    type="search"
                    aria-label="تصفية حسب البريد الإلكتروني"
                    placeholder="البريد الإلكتروني"
                    value={emailFilter}
                    onChange={(event) => {
                      setEmailFilter(event.target.value);
                      resetPage();
                    }}
                    className={filterInputClass}
                  />
                </TableCell>
                <TableCell
                  isHeader
                  className="min-w-[160px] px-2 py-2 sm:px-3"
                >
                  <select
                    aria-label="تصفية حسب دور المستخدم"
                    value={roleFilter}
                    onChange={(event) => {
                      setRoleFilter(event.target.value as RoleFilter);
                      resetPage();
                    }}
                    className={filterSelectClass}
                  >
                    <option value="all" className="text-end">كل الأدوار</option>
                    <option value="user">مشتري</option>
                    <option value="shop">صاحب متجر</option>
                    <option value="admin">مشرف</option>
                  </select>
                </TableCell>
                <TableCell
                  isHeader
                  className="min-w-[170px] px-2 py-2 sm:px-3"
                >
                  <Input
                    type="date"
                    aria-label="تصفية حسب تاريخ التسجيل"
                    value={createdAtFilter}
                    onChange={(event) => {
                      setCreatedAtFilter(event.target.value);
                      resetPage();
                    }}
                    className={filterInputClass}
                  />
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {pagination.totalItems === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {isLoading
                      ? "جارٍ تحميل المستخدمين..."
                      : adminUsers.length === 0
                        ? "لا توجد حسابات مسجلة"
                        : "لا يوجد مستخدمون مطابقون لمعايير البحث"}
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((user) => (
                  <TableRow
                    key={user.id}
                    className="transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue dark:bg-brand-blue/20">
                          {user.fullName.trim().charAt(0) || "م"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                            {user.fullName}
                          </p>
                          <p
                            dir="ltr"
                            className="max-w-56 truncate text-start text-xs text-gray-500 dark:text-gray-400"
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 sm:px-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${ROLE_BADGE_CLASSES[user.role]}`}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-gray-500 sm:px-5 dark:text-gray-400">
                      {formatCreatedAt(user.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          currentPage={pagination.currentPage}
          onPageChange={pagination.setPage}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      </div>
    </section>
  );
};

export default AdminUsersDirectory;
