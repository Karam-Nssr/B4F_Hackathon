/*
Pseudocode:
Objective: render the Unified Cart & Split-Order Checkout page matching Figma user_cart.html and SAD v1.2.
Input: reads cart, currentUser, checkout, updateQuantity, removeFromCart from useInstaMallStore.
Process:
- Group cart items by shop.
- Display Attached Identity card (Phone & Masked National ID) with toggle and link to /account.
- Render Sub-orders per shop with item thumbnail, details, unified pill quantity stepper, and line total.
- Render Master Order summary box (soft red tint bg-[#FFF3F1]) with per-shop subtotal breakdown and grand total.
- Checkout posts real order items to the backend and navigates to /orders on success.
Output: an interactive, responsive unified cart page.
*/
"use client";

import { useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import { MinusIcon, PlusIcon, TrashBinIcon } from "@/icons";
import getErrorMessage from "@/utils/get-error-message";
import formatSypPrice from "@/utils/format-syp-price";
import localizeProductTitle from "@/utils/localize-product-title";
import { localizeShopName } from "@/utils/localize-catalog-text";
import { useLocale } from "next-intl";

const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const maskNationalId = (id: string): string => {
  const digits = id.replace(/\D/g, "");
  if (digits.length < 3) return "•••••••••••";
  return "•".repeat(8) + digits.slice(-3);
};

const CartPage = () => {
  const locale = useLocale();
  const router = useRouter();
  const { cart, currentUser, checkout, updateQuantity, removeFromCart, error } =
    useInstaMallStore();

  const [showFullId, setShowFullId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Group cart items by shopId
  const groupedShops = useMemo(() => {
    const map = new Map<
      string,
      {
        shopId: string;
        shopName: string;
        shopCity: string;
        shopResponseHours: number;
        items: typeof cart;
      }
    >();

    for (const item of cart) {
      if (!map.has(item.shopId)) {
        map.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
          shopCity: item.shopCity,
          shopResponseHours: item.shopResponseHours,
          items: [],
        });
      }
      map.get(item.shopId)!.items.push(item);
    }

    return Array.from(map.values());
  }, [cart]);

  const grandTotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + item.unitPriceSyp * item.quantity,
      0,
    );
  }, [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      const order = await checkout();
      if (order) router.push("/orders");
    } catch (caught) {
      setCheckoutError(getErrorMessage(caught, locale, "تعذر إرسال الطلب"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-right">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#0F172A] md:text-4xl">
          السلة الموحدة
        </h1>
        <p className="text-base text-[#475569]">
          أضف من عدة متاجر؛ نقسّم الطلب تلقائياً إلى طلب وفاتورة لكل متجر.
        </p>
      </div>

      {(checkoutError || error) && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {checkoutError || error}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] border border-[#EBE1D6] bg-white p-12 text-center shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
          <p className="text-lg font-medium text-[#475569]">
            سلة التسوق فارغة حالياً
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            تصفح التشكيلة وأضف منتجاتك المفضلة من المتاجر السورية
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#C40027] px-8 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Right Column in RTL: Attached Identity + Sub-Orders */}
          <div className="flex-1 space-y-6">
            {/* Attached Identity Card */}
            <div className="rounded-[22px] border border-[#EBE1D6] bg-white p-5 shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between border-b border-[#EBE1D6]/70 pb-3">
                <h2 className="text-base font-semibold text-[#0F172A]">
                  هويتك مرفقة بالفاتورة
                </h2>
                <Link
                  href="/account"
                  className="text-sm font-medium text-[#C40027] hover:underline"
                >
                  تعديل
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[14px] border border-[#94A3B8]/30 bg-[#FBF8F4] p-3">
                  <span className="block text-xs font-medium text-[#475569]">
                    الهاتف
                  </span>
                  <span className="mt-1 block font-mono text-sm font-semibold text-[#0F172A]">
                    {currentUser?.phone
                      ? formatPhone(currentUser.phone)
                      : "غير متوفر"}
                  </span>
                </div>

                <div className="rounded-[14px] border border-[#94A3B8]/30 bg-[#FBF8F4] p-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-medium text-[#475569]">
                      الرقم الوطني
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFullId(!showFullId)}
                      className="text-xs font-semibold text-[#C40027] hover:underline"
                    >
                      {showFullId ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                  <span className="mt-1 block font-mono text-sm font-semibold text-[#0F172A]">
                    {!currentUser?.nationalId
                      ? "غير متوفر"
                      : showFullId
                        ? currentUser.nationalId
                        : maskNationalId(currentUser.nationalId)}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Orders List per Shop */}
            <div className="space-y-6">
              {groupedShops.map((group, groupIndex) => {
                const shopSubtotal = group.items.reduce(
                  (acc, item) => acc + item.unitPriceSyp * item.quantity,
                  0,
                );

                return (
                  <div
                    key={group.shopId}
                    className="rounded-[22px] border border-[#EBE1D6] bg-white p-5 shadow-[0px_4px_16px_rgba(15,23,42,0.06)]"
                  >
                    {/* Sub-Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBE1D6]/70 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0F172A]">
                          طلب فرعي #{groupIndex + 1}:
                        </span>
                        <span className="text-sm font-medium text-[#0F172A]">
                          متجر {localizeShopName(group.shopName, locale)}
                        </span>
                        <span className="rounded-full bg-[#F6F0E9] px-2.5 py-0.5 text-xs text-[#475569]">
                          {group.shopCity}
                        </span>
                      </div>

                      <div className="text-xs text-[#475569]">
                        المجموع الفرعي:{" "}
                        <span className="font-mono font-bold text-[#0F172A]">
                          {formatSypPrice(shopSubtotal)}
                        </span>{" "}
                        ل.س
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-[#EBE1D6]/50">
                      {group.items.map((item) => {
                        const lineTotal = item.unitPriceSyp * item.quantity;

                        return (
                          <div
                            key={item.productId}
                            className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            {/* Product Info */}
                            <div className="flex items-center gap-3.5">
                              <img
                                src={item.imageUrl}
                                alt={localizeProductTitle(item.title, locale)}
                                className="size-14 rounded-[14px] bg-[#F6F0E9] object-cover ring-1 ring-[#EBE1D6]"
                              />
                              <div>
                                <h4 className="text-sm font-semibold text-[#0F172A]">
                                  {localizeProductTitle(item.title, locale)}
                                </h4>
                                {item.variantNote && (
                                  <p className="text-xs text-[#475569]">
                                    {item.variantNote}
                                  </p>
                                )}
                                <p className="mt-0.5 text-xs text-[#475569]">
                                  <span className="font-mono font-medium text-[#0F172A]">
                                    {formatSypPrice(item.unitPriceSyp)}
                                  </span>{" "}
                                  ل.س للقطعة
                                </p>
                              </div>
                            </div>

                            {/* Stepper + Line Subtotal */}
                            <div className="flex items-center justify-between gap-6 sm:justify-end">
                              {/* Unified Quantity Stepper Pill */}
                              <div className="inline-flex h-11 items-center rounded-full border border-[#94A3B8] bg-white px-2 shadow-xs">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity - 1,
                                    )
                                  }
                                  className="flex size-7 items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#F6F0E9] hover:text-[#0F172A]"
                                  aria-label="إنقاص"
                                >
                                  <MinusIcon className="size-3.5" />
                                </button>

                                <span className="w-8 text-center font-mono text-sm font-semibold text-[#0F172A]">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="flex size-7 items-center justify-center rounded-full text-[#475569] transition-colors hover:bg-[#F6F0E9] hover:text-[#0F172A]"
                                  aria-label="زيادة"
                                >
                                  <PlusIcon className="size-3.5" />
                                </button>
                              </div>

                              {/* Line Total */}
                              <div className="min-w-[100px] text-end">
                                <span className="font-mono text-base font-semibold text-[#0F172A]">
                                  {formatSypPrice(lineTotal)}
                                </span>
                                <span className="ms-1 text-xs text-[#475569]">
                                  ل.س
                                </span>
                              </div>

                              {/* Remove item */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-[#94A3B8] transition-colors hover:text-[#BA1A1A]"
                                title="إزالة من السلة"
                              >
                                <TrashBinIcon className="size-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sub-order footer note */}
                    <div className="mt-2 border-t border-[#EBE1D6]/70 pt-3 text-xs text-[#475569]">
                      بانتظار رد المتجر · عادةً خلال {group.shopResponseHours}{" "}
                      ساعات (مهلة حتى 24 ساعة)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Left Column in RTL: Master Order Summary Box */}
          <div className="w-full shrink-0 lg:w-[360px]">
            <div className="sticky top-24 space-y-4 rounded-[22px] border border-[#EBE1D6] bg-[#FFF3F1] p-5 shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
              <h2 className="text-lg font-semibold text-[#0F172A]">
                ملخص الطلب الرئيسي
              </h2>

              {/* Per-Shop breakdown */}
              <div className="space-y-2">
                {groupedShops.map((group) => {
                  const subTotal = group.items.reduce(
                    (acc, it) => acc + it.unitPriceSyp * it.quantity,
                    0,
                  );
                  return (
                    <div
                      key={group.shopId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#475569]">
                        طلب {localizeShopName(group.shopName, locale)}
                      </span>
                      <span className="font-mono font-semibold text-[#0F172A]">
                        {formatSypPrice(subTotal)} ل.س
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-[#EBE1D6]" />

              {/* Grand Total Row */}
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#0F172A]">
                  الإجمالي الكلي
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-bold text-[#0F172A]">
                    {formatSypPrice(grandTotal)}
                  </span>
                  <span className="text-sm font-medium text-[#475569]">
                    ل.س
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => void handleCheckout()}
                disabled={isSubmitting}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#C40027] text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? "جارٍ إرسال الطلب..." : "أرسل الطلب"}
              </button>

              <p className="text-center text-xs leading-relaxed text-[#475569]">
                الدفع والتسليم مباشرة مع المتجر بعد التأكيد.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
