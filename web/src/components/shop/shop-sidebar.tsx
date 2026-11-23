/*
Pseudocode:
Objective: render the Shop Vendor Dashboard Sidebar with working links, active indicators, and brand styling.
Input: reads active role and navigation state.
Process:
- Provide 260px Dark Navy sidebar on desktop and mobile drawer sheet.
- Link to /shop (نظرة عامة), /shop/orders (طلبات المتجر), and /shop/products (إدارة المنتجات).
- Add direct link to Storefront (الرجوع للمتجر) and Admin.
- Display store monogram info in footer.
Output: a working, accessible Shop Sidebar component.
*/
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { LayoutGridIcon, InboxIcon, PencilIcon, CartIcon } from "@/icons";
import { useInstaMallStore } from "@/context/instamall-store";
import { ShopImage } from "@/components/storefront/shop-image";

const NAV_ITEMS = [
  {
    key: "overview",
    label: "نظرة عامة",
    path: "/shop",
    icon: <LayoutGridIcon className="size-5 shrink-0" />,
  },
  {
    key: "orders",
    label: "طلبات المتجر",
    path: "/shop/orders",
    icon: <InboxIcon className="size-5 shrink-0" />,
  },
  {
    key: "products",
    label: "إدارة المنتجات",
    path: "/shop/products",
    icon: <PencilIcon className="size-5 shrink-0" />,
  },
];

const ShopSidebar = () => {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="right" className="w-[260px] bg-[#0F172A] p-0 text-white">
          <ShopSidebarInner onNavigate={() => setOpenMobile(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-[260px] shrink-0 min-h-screen bg-[#0F172A] text-white xl:flex flex-col border-s border-[#1E293B]">
        <ShopSidebarInner />
      </aside>
    </>
  );
};

interface InnerProps {
  onNavigate?: () => void;
}

const ShopSidebarInner = ({ onNavigate }: InnerProps) => {
  const pathname = usePathname();
  const { shops, currentShop } = useInstaMallStore();
  const shop = currentShop ?? shops[0];

  return (
    <div className="flex h-full flex-col justify-between p-4 text-right">
      <div className="space-y-6">
        {/* Brand Header */}
          <div className="border-t border-[#1E293B] pt-4">
        <div className="flex items-center gap-3 rounded-[14px] bg-[#1E293B]/50 p-2.5">
          {shop ? (
            <ShopImage shop={shop} sizeClassName="size-10" />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-rose-100 font-bold text-sm text-[#0F172A]">
              م
            </div>
          )}
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">
              {shop?.shopName ?? "متجرك"}
            </p>
            <p className="truncate text-xs text-[#BEC6E0]">
              {shop?.category ?? "التصنيف غير متوفر"}
            </p>
          </div>
        </div>
      </div>
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 pt-2">
          {/* <Link
            href="/shop"
            onClick={onNavigate}
            className="flex items-center gap-2.5"
          >
            <BrandLogo className="size-8" />
            <div>
              <span
                className="font-brand text-xl text-white font-normal block"
              >
                InstaMall
              </span>
              <span className="text-[11px] font-medium text-[#BEC6E0] block">
                لوحة التاجر (Vendor)
              </span>
            </div>
          </Link> */}
        </div>
        
        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/shop"
                ? pathname === "/shop"
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.key}
                href={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#1E293B] text-white shadow-xs"
                    : "text-[#BEC6E0] hover:bg-[#1E293B]/60 hover:text-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cross-Platform Navigation */}
        <div className="border-t border-[#1E293B] pt-4 space-y-1.5">
          <p className="px-3 text-xs font-medium text-[#94A3B8]">روابط سريعة</p>
          <Link
            href="/"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white transition-colors"
          >
            <CartIcon className="size-5 shrink-0 text-[#C40027]" />
            <span>الرجوع للمتجر</span>
          </Link>
          {/* <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white transition-colors"
          >
            <span className="size-5 shrink-0 flex items-center justify-center font-bold text-xs text-[#15803D]">
              A
            </span>
            <span>لوحة المشرف</span>
          </Link> */}
        </div>
      </div>

      {/* Footer Shop Info */}
    
    </div>
  );
};

export default ShopSidebar;
