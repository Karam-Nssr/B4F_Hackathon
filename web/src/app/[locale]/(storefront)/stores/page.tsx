/*
Pseudocode:
Objective: render the Stores Directory with notice banner, dual filter toolbar, and full store cards.
Input: shops reactive state from useInstaMallStore.
Process:
- Filter the backend shop catalog by category (the API does not expose city).
- Render Notice Banner explaining the 1-24h confirmation window.
- Render a category filter toolbar and an honest note about unavailable city data.
- Render responsive 2-column Store Cards with a derived monogram avatar and action CTA.
Output: an interactive, localized Stores Directory page.
*/
"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import { ShopImage } from "@/components/storefront/shop-image";

type CategoryFilter = "الكل" | "أزياء" | "هدايا" | "ديكور" | "إكسسوارات";

const CATEGORY_FILTERS: CategoryFilter[] = [
  "الكل",
  "أزياء",
  "هدايا",
  "ديكور",
  "إكسسوارات",
];

const StoresDirectory = () => {
  const { shops, currentUser, loginAsDemo } = useInstaMallStore();
  const [selectedCat, setSelectedCat] = useState<CategoryFilter>("الكل");

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      if (!s.isActive) return false;
      return (
        selectedCat === "الكل" ||
        (selectedCat === "أزياء" && s.category.includes("أزياء")) ||
        (selectedCat === "هدايا" && s.category.includes("هدايا")) ||
        (selectedCat === "ديكور" && s.category.includes("ديكور")) ||
        (selectedCat === "إكسسوارات" && s.category.includes("إكسسوارات"))
      );
    });
  }, [shops, selectedCat]);

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo("user");
    } catch {
      // The store is still browsable; the auth page surfaces the API error.
    }
  };

  if (!currentUser) {
    return (
      <div className="my-8 flex flex-col items-center justify-center space-y-5 rounded-[28px] border border-[#EBE1D6] bg-white p-10 text-center shadow-card">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-[#E0EEFB] text-2xl">
          🏪
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#0F172A]">تسجيل الدخول مطلوب لاستعراض دليل المتاجر</h2>
          <p className="max-w-md text-sm text-[#475569]">
            دليل المتاجر المحلية مخصص لمستخدمي المنصة المسجلين لاستكشاف المتاجر وتفاصيل التوصيل ومواعيد الرد.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void handleDemoLogin()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#C40027] px-6 text-sm font-semibold text-white shadow-red transition-all hover:bg-[#a50021] active:scale-95"
          >
            الدخول المباشر كمشتري تجريبي
          </button>
          <Link
            href="/auth"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#0F172A] bg-white px-6 text-sm font-semibold text-[#0F172A] transition-all hover:bg-[#F6F0E9] active:scale-95"
          >
            صفحة تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#0F172A] md:text-4xl">دليل المتاجر</h1>
        <p className="text-base text-[#475569]">
          تصفح متاجر المنصة بطلب موحد.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="rounded-[22px] border border-[#EBE1D6] bg-[#F6F0E9] p-4 text-sm font-medium text-[#0F172A]">
        نافذة تأكيد الطلب: 1–24 ساعة لكل متجر، وتظهر المدة المتبقية لتأكيد كل طلب.
      </div>

      {/* Dual Filter Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm font-medium text-[#475569]">
          عرض {filteredShops.length} متاجر نشطة
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_FILTERS.map((cat) => {
              const active = selectedCat === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-[#0F172A] text-white"
                      : "border border-[#94A3B8]/60 bg-white text-[#0F172A] hover:bg-[#F6F0E9]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-[#94A3B8]">
            المدينة وعدد المنتجات غير متوفرين في بيانات الواجهة الخلفية
          </span>
        </div>
      </div>

      {/* Stores Grid (2 cards per row on desktop) */}
      {filteredShops.length === 0 ? (
        <div className="rounded-[22px] border border-[#EBE1D6] bg-white py-16 text-center">
          <p className="text-base text-[#475569]">لا توجد متاجر مطابقة للفلتر المحدد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="flex flex-col justify-between rounded-[22px] border border-[#EBE1D6] bg-white p-4 shadow-[0px_4px_16px_rgba(15,23,42,0.06)]"
            >
              <div className="space-y-4">
                {/* Header Row: Avatar + Details + Verified Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ShopImage shop={shop} sizeClassName="size-14" />

                    <div>
                      <h2 className="text-lg font-semibold text-[#0F172A]">{shop.shopName}</h2>
                      <p className="text-xs text-[#475569]">
                        {shop.category} · {shop.city || "المدينة غير متوفرة"} ·{" "}
                        {shop.productCount ?? "—"} منتج
                      </p>
                    </div>
                  </div>

                  {/* Verification status is not exposed by the backend. */}
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[#475569]">{shop.description}</p>
              </div>

              {/* Footer Row: Response Time + CTA */}
              <div className="mt-6 flex items-center justify-between border-t border-[#EBE1D6]/70 pt-4">
                <span className="text-xs text-[#475569]">
                  وقت الرد المعتاد:{" "}
                  <span className="font-mono font-semibold text-[#0F172A]">
                    {shop.responseTimeHours ?? "غير متوفر"}
                  </span>
                </span>

                <Link
                  href="/"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#0F172A] bg-white px-5 text-sm font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                >
                  تصفح المنتجات
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoresDirectory;
