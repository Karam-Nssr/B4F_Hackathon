/*
Pseudocode:
Objective: render the dedicated Product CMS CRUD page for the shop vendor.
Input: products, addProduct, updateProduct, deleteProduct from useInstaMallStore.
Process:
- Filter products belonging to current shop.
- Display full responsive table with title, category, price in SYP, and actions (edit, delete).
- Provide Add Product CTA and Modal Dialog.
- Provide Edit Product Modal Dialog with pre-filled form.
- Provide Delete Confirmation Modal Dialog.
Output: dedicated shop product management CRUD page.
*/
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInstaMallStore } from "@/context/instamall-store";
import type { Product } from "@/types/instamall";
import { PlusIcon } from "@/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import getErrorMessage from "@/utils/get-error-message";
import { useLocale } from "next-intl";
import ShopProductsTable from "@/components/shop/shop-products-table";

interface ProductFormData {
  title: string;
  category: string;
  description: string;
  priceSyp: string;
}

const productSchema = z.object({
  title: z.string().min(2, "عنوان المنتج مطلوب"),
  category: z.string().min(2, "التصنيف مطلوب"),
  description: z.string().min(2, "الوصف مطلوب"),
  priceSyp: z
    .string()
    .regex(/^\d+$/, "السعر يجب أن يكون رقماً صحيحاً بالليرة السورية"),
});

const ShopProductsPage = () => {
  const locale = useLocale();
  const {
    products,
    currentShop,
    addProduct,
    updateProduct,
    deleteProduct,
    error,
  } = useInstaMallStore();
  const [actionError, setActionError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null,
  );

  const shopProducts = currentShop?.id
    ? products.filter((p) => p.shopId === currentShop.id)
    : [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      category: "أزياء شبابية",
      description: "",
      priceSyp: "1500",
    },
  });

  const openCreateDialog = () => {
    setEditingProduct(null);
    reset({
      title: "",
      category: "أزياء شبابية",
      description: "",
      priceSyp: "1500",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setValue("title", product.title);
    setValue("category", product.category);
    setValue("description", product.description);
    setValue("priceSyp", String(Math.trunc(product.priceSyp / 100)));
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    setActionError(null);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: data.title,
          category: data.category,
          description: data.description,
          priceSyp: Number(data.priceSyp) * 100,
        });
      } else {
        if (!currentShop) {
          setActionError(
            getErrorMessage("لم يتم تحديد متجر لهذا الحساب بعد", locale),
          );
          return;
        }
        await addProduct({
          shopId: currentShop.id,
          shopName: currentShop.shopName,
          title: data.title,
          category: data.category,
          description: data.description,
          priceSyp: Number(data.priceSyp) * 100,
          imageUrl: "/images/product/product-01.jpg",
          isActive: true,
        });
      }
      setIsDialogOpen(false);
    } catch (caught) {
      setActionError(getErrorMessage(caught, locale, "تعذر حفظ المنتج"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    setActionError(null);
    try {
      await deleteProduct(deletingProductId);
      setDeletingProductId(null);
    } catch (caught) {
      setActionError(getErrorMessage(caught, locale, "تعذر حذف المنتج"));
    }
  };

  return (
    <div className="space-y-6 text-right">
      {(actionError || error) && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {actionError || error}
        </div>
      )}

      <div className="flex flex-col gap-4 border-b border-[#EBE1D6]/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">
            إدارة المنتجات
          </h1>
          <p className="text-sm text-[#475569]">
            التسعير بالليرة السورية · التحكم الكامل في معروضات المتجر
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C40027] px-6 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95"
        >
          <PlusIcon className="size-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      <ShopProductsTable
        products={shopProducts}
        onEdit={openEditDialog}
        onDelete={setDeletingProductId}
      />

      {/* Add / Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-[24px] bg-white p-6 text-right">
          <DialogHeader className="border-b border-[#EBE1D6] pb-3 text-right">
            <DialogTitle className="text-lg font-bold text-[#0F172A]">
              {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#475569]">
              أدخل تفاصيل المنتج بدقة، جميع الأسعار بالليرة السورية.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(event) => {
              void handleSubmit(handleFormSubmit)(event);
            }}
            className="mt-4 space-y-4"
            noValidate
          >
            <Field>
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                اسم المنتج
              </FieldLabel>
              <Input
                {...register("title")}
                type="text"
                placeholder="مثال: أباجورة خشب جوز"
                className="h-11 rounded-[14px]"
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                التصنيف
              </FieldLabel>
              <Input
                {...register("category")}
                type="text"
                placeholder="مثال: ديكور منزلي"
                className="h-11 rounded-[14px]"
              />
              <FieldError errors={[errors.category]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                السعر بالليرة السورية (ل.س)
              </FieldLabel>
              <Input
                {...register("priceSyp")}
                type="text"
                placeholder="مثال: 185000"
                className="h-11 rounded-[14px] font-mono"
              />
              <FieldError errors={[errors.priceSyp]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                الوصف
              </FieldLabel>
              <Input
                {...register("description")}
                type="text"
                placeholder="وصف مواصفات المنتج"
                className="h-11 rounded-[14px]"
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <div className="flex items-center justify-end gap-3 border-t border-[#EBE1D6] pt-3">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="h-10 rounded-full border border-[#94A3B8] px-5 text-xs font-semibold text-[#475569] hover:bg-[#F6F0E9]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-full bg-[#C40027] px-6 text-xs font-semibold text-white shadow-xs hover:bg-[#a50021]"
              >
                {editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deletingProductId && (
        <Dialog
          open={Boolean(deletingProductId)}
          onOpenChange={() => setDeletingProductId(null)}
        >
          <DialogContent className="max-w-sm rounded-[24px] bg-white p-6 text-right">
            <DialogHeader className="text-right">
              <DialogTitle className="text-base font-bold text-[#BA1A1A]">
                تأكيد حذف المنتج
              </DialogTitle>
              <DialogDescription className="mt-2 text-xs text-[#475569]">
                هل أنت متأكد من رغبتك في حذف هذا المنتج من متجرك نهائياً؟
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="h-10 rounded-full border border-[#94A3B8] px-4 text-xs font-semibold text-[#475569]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
                className="h-10 rounded-full bg-[#BA1A1A] px-5 text-xs font-semibold text-white"
              >
                حذف نهائي
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShopProductsPage;
