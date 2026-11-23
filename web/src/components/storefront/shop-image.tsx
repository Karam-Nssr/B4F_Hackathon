"use client";

import { useLocale } from "next-intl";
import type { Shop } from "@/types/instamall";
import { localizeShopName } from "@/utils/localize-catalog-text";

interface ShopImageProps {
  shop: Shop;
  sizeClassName: string;
}

export const ShopImage = ({ shop, sizeClassName }: ShopImageProps) => {
  const locale = useLocale();

  return (
    <div className="flex shrink-0 flex-col items-center">
      {shop.imageUrl ? (
        <img
          src={shop.imageUrl}
          alt={`صورة متجر ${localizeShopName(shop.shopName, locale)}`}
          loading="lazy"
          className={`${sizeClassName} rounded-[14px] object-cover`}
        />
      ) : (
        <div
          className={`${sizeClassName} flex items-center justify-center rounded-[14px] text-sm font-bold text-[#0F172A] ${shop.avatarBg}`}
        >
          {shop.avatarChar}
        </div>
      )}
      {shop.imageCredit && shop.imageCreditUrl && (
        <a
          href={shop.imageCreditUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 max-w-24 text-center text-[9px] leading-tight text-[#64748B] underline"
        >
          {/* {locale === "ar"
            ? shop.imageCredit.replace("")
            : shop.imageCredit} */}
        </a>
      )}
    </div>
  );
};
