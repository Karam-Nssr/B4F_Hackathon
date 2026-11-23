"use client";

import { useMemo, useState } from "react";
import { ShopImage } from "@/components/storefront/shop-image";
import TablePagination from "@/components/common/table-pagination";
import { Input } from "@/components/ui/input";
import useTablePagination from "@/hooks/use-table-pagination";
import type { Shop } from "@/types/instamall";

type StatusFilter = "all" | "active" | "inactive";

interface AdminShopsTableProps {
  compact?: boolean;
  isLoading: boolean;
  shops: Shop[];
}

const filterInputClass =
  "h-8 rounded-md border-[#EBE1D6] px-2 text-[11px] dark:border-gray-700 dark:bg-gray-900";
const filterSelectClass =
  "h-8 w-full min-w-24 rounded-md border border-[#EBE1D6] bg-white px-2 text-[11px] text-[#0F172A] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const AdminShopsTable = ({
  compact = false,
  isLoading,
  shops,
}: AdminShopsTableProps) => {
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { pageItems, resetPage, ...pagination } = useTablePagination(
    useMemo(() => {
      const nameQuery = nameFilter.trim().toLocaleLowerCase();
      const categoryQuery = categoryFilter.trim().toLocaleLowerCase();

      return shops.filter((shop) => {
        if (
          nameQuery &&
          !`${shop.shopName} ${shop.description}`
            .toLocaleLowerCase()
            .includes(nameQuery)
        ) {
          return false;
        }
        if (
          categoryQuery &&
          !shop.category.toLocaleLowerCase().includes(categoryQuery)
        ) {
          return false;
        }
        return (
          statusFilter === "all" ||
          (statusFilter === "active" ? shop.isActive : !shop.isActive)
        );
      });
    }, [categoryFilter, nameFilter, shops, statusFilter]),
  );

  const updateTextFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };

  return (
    <div className="rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
      <div dir="rtl" className="overflow-x-auto">
        <table
          dir="rtl"
          className={`w-full text-right text-sm ${compact ? "min-w-[620px]" : "min-w-[720px]"}`}
        >
          <thead className="border-b border-[#EBE1D6] bg-[#F6F0E9]">
            <tr>
              {[
                "المتجر",
                "المدينة",
                "التصنيف",
                "عدد المنتجات",
                "الحالة",
                "إجراء",
              ].map((label) => (
                <th
                  key={label}
                  className={`${compact ? "px-3 py-3" : "px-4 py-3.5"} text-xs font-semibold text-[#475569]`}
                >
                  {label}
                </th>
              ))}
            </tr>
            <tr className="border-t border-[#EBE1D6]/70">
              <th className="px-2 py-2">
                <Input
                  type="search"
                  aria-label="تصفية حسب اسم المتجر"
                  placeholder="اسم المتجر"
                  value={nameFilter}
                  onChange={(event) =>
                    updateTextFilter(setNameFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th />
              <th className="px-2 py-2">
                <Input
                  type="search"
                  aria-label="تصفية حسب تصنيف المتجر"
                  placeholder="التصنيف"
                  value={categoryFilter}
                  onChange={(event) =>
                    updateTextFilter(setCategoryFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th />
              <th className="px-2 py-2">
                <select
                  aria-label="تصفية حسب حالة المتجر"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as StatusFilter);
                    resetPage();
                  }}
                  className={filterSelectClass}
                >
                  <option value="all">كل الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">متوقف</option>
                </select>
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {pagination.totalItems === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-[#475569]"
                >
                  {shops.length === 0
                    ? isLoading
                      ? "جارٍ تحميل المتاجر..."
                      : "لا توجد متاجر مسجلة"
                    : "لا توجد متاجر مطابقة لمعايير التصفية"}
                </td>
              </tr>
            ) : (
              pageItems.map((shop) => (
                <tr
                  key={shop.id}
                  className="transition-colors hover:bg-[#FBF8F4]"
                >
                  <td className={`${compact ? "px-3 py-3.5" : "px-4 py-4"}`}>
                    <div className="flex items-center gap-3">
                      <ShopImage
                        shop={shop}
                        sizeClassName={compact ? "size-9" : "size-10"}
                      />
                      <div>
                        <p
                          className={`${compact ? "text-xs" : "text-sm"} font-bold text-[#0F172A]`}
                        >
                          {shop.shopName}
                        </p>
                        <p className="text-xs text-[#475569]">
                          {shop.description || "—"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} text-xs text-[#475569]`}
                  >
                    —
                  </td>
                  <td
                    className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} text-xs text-[#475569]`}
                  >
                    {shop.category}
                  </td>
                  <td
                    className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} text-xs text-[#475569]`}
                  >
                    —
                  </td>
                  <td className={`${compact ? "px-3 py-3.5" : "px-4 py-4"}`}>
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
                  <td
                    className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} text-center text-xs text-[#94A3B8]`}
                  >
                    —
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={pagination.currentPage}
        onPageChange={pagination.setPage}
        totalItems={pagination.totalItems}
        totalPages={pagination.totalPages}
      />
    </div>
  );
};

export default AdminShopsTable;
