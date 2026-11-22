/*
Pseudocode:
Objective: render the admin platform dashboard header with mobile sidebar toggle and role indicator.
Input: none.
Process:
- Sticky header with title, subtitle, mobile hamburger toggle, and platform status badge.
Output: a responsive admin header component.
*/
"use client";

import { useSidebar } from "@/components/ui/sidebar";

const AdminHeader = () => {
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
          <h1 className="text-xl font-bold text-[#0F172A] md:text-2xl">لوحة تحكم المنصة</h1>
          <p className="text-xs text-[#475569] hidden sm:block">
            إحصائيات منصة InstaMall وحوكمة المتاجر
          </p>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D8F1E4] px-3.5 py-1 text-xs font-semibold text-[#15803D]">
          <span className="size-2 rounded-full bg-[#15803D]" />
          <span>المشرف العام (Admin)</span>
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;
