/*
Pseudocode:
Objective: render the marketplace home page with a timed Hero loader, localized titles, and reactive product grid.
Input: products, shops, and loading state from useInstaMallStore plus an optional shopId query.
Process:
- Keep the orbital loader visible briefly while catalog data loads.
- Scope products to a selected shop and render live category filters.
- Render 4-column responsive product card grid.
Output: a responsive and interactive marketplace home page.
*/
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import ProductCard from "@/components/storefront/product-card";
import LuxuryOrbitalHero from "@/components/LuxuryOrbitalHero";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import getPaginationPages from "@/utils/get-pagination-pages";
import {
  localizeCategory,
  localizeShopName,
} from "@/utils/localize-catalog-text";
import { useLocale } from "next-intl";

const PRODUCTS_PER_PAGE = 12;
const INITIAL_LOADER_MIN_MS = 2000;
const INITIAL_LOADER_MAX_MS = 3000;
const HomePageContent = () => {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { products, shops, isLoading } = useInstaMallStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const loaderStartedAt = useRef<number | null>(null);
  const selectedShopId = searchParams.get("shopId");

  useEffect(() => {
    if (!showInitialLoader) return;

    const now = Date.now();
    const startedAt = loaderStartedAt.current ?? now;
    loaderStartedAt.current = startedAt;

    const maxTimer = window.setTimeout(
      () => setShowInitialLoader(false),
      Math.max(0, INITIAL_LOADER_MAX_MS - (now - startedAt)),
    );
    const minTimer = isLoading
      ? undefined
      : window.setTimeout(
          () => setShowInitialLoader(false),
          Math.max(0, INITIAL_LOADER_MIN_MS - (now - startedAt)),
        );

    return () => {
      window.clearTimeout(maxTimer);
      if (minTimer !== undefined) window.clearTimeout(minTimer);
    };
  }, [isLoading, showInitialLoader]);

  useEffect(() => {
    if (!selectedShopId || showInitialLoader) return;

    document
      .getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedShopId, showInitialLoader]);

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive),
    [products],
  );
  const shopProducts = useMemo(
    () =>
      selectedShopId
        ? activeProducts.filter((product) => product.shopId === selectedShopId)
        : activeProducts,
    [activeProducts, selectedShopId],
  );
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          shopProducts
            .map((product) => product.category.trim())
            .filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second, locale)),
    [locale, shopProducts],
  );
  const selectedShop = shops.find((shop) => shop.id === selectedShopId);
  const activeCategory =
    selectedCategory === "all" || categories.includes(selectedCategory)
      ? selectedCategory
      : "all";
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return shopProducts;
    return shopProducts.filter(
      (product) => product.category.trim() === activeCategory,
    );
  }, [activeCategory, shopProducts]);
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pageProducts = useMemo(
    () =>
      filteredProducts.slice(
        (activePage - 1) * PRODUCTS_PER_PAGE,
        activePage * PRODUCTS_PER_PAGE,
      ),
    [activePage, filteredProducts],
  );
  const pageItems = getPaginationPages(activePage, totalPages);
  const firstProduct = filteredProducts.length
    ? (activePage - 1) * PRODUCTS_PER_PAGE + 1
    : 0;
  const lastProduct = Math.min(
    activePage * PRODUCTS_PER_PAGE,
    filteredProducts.length,
  );

  if (showInitialLoader) {
    return (
      <div className="-mx-4 -mt-[22px] sm:-mx-6 lg:-mx-8">
        <LuxuryOrbitalHero variant="loader" fullBleed locale={locale} />
      </div>
    );
  }

  return (
    <div className="-mt-[22px] space-y-10">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <LuxuryOrbitalHero fullBleed locale={locale} />
      </div>

      {/* Products Section */}
      <section id="products-section" className="scroll-mt-20 space-y-6">
        {/* Category Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[#475569]">
            عرض {firstProduct}–{lastProduct} من {filteredProducts.length} منتجات
            مختارة
            {selectedShop
              ? ` من متجر ${localizeShopName(selectedShop.shopName, locale)}`
              : ""}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {selectedShopId && (
              <Link
                href="/#products-section"
                onClick={() => {
                  setCurrentPage(1);
                  setSelectedCategory("all");
                }}
                className="text-sm font-semibold text-[#C40027] hover:underline"
              >
                {locale === "en" ? "View all products" : "عرض كل المنتجات"}
              </Link>
            )}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              {[
                {
                  value: "all",
                  label: locale === "en" ? "All" : "الكل",
                },
                ...categories.map((category) => ({
                  value: category,
                  label: localizeCategory(category, locale),
                })),
              ].map((category) => {
                const isActive = activeCategory === category.value;
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.value);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#0F172A] text-white shadow-sm"
                        : "border border-[#94A3B8]/60 bg-white text-[#0F172A] hover:bg-[#F6F0E9]"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
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
            {pageProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            aria-label={locale === "en" ? "Product pages" : "صفحات المنتجات"}
          >
            <PaginationContent className="flex-wrap gap-2 sm:gap-3">
              <PaginationItem>
                <PaginationPrevious
                  href="#products-section"
                  size="default"
                  className="min-w-[7rem]"
                  text={locale === "en" ? "Previous" : "السابق"}
                  aria-label={
                    locale === "en" ? "Previous page" : "الصفحة السابقة"
                  }
                  disabled={activePage <= 1}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(activePage - 1);
                    document
                      .getElementById("products-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              </PaginationItem>

              {pageItems.map((item) => {
                if (typeof item === "string") {
                  return (
                    <PaginationItem key={item}>
                      <PaginationEllipsis
                        label={
                          locale === "en" ? "More pages" : "صفحات إضافية"
                        }
                      />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#products-section"
                      size="icon-sm"
                      variant="outline"
                      isActive={activePage === item}
                      aria-label={
                        locale === "en" ? `Page ${item}` : `الصفحة ${item}`
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(item);
                        document
                          .getElementById("products-section")
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#products-section"
                  size="default"
                  className="min-w-[7rem]"
                  text={locale === "en" ? "Next" : "التالي"}
                  aria-label={locale === "en" ? "Next page" : "الصفحة التالية"}
                  disabled={activePage >= totalPages}
                  onClick={(event) => {
                    event.preventDefault();
                    setCurrentPage(activePage + 1);
                    document
                      .getElementById("products-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  );
};

const HomePage = () => {
  const locale = useLocale();

  return (
    <Suspense
      fallback={
        <div className="-mx-4 -mt-[22px] sm:-mx-6 lg:-mx-8">
          <LuxuryOrbitalHero variant="loader" fullBleed locale={locale} />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
};

export default HomePage;
