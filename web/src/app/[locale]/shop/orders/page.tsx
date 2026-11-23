/*
Pseudocode:
Objective: render the dedicated Shop Sub-Orders management page with strict privacy masking rules (NFR-02).
Input: shopSubOrders, confirmSubOrder, rejectSubOrder from useInstaMallStore.
Process:
- Filter sub-orders for current shop.
- Apply NFR-02 privacy masking: when PENDING, phone (0944 ••• 034) and NID (••••••••034) are masked; when CONFIRMED, fully exposed.
- Render countdown timer for PENDING orders.
- Keep order confirmation and rejection controls in the status column without a contact action.
Output: dedicated shop sub-orders management screen.
*/
"use client";

import { useState } from "react";
import { useInstaMallStore } from "@/context/instamall-store";
import getErrorMessage from "@/utils/get-error-message";
import { useLocale } from "next-intl";
import ShopOrdersTable from "@/components/shop/shop-orders-table";

const ShopOrdersPage = () => {
  const locale = useLocale();
  const { shopSubOrders, confirmSubOrder, rejectSubOrder, error } =
    useInstaMallStore();
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
        getErrorMessage(caught, locale, "تعذر تحديث حالة الطلب"),
      );
    }
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

      <ShopOrdersTable
        orders={currentShopOrders}
        onStatusChange={handleStatusChange}
      />

    </div>
  );
};

export default ShopOrdersPage;
