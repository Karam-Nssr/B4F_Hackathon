"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/types/instamall";
import formatSypPrice from "@/utils/format-syp-price";
import localizeProductTitle from "@/utils/localize-product-title";
import {
  localizeCategory,
  localizeProductDescription,
  localizeShopName,
} from "@/utils/localize-catalog-text";
import { useLocale } from "next-intl";

interface ProductDetailsModalProps {
  imageUrl: string;
  onImageError: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: Product;
}

const ProductDetailsModal = ({
  imageUrl,
  onImageError,
  onOpenChange,
  open,
  product,
}: ProductDetailsModalProps) => {
  const locale = useLocale();
  const isEnglish = locale === "en";
  const localizedTitle = localizeProductTitle(product.title, locale);
  const localizedDescription = localizeProductDescription(
    product.description,
    product.title,
    locale,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-black/45 backdrop-blur-sm dark:bg-black/70"
        className="max-h-[90dvh] overflow-y-auto rounded-[24px] border-[#EBE1D6] bg-white p-0 text-right shadow-2xl duration-300 sm:max-w-3xl dark:border-gray-700 dark:bg-surface"
      >
        <div dir={isEnglish ? "ltr" : "rtl"} className="grid sm:grid-cols-2">
          <div className="min-h-56 bg-[#F6F0E9] sm:min-h-[380px]">
            <img
              src={imageUrl}
              alt={localizedTitle}
              onError={onImageError}
              className="h-full max-h-[45vh] w-full object-cover sm:max-h-none"
            />
          </div>
          <div
            className={`flex flex-col justify-center p-6 sm:p-8 ${
              isEnglish ? "text-left" : "text-right"
            }`}
          >
            <DialogHeader className="gap-3">
              <p className="text-sm font-semibold text-[#C40027]">
                {localizeShopName(product.shopName, locale)}
              </p>
              <DialogTitle className="text-2xl font-bold text-[#0F172A] dark:text-white/90">
                {localizedTitle}
              </DialogTitle>
              <DialogDescription className="text-sm leading-7 text-[#475569] dark:text-gray-300">
                {localizedDescription}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#EBE1D6] pt-5 dark:border-gray-700">
              <span className="rounded-full bg-[#F6F0E9] px-4 py-2 text-sm font-medium text-[#475569] dark:bg-gray-800 dark:text-gray-300">
                {localizeCategory(product.category, locale)}
              </span>
              <p className="font-mono text-lg font-bold text-[#0F172A] dark:text-white/90">
                {formatSypPrice(product.priceSyp)} {isEnglish ? "SYP" : "ل.س"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
