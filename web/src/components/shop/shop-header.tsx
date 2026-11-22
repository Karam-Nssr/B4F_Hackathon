/*
Pseudocode:
Objective: render the Shop Vendor Dashboard top header with mobile sidebar toggle and quick action CTA.
Input: none.
Process:
- Provide sticky top bar with breadcrumb/title and mobile hamburger button.
- Provide "إضافة منتج جديد" action that links directly to /shop/products.
Output: a responsive shop dashboard header component.
*/
"use client";

import { Link } from "@/i18n/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { PlusIcon } from "@/icons";

const ShopHeader = () => {
  const { setOpenMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#EBE1D6] bg-[#FBF8F4] px-4 md:px-8">
      {/* Mobile Menu Button + Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpenMobile(true)}
          className="flex size-10 items-center justify-center rounded-full border border-[#94A3B8]/40 bg-white text-[#0F172A] xl:hidden hover:bg-[#F6F0E9]"
          aria-label="فتح القائمة"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-xl font-bold text-[#0F172A] md:text-2xl">لوحة تحكم المتجر</h1>
          <p className="text-xs text-[#475569] hidden sm:block">
            راجع الطلبات الفرعية وأكّدها خلال 1–24 ساعة.
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/shop/products"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C40027] px-5 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95"
        >
          <PlusIcon className="size-4.5" />
          <span>إضافة منتج جديد</span>
        </Link>
      </div>
    </header>
  );
};

export default ShopHeader;
