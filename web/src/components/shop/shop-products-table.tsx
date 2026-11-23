"use client";

import { useMemo, useState } from "react";
import { PencilIcon, TrashBinIcon } from "@/icons";
import TablePagination from "@/components/common/table-pagination";
import { Input } from "@/components/ui/input";
import useTablePagination from "@/hooks/use-table-pagination";
import type { Product } from "@/types/instamall";
import formatSypPrice from "@/utils/format-syp-price";
import localizeProductTitle from "@/utils/localize-product-title";
import {
  localizeCategory,
  localizeProductDescription,
} from "@/utils/localize-catalog-text";
import { useLocale } from "next-intl";

interface ShopProductsTableProps {
  compact?: boolean;
  onDelete: (productId: string) => void;
  onEdit: (product: Product) => void;
  products: Product[];
  recentOnly?: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

const filterInputClass =
  "h-9 w-full min-w-[140px] rounded-md border-[#EBE1D6] px-2.5 text-xs dark:border-gray-700 dark:bg-gray-900";
const filterSelectClass =
  "h-9 w-full min-w-[140px] rounded-md border border-[#EBE1D6] bg-white px-2.5 text-xs text-[#0F172A] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const ShopProductsTable = ({
  compact = false,
  onDelete,
  onEdit,
  products,
  recentOnly = false,
}: ShopProductsTableProps) => {
  const locale = useLocale();
  const [titleFilter, setTitleFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { pageItems, resetPage, ...pagination } = useTablePagination(
    useMemo(() => {
      const titleQuery = titleFilter.trim().toLocaleLowerCase(locale);
      const categoryQuery = categoryFilter.trim().toLocaleLowerCase(locale);
      const priceQuery = priceFilter.replace(/\D/g, "");

      return products
        .slice(0, recentOnly ? 5 : products.length)
        .filter((product) => {
          const localizedTitle = localizeProductTitle(product.title, locale);
          const localizedDescription = localizeProductDescription(
            product.description,
            product.title,
            locale,
          );
          if (
            titleQuery &&
            !`${product.title} ${localizedTitle} ${product.description} ${localizedDescription}`
              .toLocaleLowerCase(locale)
              .includes(titleQuery)
          ) {
            return false;
          }
          if (
            categoryQuery &&
            !`${product.category} ${localizeCategory(product.category, locale)}`
              .toLocaleLowerCase(locale)
              .includes(categoryQuery)
          ) {
            return false;
          }
          if (
            priceQuery &&
            !String(Math.trunc(product.priceSyp / 100)).includes(priceQuery)
          ) {
            return false;
          }
          return (
            compact ||
            statusFilter === "all" ||
            (statusFilter === "active" ? product.isActive : !product.isActive)
          );
        });
    }, [
      categoryFilter,
      compact,
      priceFilter,
      products,
      recentOnly,
      statusFilter,
      titleFilter,
      locale,
    ]),
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
              <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                المنتج
              </th>
              <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                التصنيف
              </th>
              <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                السعر
              </th>
              {!compact && (
                <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                  الحالة
                </th>
              )}
              <th className="px-3 py-3 text-center text-xs font-semibold text-[#475569]">
                إجراء
              </th>
            </tr>
            <tr className="border-t border-[#EBE1D6]/70">
              <th className="min-w-[160px] px-2 py-2">
                <Input
                  type="search"
                  aria-label="تصفية حسب اسم المنتج"
                  placeholder="اسم المنتج"
                  value={titleFilter}
                  onChange={(event) =>
                    updateTextFilter(setTitleFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th className="min-w-[150px] px-2 py-2">
                <Input
                  type="search"
                  aria-label="تصفية حسب تصنيف المنتج"
                  placeholder="التصنيف"
                  value={categoryFilter}
                  onChange={(event) =>
                    updateTextFilter(setCategoryFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th className="min-w-[130px] px-2 py-2">
                <Input
                  type="search"
                  inputMode="numeric"
                  aria-label="تصفية حسب سعر المنتج"
                  placeholder="السعر"
                  value={priceFilter}
                  onChange={(event) =>
                    updateTextFilter(setPriceFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              {!compact && (
                <th className="min-w-[150px] px-2 py-2">
                  <select
                    aria-label="تصفية حسب حالة المنتج"
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value as StatusFilter);
                      resetPage();
                    }}
                    className={filterSelectClass}
                  >
                    <option value="all" className="text-end">كل الحالات</option>
                    <option value="active"  className="text-end">نشط</option>
                    <option value="inactive"  className="text-end">غير نشط</option>
                  </select>
                </th>
              )}
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {pagination.totalItems === 0 ? (
              <tr>
                <td
                  colSpan={compact ? 4 : 5}
                  className="py-12 text-center text-sm text-[#475569]"
                >
                  {products.length === 0
                    ? "لا توجد منتجات مسجلة في هذا المتجر حالياً"
                    : "لا توجد منتجات مطابقة لمعايير التصفية"}
                </td>
              </tr>
            ) : (
              pageItems.map((product) => (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-[#FBF8F4]"
                >
                  <td className="px-3 py-3">
                    {compact ? (
                      <p className="line-clamp-1 text-xs font-bold text-[#0F172A]">
                        {localizeProductTitle(product.title, locale)}
                      </p>
                    ) : (
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={localizeProductTitle(product.title, locale)}
                          className="size-10 rounded-[10px] bg-[#F6F0E9] object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">
                            {localizeProductTitle(product.title, locale)}
                          </p>
                          <p className="line-clamp-1 text-xs text-[#475569]">
                            {localizeProductDescription(
                              product.description,
                              product.title,
                              locale,
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-[#475569]">
                    {localizeCategory(product.category, locale)}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-semibold text-[#0F172A]">
                    {formatSypPrice(product.priceSyp)} ل.س
                  </td>
                  {!compact && (
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          product.isActive
                            ? "bg-[#D8F1E4] text-[#15803D]"
                            : "bg-[#F6F0E9] text-[#475569]"
                        }`}
                      >
                        {product.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className={
                          compact
                            ? "flex size-8 items-center justify-center rounded-full border border-[#0F172A]/30 text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                            : "inline-flex h-9 items-center gap-1.5 rounded-full border border-[#0F172A] bg-white px-3.5 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                        }
                        title="تعديل"
                      >
                        <PencilIcon className="size-3.5" />
                        {!compact && <span>تعديل</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className={
                          compact
                            ? "flex size-8 items-center justify-center rounded-full border border-[#BA1A1A]/30 text-[#BA1A1A] transition-all hover:bg-[#BA1A1A] hover:text-white"
                            : "inline-flex h-9 items-center gap-1.5 rounded-full border border-[#BA1A1A] bg-white px-3.5 text-xs font-semibold text-[#BA1A1A] transition-all hover:bg-[#BA1A1A] hover:text-white"
                        }
                        title="حذف"
                      >
                        <TrashBinIcon className="size-3.5" />
                        {!compact && <span>حذف</span>}
                      </button>
                    </div>
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

export default ShopProductsTable;
