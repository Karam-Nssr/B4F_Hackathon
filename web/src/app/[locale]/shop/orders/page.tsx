/*
Pseudocode:
Objective: render the dedicated Shop Sub-Orders management page with strict privacy masking rules (NFR-02).
Input: shopSubOrders, confirmSubOrder, rejectSubOrder from useInstaMallStore.
Process:
- Filter sub-orders for current shop.
- Apply NFR-02 privacy masking: when PENDING, phone (0944 ••• 034) and NID (••••••••034) are masked; when CONFIRMED, fully exposed.
- Render countdown timer for PENDING orders.
- Provide Confirm, Reject, and Contact Buyer action buttons with call dialog.
Output: dedicated shop sub-orders management screen.
*/
"use client";

import { useState } from "react";
import { useInstaMallStore } from "@/context/instamall-store";
import { CallIcon } from "@/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ShopOrdersPage = () => {
  const { shopSubOrders, confirmSubOrder, rejectSubOrder, error } =
    useInstaMallStore();
  const [callModalSub, setCallModalSub] = useState<
    (typeof shopSubOrders)[0] | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // The backend scopes this endpoint to the signed-in shop owner.
  const currentShopOrders = shopSubOrders;

  const handleStatusChange = async (id: string, confirm: boolean) => {
    setActionError(null);
    try {
      if (confirm) await confirmSubOrder(id);
      else await rejectSubOrder(id);
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "تعذر تحديث حالة الطلب",
      );
    }
  };

  const formatBuyerPhone = (phone: string, status: string) => {
    const raw = phone.replace(/\D/g, "");
    if (status === "CONFIRMED") {
      if (raw.length === 10)
        return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
      return phone;
    }
    if (raw.length >= 7) {
      return `${raw.slice(0, 4)} ••• ${raw.slice(-3)}`;
    }
    return "09•• ••• •••";
  };

  const formatBuyerNid = (nid: string, status: string) => {
    const raw = nid.replace(/\D/g, "");
    if (status === "CONFIRMED") return raw || nid;
    if (raw.length >= 3) return "••••••••" + raw.slice(-3);
    return "•••••••••••";
  };

  return (
    <div className="space-y-6 text-right">
      {(actionError || error) && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {actionError || error}
        </div>
      )}

      <div className="space-y-1 border-b border-[#EBE1D6]/70 pb-4">
        <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">
          طلبات المتجر
        </h1>
        <p className="text-sm text-[#475569]">
          مرتبة حسب الأقرب انتهاءً للمهلة · أرقام الهوية مخفية حتى التأكيد
        </p>
      </div>

      <div
        dir="rtl"
        className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]"
      >
        <table dir="rtl" className="w-full min-w-[720px] text-right text-sm">
          <thead className="border-b border-[#EBE1D6] bg-[#F6F0E9]">
            <tr>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#475569]">
                الفاتورة
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#475569]">
                المشتري
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#475569]">
                الإجمالي
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#475569]">
                المتبقي
              </th>
              <th className="px-4 py-3.5 text-xs font-semibold text-[#475569]">
                الحالة
              </th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold text-[#475569]">
                إجراء
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {currentShopOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-[#475569]"
                >
                  لا توجد طلبات فرعية مسجلة لهذا المتجر
                </td>
              </tr>
            ) : (
              currentShopOrders.map((sub) => {
                const isPending = sub.status === "PENDING";
                const isConfirmed = sub.status === "CONFIRMED";

                return (
                  <tr
                    key={sub.id}
                    className="transition-colors hover:bg-[#FBF8F4]"
                  >
                    <td className="px-4 py-4 font-mono text-xs font-bold text-[#0F172A]">
                      {sub.invoiceNumber}
                    </td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4 font-mono text-sm font-semibold text-[#0F172A]">
                      {sub.subtotalSyp.toLocaleString("en-US")} ل.س
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {isPending ? (
                        <span className="font-mono font-bold text-warn">
                          {sub.remainingHours} ساعات
                        </span>
                      ) : (
                        <span className="text-lineStrong">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isConfirmed && (
                        <span className="inline-block rounded-full bg-okBg px-3 py-3 text-xs font-semibold text-ok">
                          تم التأكيد
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-block rounded-full bg-[#FDEFCB] px-3 py-1 text-xs font-semibold text-warn">
                          بانتظار التأكيد
                        </span>
                      )}
                      {!isConfirmed && !isPending && (
                        <span className="inline-block rounded-full bg-[#F6F0E9] px-3 py-1 text-xs font-semibold text-[#475569]">
                          ملغي
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusChange(sub.id, true)
                              }
                              className="h-10 rounded-full bg-[#C40027] px-5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#a50021] active:scale-95"
                            >
                              تأكيد
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleStatusChange(sub.id, false)
                              }
                              className="h-10 rounded-full border border-[#0F172A] bg-white px-4 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <button
                            type="button"
                            onClick={() => setCallModalSub(sub)}
                            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#0F172A] bg-white px-5 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                          >
                            <CallIcon className="size-4" />
                            <span>اتصل بالمشتري</span>
                          </button>
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

      {/* Call Customer Modal */}
      {callModalSub && (
        <Dialog
          open={Boolean(callModalSub)}
          onOpenChange={() => setCallModalSub(null)}
        >
          <DialogContent className="max-w-sm rounded-[24px] bg-white p-6 text-right">
            <DialogHeader className="border-b border-[#EBE1D6] pb-3 text-right">
              <DialogTitle className="text-base font-bold text-[#0F172A]">
                بيانات اتصال المشتري
              </DialogTitle>
              <DialogDescription className="text-xs text-[#15803D]">
                تم تأكيد الطلب — الهوية مكشوفة بالكامل للتواصل والتسليم
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3 text-sm">
              <div className="space-y-2 rounded-[14px] bg-[#FBF8F4] p-3">
                <div>
                  <span className="block text-xs text-[#475569]">
                    اسم المشتري:
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {callModalSub.customerName}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#475569]">
                    رقم الهاتف:
                  </span>
                  <a
                    href={`tel:${callModalSub.customerPhone}`}
                    className="font-mono font-bold text-[#C40027] hover:underline"
                  >
                    {callModalSub.customerPhone}
                  </a>
                </div>
                <div>
                  <span className="block text-xs text-[#475569]">
                    الرقم الوطني:
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#0F172A]">
                    {callModalSub.customerNationalId}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#475569]">
                    إجمالي الفاتورة:
                  </span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {callModalSub.subtotalSyp.toLocaleString("en-US")} ل.س
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCallModalSub(null)}
                className="h-10 rounded-full bg-[#0F172A] px-6 text-xs font-semibold text-white"
              >
                إغلاق
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShopOrdersPage;
