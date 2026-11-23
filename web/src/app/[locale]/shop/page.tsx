/*
Pseudocode:
Objective: render the Shop Overview Dashboard matching Figma dashboard_shop.html and SAD v1.2.
Input: backend-backed products, sub-orders, shop overview KPIs, and async CRUD/status actions from useInstaMallStore.
Process:
- Display 3 KPI Stat cards from the shop overview endpoint (products, pending, total orders).
- Render Shop Sub-orders table with strict privacy masking rules (NFR-02: phone/NID masked when PENDING, unmasked when CONFIRMED).
- Render Product CMS table with fully functional minimal CRUD (Create, Edit, Delete).
- Provide Add/Edit Product Modal Dialog and Delete Confirmation Dialog.
Output: a production-grade Shop Overview Dashboard page.
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
import ShopOrdersTable from "@/components/shop/shop-orders-table";
import ShopProductsTable from "@/components/shop/shop-products-table";

interface ProductFormData {
  title: string;
  category: string;
  description: string;
  priceSyp: string;
  imageUrl?: string;
}

const productSchema = z.object({
  title: z.string().min(2, "عنوان المنتج مطلوب (حرفين على الأقل)"),
  category: z.string().min(2, "التصنيف مطلوب"),
  description: z.string().min(2, "الوصف مطلوب"),
  priceSyp: z
    .string()
    .regex(/^\d+$/, "السعر يجب أن يكون رقماً صحيحاً بالليرة السورية"),
});

const ShopOverview = () => {
  const locale = useLocale();
  const {
    products,
    currentShop,
    shopOverview,
    shopSubOrders,
    confirmSubOrder,
    rejectSubOrder,
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

  // The shop endpoints are already scoped to the signed-in owner.
  const currentShopSubOrders = shopSubOrders;
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

  const handleStatusChange = async (id: string, confirm: boolean) => {
    setActionError(null);
    try {
      if (confirm) await confirmSubOrder(id);
      else await rejectSubOrder(id);
    } catch (caught) {
      setActionError(getErrorMessage(caught, locale, "تعذر تحديث حالة الطلب"));
    }
  };

  return (
    <div className="space-y-8 text-right">
      {(actionError || error) && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {actionError || error}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Card 1: Active Products */}
        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#DFF3EA] p-5 text-right shadow-xs">
          <p className="text-sm font-medium text-[#475569]">المنتجات النشطة</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#0F172A]">
            {shopOverview?.totalProducts ?? "—"}
          </p>
        </div>

        {/* Card 2: Urgent Pending Confirmation */}
        <div className="rounded-[22px] border-2 border-[#B45309] bg-[#FFF1D2] p-5 text-right shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#B45309]">
              بانتظار التأكيد (1-24h)
            </p>
            <span className="flex size-2.5 animate-pulse rounded-full bg-[#B45309]" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold text-[#B45309]">
            {shopOverview?.pendingOrders ?? "—"}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#C40027]">
            مهلة الرد تنتهي خلال 24 ساعة
          </p>
        </div>

        {/* Card 3: Incoming Sub-Orders */}
        <div className="rounded-[22px] border border-[#EBE1D6] bg-[#E0EEFB] p-5 text-right shadow-xs">
          <p className="text-sm font-medium text-[#475569]">
            الطلبات الفرعية الواردة
          </p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#0F172A]">
            {shopOverview?.totalOrders ?? "—"}
          </p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="space-y-10">
        <div className="space-y-4">
          <div className="border-b border-[#EBE1D6]/70 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">
              أحدث طلبات المتجر
            </h2>
            <p className="text-xs text-[#475569]">
              مرتبة حسب الأقرب انتهاءً للمهلة · أرقام الهوية مخفية حتى التأكيد
            </p>
          </div>

          <ShopOrdersTable
            compact
            recentOnly
            orders={currentShopSubOrders}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#EBE1D6]/70 pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                أحدث المنتجات
              </h2>
              <p className="text-xs text-[#475569]">التسعير بالليرة السورية</p>
            </div>
            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#C40027] px-3.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#a50021]"
            >
              <PlusIcon className="size-3.5" />
              <span>إضافة منتج</span>
            </button>
          </div>

          <ShopProductsTable
            compact
            recentOnly
            products={shopProducts}
            onEdit={openEditDialog}
            onDelete={setDeletingProductId}
          />
        </div>
      </div>

      {/* Add / Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-[24px] bg-white p-6 text-right">
          <DialogHeader className="border-b border-[#EBE1D6] pb-3 text-right">
            <DialogTitle className="text-lg font-bold text-[#0F172A]">
              {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#475569]">
              أدخل بيانات المنتج بدقة، جميع الأسعار بالليرة السورية.
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
                placeholder="مثال: هودي قطني"
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
                placeholder="مثال: أزياء شبابية"
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
                placeholder="مثال: 150000"
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
                placeholder="وصف مختصر لمواصفات المنتج"
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
                هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟
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

export default ShopOverview;
