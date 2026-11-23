/*
Pseudocode:
Objective: render the Shop Vendor Dashboard top header with mobile sidebar toggle.
Input: none.
Process:
- Provide sticky top bar with breadcrumb/title and mobile hamburger button.
Output: a responsive shop dashboard header component.
*/
"use client";

import { useSidebar } from "@/components/ui/sidebar";
import ThemeToggleButton from "@/layout/header/theme-toggler";

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

      <ThemeToggleButton />
    </header>
  );
};

export default ShopHeader;
