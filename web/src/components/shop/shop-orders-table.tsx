"use client";

import { useMemo, useState } from "react";
import TablePagination from "@/components/common/table-pagination";
import { Input } from "@/components/ui/input";
import useTablePagination from "@/hooks/use-table-pagination";
import type { ShopSubOrder } from "@/types/instamall";
import formatSypPrice from "@/utils/format-syp-price";

type StatusFilter = ShopSubOrder["status"] | "all";

interface ShopOrdersTableProps {
  compact?: boolean;
  onStatusChange: (id: string, confirm: boolean) => void | Promise<void>;
  orders: ShopSubOrder[];
}

const statusLabels: Record<ShopSubOrder["status"], string> = {
  PENDING: "بانتظار التأكيد",
  CONFIRMED: "تم التأكيد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

const filterInputClass =
  "h-8 rounded-md border-[#EBE1D6] px-2 text-[11px] dark:border-gray-700 dark:bg-gray-900";
const filterSelectClass =
  "h-8 w-full min-w-24 rounded-md border border-[#EBE1D6] bg-white px-2 text-[11px] text-[#0F172A] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const ShopOrdersTable = ({
  compact = false,
  onStatusChange,
  orders,
}: ShopOrdersTableProps) => {
  const [invoiceFilter, setInvoiceFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [totalFilter, setTotalFilter] = useState("");
  const [remainingFilter, setRemainingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { pageItems, resetPage, ...pagination } = useTablePagination(
    useMemo(() => {
      const invoiceQuery = invoiceFilter.trim().toLocaleLowerCase();
      const customerQuery = customerFilter.trim().toLocaleLowerCase();
      const totalQuery = totalFilter.replace(/\D/g, "");
      const remainingQuery = remainingFilter.replace(/\D/g, "");

      return orders.filter((order) => {
        if (
          invoiceQuery &&
          !order.invoiceNumber.toLocaleLowerCase().includes(invoiceQuery)
        ) {
          return false;
        }
        if (
          customerQuery &&
          !order.customerName.toLocaleLowerCase().includes(customerQuery)
        ) {
          return false;
        }
        if (
          totalQuery &&
          !String(Math.trunc(order.subtotalSyp / 100)).includes(totalQuery)
        ) {
          return false;
        }
        if (
          remainingQuery &&
          !String(order.remainingHours).includes(remainingQuery)
        ) {
          return false;
        }
        return statusFilter === "all" || order.status === statusFilter;
      });
    }, [
      customerFilter,
      invoiceFilter,
      orders,
      remainingFilter,
      statusFilter,
      totalFilter,
    ]),
  );

  const formatBuyerPhone = (phone: string, status: string) => {
    const raw = phone.replace(/\D/g, "");
    if (status === "CONFIRMED") {
      if (raw.length === 10)
        return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
      return phone;
    }
    if (raw.length >= 7) return `${raw.slice(0, 4)} ••• ${raw.slice(-3)}`;
    return "09•• ••• •••";
  };

  const formatBuyerNid = (nid: string, status: string) => {
    const raw = nid.replace(/\D/g, "");
    if (status === "CONFIRMED") return raw || nid;
    if (raw.length >= 3) return "••••••••" + raw.slice(-3);
    return "•••••••••••";
  };

  const updateTextFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    resetPage();
  };

  return (
    <div className="rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
      <div dir="rtl" className="overflow-x-auto">
        <table
          dir="rtl"
          className={`w-full text-right text-sm ${compact ? "min-w-[620px]" : "min-w-[640px]"}`}
        >
          <thead className="border-b border-[#EBE1D6] bg-[#F6F0E9]">
            <tr>
              {["الفاتورة", "المشتري", "الإجمالي", "المتبقي", "الحالة"].map(
                (label) => (
                  <th
                    key={label}
                    className={`${compact ? "px-3 py-3" : "px-4 py-3.5"} text-xs font-semibold text-[#475569]`}
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
            <tr className="border-t border-[#EBE1D6]/70">
              <th className="px-2 py-2">
                <Input
                  type="search"
                  aria-label="تصفية حسب رقم الفاتورة"
                  placeholder="رقم الفاتورة"
                  value={invoiceFilter}
                  onChange={(event) =>
                    updateTextFilter(setInvoiceFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th className="px-2 py-2">
                <Input
                  type="search"
                  aria-label="تصفية حسب اسم المشتري"
                  placeholder="اسم المشتري"
                  value={customerFilter}
                  onChange={(event) =>
                    updateTextFilter(setCustomerFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th className="px-2 py-2">
                <Input
                  type="search"
                  inputMode="numeric"
                  aria-label="تصفية حسب إجمالي الطلب"
                  placeholder="المبلغ"
                  value={totalFilter}
                  onChange={(event) =>
                    updateTextFilter(setTotalFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th className="px-2 py-2">
                <Input
                  type="search"
                  inputMode="numeric"
                  aria-label="تصفية حسب الساعات المتبقية"
                  placeholder="الساعات"
                  value={remainingFilter}
                  onChange={(event) =>
                    updateTextFilter(setRemainingFilter, event.target.value)
                  }
                  className={filterInputClass}
                />
              </th>
              <th className="px-2 py-2">
                <select
                  aria-label="تصفية حسب حالة الطلب"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as StatusFilter);
                    resetPage();
                  }}
                  className={filterSelectClass}
                >
                  <option value="all">كل الحالات</option>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {pagination.totalItems === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-[#475569]"
                >
                  {orders.length === 0
                    ? "لا توجد طلبات فرعية مسجلة لهذا المتجر"
                    : "لا توجد طلبات مطابقة لمعايير التصفية"}
                </td>
              </tr>
            ) : (
              pageItems.map((sub) => {
                const isPending = sub.status === "PENDING";
                const isConfirmed = sub.status === "CONFIRMED";

                return (
                  <tr
                    key={sub.id}
                    className="transition-colors hover:bg-[#FBF8F4]"
                  >
                    <td
                      className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} font-mono text-xs font-bold text-[#0F172A]`}
                    >
                      {sub.invoiceNumber}
                    </td>
                    <td className={`${compact ? "px-3 py-3.5" : "px-4 py-4"}`}>
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {sub.customerName}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-[#475569]">
                        {formatBuyerPhone(sub.customerPhone, sub.status)}
                      </p>
                      <p className="font-mono text-xs text-[#94A3B8]">
                        {formatBuyerNid(sub.customerNationalId, sub.status)}
                      </p>
                    </td>
                    <td
                      className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} font-mono text-sm font-semibold text-[#0F172A]`}
                    >
                      {formatSypPrice(sub.subtotalSyp)} ل.س
                    </td>
                    <td
                      className={`${compact ? "px-3 py-3.5" : "px-4 py-4"} text-sm`}
                    >
                      {isPending ? (
                        <span className="font-mono font-bold text-warn">
                          {sub.remainingHours} ساعات
                        </span>
                      ) : (
                        <span className="text-lineStrong">—</span>
                      )}
                    </td>
                    <td className={`${compact ? "px-3 py-3.5" : "px-4 py-4"}`}>
                      <div className="flex flex-col items-start gap-2">
                        {isConfirmed && (
                          <span className="inline-block rounded-full bg-okBg px-3 py-1 text-xs font-semibold text-ok">
                            تم التأكيد
                          </span>
                        )}
                        {isPending && (
                          <>
                            <span className="inline-block rounded-full bg-[#FDEFCB] px-3 py-1 text-xs font-semibold text-warn">
                              بانتظار التأكيد
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void onStatusChange(sub.id, true)
                                }
                                className="h-10 rounded-full bg-[#C40027] px-5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#a50021] active:scale-95"
                              >
                                تأكيد
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void onStatusChange(sub.id, false)
                                }
                                className="h-10 rounded-full border border-[#0F172A] bg-white px-4 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                              >
                                رفض
                              </button>
                            </div>
                          </>
                        )}
                        {!isConfirmed && !isPending && (
                          <span className="inline-block rounded-full bg-[#F6F0E9] px-3 py-1 text-xs font-semibold text-[#475569]">
                            {statusLabels[sub.status]}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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

export default ShopOrdersTable;
