/*
Pseudocode:
Objective: render the marketplace home page with Hero banner, Category filter bar, and reactive Product Grid.
Input: products list from useInstaMallStore.
Process:
- Render hero banner matching Figma wireframe with glow circles, title, subtitle, and CTA.
- Render category filters with dynamic item counts.
- Filter products reactively by category.
- Render 4-column responsive product card grid.
Output: a responsive and interactive marketplace home page.
*/
"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import ProductCard from "@/components/storefront/product-card";

type Category = "الكل" | "أزياء شبابية" | "ديكور منزلي" | "هدايا" | "إكسسوارات";

const CATEGORIES: Category[] = [
  "الكل",
  "أزياء شبابية",
  "ديكور منزلي",
  "هدايا",
  "إكسسوارات",
];

const HomePage = () => {
  const { products } = useInstaMallStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>("الكل");

  const filteredProducts = useMemo(() => {
    const activeProds = products.filter((p) => p.isActive);
    if (selectedCategory === "الكل") return activeProds;
    return activeProds.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const scrollToProducts = () => {
    const el = document.getElementById("products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-l from-[#2C4180] to-[#0F172A] p-8 text-right md:p-12">
        {/* Ambient Glow Circles */}
        <div className="pointer-events-none absolute -top-20 -left-12 h-64 w-64 rounded-full bg-[rgba(253,231,234,0.10)] blur-xl" />
        <div className="pointer-events-none absolute -right-12 -bottom-24 h-72 w-72 rounded-full bg-[rgba(224,238,251,0.12)] blur-xl" />

        <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row-reverse">
          {/* Banner Graphic / Showcase */}
          <div className="w-full shrink-0 lg:w-[360px]">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=720&q=80"
              alt="InstaMall Products Showcase"
              onError={(e) => {
                e.currentTarget.src = "/images/product/product-01.jpg";
              }}
              className="h-[220px] w-full rounded-[24px] object-cover shadow-2xl ring-2 ring-white/10 md:h-[240px]"
            />
          </div>

          {/* Hero Content */}
          <div className="flex flex-1 flex-col items-start gap-4 text-right">
            <h1 className="text-3xl leading-tight font-bold text-white md:text-[44px]">
              ستايلك من متاجر سوريا بطلب واحد
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#BEC6E0]">
              نقسّم طلبك لكل متجر تلقائياً · الأسعار بالليرة السورية · الدفع
              والتسليم مباشرة مع المتجر
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={scrollToProducts}
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-[#0F172A] shadow-md transition-all hover:scale-105 hover:bg-slate-100 active:scale-95"
              >
                تصفح التشكيلة
              </button>
              <Link
                href="/stores"
                className="text-sm font-medium text-[#FFB3AF] transition-colors hover:text-white hover:underline"
              >
                استكشف دليل المتاجر ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="space-y-6">
        {/* Category Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#475569]">
            عرض {filteredProducts.length} منتجات مختارة
          </p>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#0F172A] text-white shadow-sm"
                      : "border border-[#94A3B8]/60 bg-white text-[#0F172A] hover:bg-[#F6F0E9]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="borderline flex flex-col items-center justify-center rounded-[22px] border bg-white py-16 text-center">
            <p className="text-base text-[#475569]">
              لا توجد منتجات في هذا التصنيف حالياً
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
