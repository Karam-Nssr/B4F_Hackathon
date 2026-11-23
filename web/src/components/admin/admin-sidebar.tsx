/*
Pseudocode:
Objective: render the Admin (Platform) Dashboard Sidebar with 260px Dark Navy style, working navigation links, and cross-portal access.
Input: none.
Process:
- Provide 260px Dark Navy sidebar on desktop and mobile drawer sheet.
- Link to /admin (إحصائيات المنصة), /admin/shops (المتاجر المسجلة), and /admin/users (المستخدمون).
- Provide quick links to Storefront (الرجوع للمتجر) and Shop Dashboard (لوحة التاجر).
- Display admin user initials in footer.
Output: a fully-functional, styled Admin Sidebar component.
*/
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { LayoutGridIcon, MapIcon, UsersIcon, CartIcon } from "@/icons";

const NAV_ITEMS = [
  {
    key: "overview",
    label: "إحصائيات المنصة",
    path: "/admin",
    icon: <LayoutGridIcon className="size-5 shrink-0" />,
  },
  {
    key: "shops",
    label: "المتاجر المسجلة",
    path: "/admin/shops",
    icon: <MapIcon className="size-5 shrink-0" />,
  },
  {
    key: "users",
    label: "المستخدمون",
    path: "/admin/users",
    icon: <UsersIcon className="size-5 shrink-0" />,
  },
];

const AdminSidebar = () => {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="right" className="w-[260px] bg-[#0F172A] p-0 text-white">
          <AdminSidebarInner onNavigate={() => setOpenMobile(false)} isMobile />
        </SheetContent>
      </Sheet>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-[260px] shrink-0 min-h-screen bg-[#0F172A] text-white xl:flex flex-col border-s border-[#1E293B]">
        <AdminSidebarInner isMobile={false} />
      </aside>
    </>
  );
};

interface InnerProps {
  onNavigate?: () => void;
  isMobile?: boolean;
}

const AdminSidebarInner = ({ onNavigate, isMobile }: InnerProps) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between p-4 text-right">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 pt-2">
          <Link
            href="/admin"
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
                إدارة المنصة (Admin)
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/admin"
                ? pathname === "/admin"
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
            href="/shop"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium text-[#BEC6E0] hover:bg-[#1E293B] hover:text-white transition-colors"
          >
            <span className="size-5 shrink-0 flex items-center justify-center font-bold text-xs text-[#EAB308]">
              S
            </span>
            <span>لوحة التاجر</span>
          </Link> */}
        </div>
      </div>

      {/* Footer Admin Info */}
      <div className="border-t border-[#1E293B] pt-4">
        <div className="flex items-center gap-3 rounded-[14px] bg-[#1E293B]/50 p-2.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FDE7EA] font-bold text-sm text-[#0F172A]">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-semibold text-white">المشرف العام</p>
            <p className="truncate text-xs text-[#BEC6E0]">admin@instamall.sy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
