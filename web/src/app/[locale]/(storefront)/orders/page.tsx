/*
Pseudocode:
Objective: render User Orders & Invoices page with 1-24h countdown timer, status filters, and interactive invoice viewer.
Input: masterOrders and shopSubOrders from useInstaMallStore.
Process:
- Provide status tabs (الكل, بانتظار, مؤكد, ملغي).
- Display Master Order summary card with order number, total SYP amount, and date.
- Display Sub-Order cards with:
  - Confirmed sub-orders (green badge, full amount, invoice button)
  - Pending sub-orders (amber badge, remaining hours countdown, live progress bar, invoice button)
  - Cancelled/Expired sub-orders (grey badge, re-order button)
- Provide interactive Invoice modal showing detailed offline invoice.
Output: a complete user orders tracking and invoice viewing page.
*/
"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import type { ShopSubOrder } from "@/types/instamall";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type StatusTab = "الكل" | "بانتظار" | "مؤكد" | "ملغي";

const tabFilters: { label: StatusTab; value: string }[] = [
  { label: "الكل", value: "ALL" },
  { label: "بانتظار", value: "PENDING" },
  { label: "مؤكد", value: "CONFIRMED" },
  { label: "ملغي", value: "CANCELLED" },
];

const OrdersPage = () => {
  const router = useRouter();
  const {
    masterOrders,
    shopSubOrders,
    products,
    addToCart,
    currentUser,
    loginAsDemo,
  } = useInstaMallStore();
  const [activeTab, setActiveTab] = useState<StatusTab>("الكل");
  const [selectedInvoice, setSelectedInvoice] = useState<ShopSubOrder | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo("user");
    } catch {
      setReorderError("تعذر تسجيل الدخول التجريبي");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#EBE1D6] bg-white p-10 text-center shadow-card space-y-5 my-8">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-[#FDE7EA] text-2xl">
          📋
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#0F172A]">تسجيل الدخول مطلوب لعرض طلباتك</h2>
          <p className="text-sm text-[#475569]">
            يرجى تسجيل الدخول بحساب المشتري لمتابعة فواتيرك وحالة تأكيد المتاجر والعد التنازلي (1-24h).
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void handleDemoLogin()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#C40027] px-6 text-sm font-semibold text-white shadow-red hover:bg-[#a50021]"
          >
            الدخول المباشر كمشتري تجريبي
          </button>
          <Link
            href="/auth"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#0F172A] bg-white px-6 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F0E9]"
          >
            صفحة تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const filteredSubOrders = shopSubOrders.filter((sub) => {
    if (activeTab === "الكل") return true;
    if (activeTab === "بانتظار") return sub.status === "PENDING";
    if (activeTab === "مؤكد") return sub.status === "CONFIRMED";
    if (activeTab === "ملغي") return sub.status === "CANCELLED" || sub.status === "COMPLETED";
    return true;
  });

  const latestMasterOrder = masterOrders[0];

  // Backend order items store titles only, so re-order resolves them against the live catalog.
  const handleReorder = (sub: ShopSubOrder) => {
    setReorderError(null);
    let matched = 0;
    for (const item of sub.items) {
      const product = products.find((candidate) => candidate.title === item.title);
      if (!product) continue;
      matched += 1;
      addToCart({
        productId: product.id,
        shopId: product.shopId,
        shopName: product.shopName,
        shopCity: sub.shopCity,
        title: product.title,
        unitPriceSyp: product.priceSyp,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
        shopResponseHours: 24,
      });
    }
    if (matched === 0) {
      setReorderError("المنتجات في هذا الطلب لم تعد متوفرة في الكتالوج الحالي");
      return;
    }
    router.push("/cart");
  };

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#0F172A] md:text-4xl">طلباتي والفواتير</h1>
        <p className="text-base text-[#475569]">
          كل طلب رئيسي ينقسم إلى فواتير مستقلة لكل متجر.
        </p>
      </div>

      {reorderError && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {reorderError}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabFilters.map((tab) => {
          const isActive = activeTab === tab.label;
          let activeClass = "bg-[#0F172A] text-white";
          if (isActive) {
            if (tab.label === "بانتظار") activeClass = "bg-[#FFF1D2] text-[#B45309] font-bold ring-1 ring-[#B45309]";
            else if (tab.label === "مؤكد") activeClass = "bg-[#D8F1E4] text-[#15803D] font-bold ring-1 ring-[#15803D]";
            else if (tab.label === "ملغي") activeClass = "bg-[#F6F0E9] text-[#475569] font-bold ring-1 ring-[#94A3B8]";
          }

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? activeClass
                  : "border border-[#94A3B8]/60 bg-white text-[#0F172A] hover:bg-[#F6F0E9]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Latest Master Order Summary Header Card */}
      {latestMasterOrder && (
        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#F6F0E9] p-5 shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Master Order Number */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#475569]">الطلب الرئيسي:</span>
              <span className="font-mono text-lg font-bold text-[#0F172A]">
                {latestMasterOrder.orderNumber}
              </span>
            </div>

            {/* Total + Date */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-medium text-[#475569]">الإجمالي:</span>
                <span className="font-mono text-xl font-bold text-[#0F172A]">
                  {latestMasterOrder.totalAmountSyp.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-[#475569]">ل.س</span>
              </div>

              <div className="text-xs text-[#475569]">
                {new Date(latestMasterOrder.createdAt).toLocaleDateString("ar-SY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Orders List */}
      <div className="space-y-4">
        {filteredSubOrders.length === 0 ? (
          <div className="rounded-[22px] border border-[#EBE1D6] bg-white py-16 text-center">
            <p className="text-base text-[#475569]">لا توجد طلبات في هذه الحالة</p>
          </div>
        ) : (
          filteredSubOrders.map((sub) => {
            const isPending = sub.status === "PENDING";
            const isConfirmed = sub.status === "CONFIRMED";
            const isCancelled = sub.status === "CANCELLED" || sub.status === "COMPLETED";

            const remainingPct = isPending
              ? Math.max(5, Math.min(100, Math.round((sub.remainingHours / 24) * 100)))
              : 0;

            return (
              <div
                key={sub.id}
                className="rounded-[22px] border border-[#EBE1D6] bg-white p-5 shadow-[0px_4px_16px_rgba(15,23,42,0.06)] space-y-4"
              >
                {/* Header Row: Invoice ID + Badge + Amount */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#0F172A]">
                      {sub.invoiceNumber}
                    </span>

                    {isConfirmed && (
                      <span className="rounded-full bg-[#D8F1E4] px-3.5 py-1 text-xs font-semibold text-[#15803D]">
                        تم التأكيد
                      </span>
                    )}

                    {isPending && (
                      <span className="rounded-full bg-[#FDEFCB] px-3.5 py-1 text-xs font-semibold text-[#B45309]">
                        بانتظار الرد
                      </span>
                    )}

                    {isCancelled && (
                      <span className="rounded-full bg-[#F6F0E9] px-3.5 py-1 text-xs font-semibold text-[#475569]">
                        انتهت المهلة
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-lg font-bold text-[#0F172A]">
                      {sub.subtotalSyp.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs text-[#475569]">ل.س</span>
                  </div>
                </div>

                {/* Shop details & Items */}
                <div className="text-sm text-[#475569] space-y-1">
                  <p className="font-medium text-[#0F172A]">
                    متجر {sub.shopName} · {sub.shopCity || "المدينة غير متوفرة"}
                  </p>
                  <p className="text-xs text-[#475569]">
                    {sub.items.map((it) => `${it.title} × ${it.quantity}`).join("، ")}
                  </p>
                </div>

                {/* Countdown Timer Widget for Pending Sub-Orders */}
                {isPending && (
                  <div className="rounded-[14px] bg-[#FFF9F2] p-3.5 border border-[#B45309]/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">
                        متبقّي حتى انتهاء مهلة المتجر:
                      </span>
                      <span className="font-mono font-bold text-[#B45309]">
                        {sub.remainingHours} ساعة من 24
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECE3D9]">
                      <div
                        className="h-full rounded-full bg-[#B45309] transition-all duration-500"
                        style={{ width: `${remainingPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer Action */}
                <div className="flex items-center justify-end border-t border-[#EBE1D6]/60 pt-3">
                  {isCancelled ? (
                    <button
                      type="button"
                      onClick={() => handleReorder(sub)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#0F172A] bg-white px-6 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#0F172A] hover:text-white"
                    >
                      إعادة الطلب
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(sub)}
                      className="inline-flex h-11 items-center justify-center rounded-full border border-[#0F172A] bg-white px-6 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#0F172A] hover:text-white"
                    >
                      عرض الفاتورة
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Modal / Dialog */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg rounded-[24px] bg-white p-6 text-right">
            <DialogHeader className="text-right border-b border-[#EBE1D6] pb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#C40027]">
                  {selectedInvoice.invoiceNumber}
                </span>
                <DialogTitle className="text-lg font-bold text-[#0F172A]">
                  فاتورة متجر {selectedInvoice.shopName}
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-[14px] bg-[#FBF8F4] p-3 text-xs">
                <div>
                  <span className="block text-[#475569]">الطلب الرئيسي:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">
                    {selectedInvoice.masterOrderNumber}
                  </span>
                </div>
                <div>
                  <span className="block text-[#475569]">المدينة:</span>
                  <span className="font-semibold text-[#0F172A]">
                    {selectedInvoice.shopCity || "غير متوفرة"}
                  </span>
                </div>
                <div>
                  <span className="block text-[#475569]">المشتري:</span>
                  <span className="font-semibold text-[#0F172A]">{selectedInvoice.customerName}</span>
                </div>
                <div>
                  <span className="block text-[#475569]">الهاتف:</span>
                  <span className="font-mono font-semibold text-[#0F172A]">
                    {selectedInvoice.customerPhone}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#0F172A]">تفاصيل المنتجات:</h4>
                <div className="divide-y divide-[#EBE1D6]/60 rounded-[14px] border border-[#EBE1D6] p-3">
                  {selectedInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-xs">
                      <div>
                        <span className="font-medium text-[#0F172A]">{item.title}</span>
                        <span className="text-[#475569] ms-2">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-bold text-[#0F172A]">
                        {(item.unitPriceSyp * item.quantity).toLocaleString("en-US")} ل.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between rounded-[14px] bg-[#FFF3F1] p-3">
                <span className="font-semibold text-[#0F172A]">إجمالي الفاتورة:</span>
                <span className="font-mono text-lg font-bold text-[#C40027]">
                  {selectedInvoice.subtotalSyp.toLocaleString("en-US")} ل.س
                </span>
              </div>

              <p className="text-center text-xs text-[#475569]">
                الدفع والتسليم يتمان مباشرة مع المتجر بعد تأكيد الطلب.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrdersPage;
