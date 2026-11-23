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
import { PencilIcon, TrashBinIcon, PlusIcon, CallIcon } from "@/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
  const [callModalSub, setCallModalSub] = useState<
    (typeof shopSubOrders)[0] | null
  >(null);

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
      priceSyp: "150000",
    },
  });

  const openCreateDialog = () => {
    setEditingProduct(null);
    reset({
      title: "",
      category: "أزياء شبابية",
      description: "",
      priceSyp: "150000",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setValue("title", product.title);
    setValue("category", product.category);
    setValue("description", product.description);
    setValue("priceSyp", String(product.priceSyp));
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
          priceSyp: Number(data.priceSyp),
        });
      } else {
        if (!currentShop) {
          setActionError("لم يتم تحديد متجر لهذا الحساب بعد");
          return;
        }
        await addProduct({
          shopId: currentShop.id,
          shopName: currentShop.shopName,
          title: data.title,
          category: data.category,
          description: data.description,
          priceSyp: Number(data.priceSyp),
          imageUrl: "/images/product/product-01.jpg",
          isActive: true,
        });
      }
      setIsDialogOpen(false);
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "تعذر حفظ المنتج",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    setActionError(null);
    try {
      await deleteProduct(deletingProductId);
      setDeletingProductId(null);
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "تعذر حذف المنتج",
      );
    }
  };

  const handleStatusChange = async (id: string, confirm: boolean) => {
    setActionError(null);
    try {
      if (confirm) await confirmSubOrder(id);
      else await rejectSubOrder(id);
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "تعذر تحديث حالة الطلب",
      );
    }
  };

  // NFR-02 Privacy Masking:
  const formatBuyerPhone = (phone: string, status: string) => {
    const raw = phone.replace(/\D/g, "");
    if (status === "CONFIRMED") {
      if (raw.length === 10)
        return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
      return phone;
    }
    // Masked format: 0944 ••• 034
    if (raw.length >= 7) {
      return `${raw.slice(0, 4)} ••• ${raw.slice(-3)}`;
    }
    return "09•• ••• •••";
  };

  const formatBuyerNid = (nid: string, status: string) => {
    const raw = nid.replace(/\D/g, "");
    if (status === "CONFIRMED") {
      return raw || nid;
    }
    // Masked format: ••••••••034
    if (raw.length >= 3) {
      return "••••••••" + raw.slice(-3);
    }
    return "•••••••••••";
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

      {/* Main Content: Sub-Orders Table & Products CMS Table */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sub-Orders Section (7 cols on desktop) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="border-b border-[#EBE1D6]/70 pb-3">
            <h2 className="text-lg font-bold text-[#0F172A]">طلبات المتجر</h2>
            <p className="text-xs text-[#475569]">
              مرتبة حسب الأقرب انتهاءً للمهلة · أرقام الهوية مخفية حتى التأكيد
            </p>
          </div>

          <div
            dir="rtl"
            className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]"
          >
            <table
              dir="rtl"
              className="w-full min-w-[620px] text-right text-sm"
            >
              <thead className="border-b border-[#EBE1D6] bg-[#F6F0E9]">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    الفاتورة
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    المشتري
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    الإجمالي
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    المتبقي
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    الحالة
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-[#475569]">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D6]/60">
                {currentShopSubOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-sm text-[#475569]"
                    >
                      لا توجد طلبات فرعية مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  currentShopSubOrders.map((sub) => {
                    const isPending = sub.status === "PENDING";
                    const isConfirmed = sub.status === "CONFIRMED";

                    return (
                      <tr
                        key={sub.id}
                        className="transition-colors hover:bg-[#FBF8F4]"
                      >
                        <td className="px-3 py-3.5 font-mono text-xs font-bold text-[#0F172A]">
                          {sub.invoiceNumber}
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {sub.customerName}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-[#475569]">
                            {formatBuyerPhone(sub.customerPhone, sub.status)}
                          </p>
                          <p className="font-mono text-[11px] text-[#94A3B8]">
                            {formatBuyerNid(sub.customerNationalId, sub.status)}
                          </p>
                        </td>
                        <td className="px-3 py-3.5 font-mono text-xs font-semibold text-[#0F172A]">
                          {sub.subtotalSyp.toLocaleString("en-US")} ل.س
                        </td>
                        <td className="px-3 py-3.5 text-xs">
                          {isPending ? (
                            <span className="font-mono font-bold text-[#B45309]">
                              {sub.remainingHours} ساعات
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {isConfirmed && (
                            <span className="inline-block rounded-full bg-[#D8F1E4] px-3 py-1 text-center text-xs font-semibold text-[#15803D]">
                              تم التأكيد
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-block rounded-full bg-[#FDEFCB] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
                              بانتظار التأكيد
                            </span>
                          )}
                          {!isConfirmed && !isPending && (
                            <span className="inline-block rounded-full bg-[#F6F0E9] px-2.5 py-1 text-xs font-semibold text-[#475569]">
                              ملغي
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleStatusChange(sub.id, true)
                                  }
                                  className="h-9 rounded-full bg-[#C40027] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#a50021] active:scale-95"
                                >
                                  تأكيد
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleStatusChange(sub.id, false)
                                  }
                                  className="h-9 rounded-full border border-[#0F172A] bg-white px-3 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            {isConfirmed && (
                              <button
                                type="button"
                                onClick={() => setCallModalSub(sub)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#0F172A] bg-white px-3.5 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                              >
                                <CallIcon className="size-3.5" />
                                <span>اتصل بالمشتري</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product CMS Section (5 cols on desktop) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#EBE1D6]/70 pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                إدارة المنتجات
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

          <div
            dir="rtl"
            className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]"
          >
            <table dir="rtl" className="w-full text-right text-sm">
              <thead className="border-b border-[#EBE1D6] bg-[#F6F0E9]">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    المنتج
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    التصنيف
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold text-[#475569]">
                    السعر
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-[#475569]">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D6]/60">
                {shopProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[#FBF8F4]"
                  >
                    <td className="px-3 py-3">
                      <p className="line-clamp-1 text-xs font-bold text-[#0F172A]">
                        {p.title}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#475569]">
                      {p.category}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-[#0F172A]">
                      {p.priceSyp.toLocaleString("en-US")} ل.س
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditDialog(p)}
                          className="flex size-8 items-center justify-center rounded-full border border-[#0F172A]/30 text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                          title="تعديل"
                        >
                          <PencilIcon className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(p.id)}
                          className="flex size-8 items-center justify-center rounded-full border border-[#BA1A1A]/30 text-[#BA1A1A] transition-all hover:bg-[#BA1A1A] hover:text-white"
                          title="حذف"
                        >
                          <TrashBinIcon className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Call Customer Modal */}
      {callModalSub && (
        <Dialog
          open={Boolean(callModalSub)}
          onOpenChange={() => setCallModalSub(null)}
        >
          <DialogContent className="max-w-sm rounded-[24px] bg-white p-6 text-right">
            <DialogHeader className="border-b border-[#EBE1D6] pb-3 text-right">
              <DialogTitle className="text-base font-bold text-[#0F172A]">
                بيانات اتصال المشتري
              </DialogTitle>
              <DialogDescription className="text-xs text-[#15803D]">
                تم تأكيد الطلب — الهوية مكشوفة بالكامل للتواصل والتسليم
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3 text-sm">
              <div className="space-y-2 rounded-[14px] bg-[#FBF8F4] p-3">
                <div>
                  <span className="block text-xs text-[#475569]">
                    اسم المشتري:
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {callModalSub.customerName}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#475569]">
                    رقم الهاتف:
                  </span>
                  <a
                    href={`tel:${callModalSub.customerPhone}`}
                    className="font-mono font-bold text-[#C40027] hover:underline"
                  >
                    {callModalSub.customerPhone}
                  </a>
                </div>
                <div>
                  <span className="block text-xs text-[#475569]">
                    الرقم الوطني:
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#0F172A]">
                    {callModalSub.customerNationalId}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-[#475569]">
                    إجمالي الفاتورة:
                  </span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    {callModalSub.subtotalSyp.toLocaleString("en-US")} ل.س
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setCallModalSub(null)}
                className="h-10 rounded-full bg-[#0F172A] px-6 text-xs font-semibold text-white"
              >
                إغلاق
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ShopOverview;
