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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInstaMallStore } from "@/context/instamall-store";
import { SearchIcon } from "@/icons";
import type { UserRole } from "@/types/instamall";

type RoleFilter = UserRole | "all";

interface AdminUsersDirectoryProps {
  compact?: boolean;
}

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: "all", label: "الكل" },
  { value: "user", label: "مشتري" },
  { value: "shop", label: "صاحب متجر" },
  { value: "admin", label: "مشرف" },
];

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

const AdminUsersDirectory = ({ compact = false }: AdminUsersDirectoryProps) => {
  const locale = useLocale();
  const { adminUsers, isLoading, error } = useInstaMallStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const query = search.trim().toLocaleLowerCase(locale);

  const filteredUsers = adminUsers.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (!query) return true;

    return (
      user.fullName.toLocaleLowerCase(locale).includes(query) ||
      user.email.toLocaleLowerCase(locale).includes(query)
    );
  });
  const Heading = compact ? "h2" : "h1";

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
          المستخدمون
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

      <div
        className={`flex flex-col gap-3 ${
          compact ? "" : "sm:flex-row sm:items-center sm:justify-between"
        }`}
      >
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-gray-400" />
          <Input
            type="search"
            aria-label="ابحث عن مستخدم بالاسم أو البريد الإلكتروني"
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-full ps-10 pe-4 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_FILTERS.map((filter) => {
            const isActive = roleFilter === filter.value;

            return (
              <Button
                key={filter.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                size={compact ? "xs" : "sm"}
                aria-pressed={isActive}
                onClick={() => setRoleFilter(filter.value)}
                className={`rounded-full ${
                  isActive
                    ? "bg-brand-blue text-white hover:bg-brand-blue-hover focus-visible:ring-brand-blue/20"
                    : ""
                }`}
              >
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="shadow-theme-xs overflow-x-auto rounded-card border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <Table className="min-w-full text-start text-sm">
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
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredUsers.length === 0 ? (
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
              filteredUsers.map((user) => (
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
    </section>
  );
};

export default AdminUsersDirectory;
