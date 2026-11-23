/*
Pseudocode:
Objective: render a product card matching the Figma design system with correct shop ID and add-to-cart behavior.
Input: product object (id, shopId, shopName, title, priceSyp, imageUrl, isActive).
Process:
- Render white card with 18px radius, border, shadow, and 150px cover thumbnail.
- Display shop name and product title.
- Render footer row with SYP price in Spline Sans Mono font and circular + button (size-11, red, shadow).
- On click, look up shop data from store and append to unified cart with proper shopId and shopCity.
Output: a production-ready, interactive product card component.
*/
"use client";

import { useState } from "react";
import { PlusIcon, CheckIcon } from "@/icons";
import { useInstaMallStore } from "@/context/instamall-store";
import type { Product } from "@/types/instamall";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, shops } = useInstaMallStore();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.imageUrl);

  const shop = shops.find((s) => s.id === product.shopId);

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
    <div className="group flex flex-col overflow-hidden rounded-[18px] border border-line bg-white p-5 shadow-product transition-all hover:shadow-[0px_8px_24px_rgba(15,23,42,0.12)]">
      {/* 150-160px Thumbnail matching Figma ratio */}
      <div className="relative h-40 w-full overflow-hidden bg-low">
        <img
          src={imgSrc}
          alt={product.title}
          onError={() => setImgSrc("/images/product/product-01.jpg")}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content - 12px (p-3) matching Figma wireframe */}
      <div className="flex flex-1 flex-col justify-between p-3 text-right">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-normal text-muted">
            {product.shopName}
          </span>
          <h3
            className="line-clamp-1 text-sm font-semibold text-[#0F172A]"
            title={product.title}
          >
            {product.title}
          </h3>
        </div>

        {/* Footer row: Price + Add button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1 text-right">
            <span className="font-mono text-base font-semibold text-[#0F172A]">
              {product.priceSyp.toLocaleString("en-US")}
            </span>
            <span className="text-xs font-normal text-muted">ل.س</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label={added ? "تمت الإضافة" : "أضف إلى السلة"}
            className={`flex size-11 items-center justify-center rounded-full text-white transition-all hover:scale-105 active:scale-95 ${
              added
                ? "bg-ok shadow-[0px_4px_12px_rgba(21,128,61,0.28)]"
                : "bg-red shadow-red hover:bg-[#A50021]"
            }`}
          >
            {added ? (
              <CheckIcon className="size-5" />
            ) : (
              <PlusIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
