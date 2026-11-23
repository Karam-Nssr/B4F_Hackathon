/*
Pseudocode:
Objective: render a product card matching the Figma design system with correct shop ID and add-to-cart behavior.
Input: product object (id, shopId, shopName, title, priceSyp, imageUrl, isActive).
Process:
- Render white card with 18px radius, border, shadow, and 150px cover thumbnail.
- Display shop name and product title.
- Render footer row with SYP price in Spline Sans Mono font and a clear add-to-cart CTA.
- On click, look up shop data from store and append to unified cart with proper shopId and shopCity.
Output: a production-ready, interactive product card component.
*/
"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { CheckIcon } from "@/icons";
import { useInstaMallStore } from "@/context/instamall-store";
import type { Product } from "@/types/instamall";
import ProductDetailsModal from "@/components/storefront/product-details-modal";
import formatSypPrice from "@/utils/format-syp-price";
import localizeProductTitle from "@/utils/localize-product-title";
import { localizeShopName } from "@/utils/localize-catalog-text";
import { useLocale } from "next-intl";
import styles from "./product-card.module.css";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const locale = useLocale();
  const isEnglish = locale === "en";
  const localizedTitle = localizeProductTitle(product.title, locale);
  const { addToCart, shops } = useInstaMallStore();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const shop = shops.find((s) => s.id === product.shopId);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--pointer-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--pointer-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--pointer-x", "50%");
    event.currentTarget.style.setProperty("--pointer-y", "50%");
  };

  const handleAdd = () => {
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      shopName: product.shopName || shop?.shopName || "متجر محلي",
      shopCity: shop?.city ?? "",
      title: product.title,
      unitPriceSyp: product.priceSyp,
      quantity: 1,
      imageUrl: imgSrc,
      shopResponseHours: shop?.responseTimeHours ?? 24,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`${styles.card} group relative flex flex-col overflow-hidden rounded-[18px] border border-line bg-white shadow-product transition-shadow hover:shadow-[0px_8px_24px_rgba(15,23,42,0.12)]`}
    >
      <div aria-hidden="true" className={styles.glow} />
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        aria-label={
          isEnglish
            ? `View details for ${localizedTitle}`
            : `عرض تفاصيل ${localizedTitle}`
        }
        className="absolute inset-0 z-10 cursor-pointer rounded-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C40027]"
      />
      <div className="pointer-events-none relative z-20 flex flex-col p-5">
        <div>
          <div className="relative h-40 w-full overflow-hidden bg-low">
            <img
              src={imgSrc}
              alt={localizedTitle}
              onError={() => setImgSrc("/images/product/product-01.jpg")}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col gap-1 p-3 text-right">
            <span className="text-xs font-normal text-muted">
              {localizeShopName(product.shopName, locale)}
            </span>
            <h3
              className="line-clamp-1 text-sm font-semibold text-[#0F172A]"
              title={localizedTitle}
            >
              {localizedTitle}
            </h3>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1 text-right">
            <span className="font-mono text-base font-semibold text-[#0F172A]">
              {formatSypPrice(product.priceSyp)}
            </span>
            <span className="text-xs font-normal text-muted">ل.س</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={
              added
                ? isEnglish
                  ? "Added to cart"
                  : "تمت الإضافة"
                : isEnglish
                  ? "Add to cart"
                  : "أضف للسلة"
            }
            className={`pointer-events-auto inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold whitespace-nowrap text-white transition-all hover:scale-105 active:scale-95 ${
              added
                ? "bg-ok shadow-[0px_4px_12px_rgba(21,128,61,0.28)]"
                : "bg-red shadow-red hover:bg-[#A50021]"
            }`}
          >
            {added && <CheckIcon aria-hidden className="size-4" />}
            <span>
              {added
                ? isEnglish
                  ? "Added"
                  : "تمت الإضافة"
                : isEnglish
                  ? "Add to cart"
                  : "أضف للسلة"}
            </span>
          </button>
        </div>
      </div>
      <ProductDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        product={product}
        imageUrl={imgSrc}
        onImageError={() => setImgSrc("/images/product/product-01.jpg")}
      />
    </article>
  );
};

export default ProductCard;
