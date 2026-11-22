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
import { PencilIcon, TrashBinIcon, PlusIcon } from "@/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
  priceSyp: z.string().regex(/^\d+$/, "السعر يجب أن يكون رقماً صحيحاً بالليرة السورية"),
});

const ShopProductsPage = () => {
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
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

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
      setActionError(caught instanceof Error ? caught.message : "تعذر حفظ المنتج");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProductId) return;
    setActionError(null);
    try {
      await deleteProduct(deletingProductId);
      setDeletingProductId(null);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "تعذر حذف المنتج");
    }
  };

  return (
    <div className="space-y-6 text-right">
      {(actionError || error) && (
        <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-3 text-sm font-semibold text-[#BA1A1A]">
          {actionError || error}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EBE1D6]/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] md:text-3xl">إدارة المنتجات</h1>
          <p className="text-sm text-[#475569]">
            التسعير بالليرة السورية · التحكم الكامل في معروضات المتجر
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C40027] px-6 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] hover:bg-[#a50021] active:scale-95 transition-all"
        >
          <PlusIcon className="size-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      <div dir="rtl" className="overflow-x-auto rounded-[22px] border border-[#EBE1D6] bg-white shadow-[0px_4px_16px_rgba(15,23,42,0.06)]">
        <table dir="rtl" className="w-full min-w-[700px] text-right text-sm">
          <thead className="bg-[#F6F0E9] border-b border-[#EBE1D6]">
            <tr>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">المنتج</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">التصنيف</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">السعر</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-[#475569]">الحالة</th>
              <th className="py-3.5 px-4 text-center text-xs font-semibold text-[#475569]">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBE1D6]/60">
            {shopProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-[#475569]">
                  لا توجد منتجات مسجلة في هذا المتجر حالياً
                </td>
              </tr>
            ) : (
              shopProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FBF8F4] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="size-10 rounded-[10px] object-cover bg-[#F6F0E9]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{p.title}</p>
                        <p className="text-xs text-[#475569] line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#475569]">{p.category}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-sm text-[#0F172A]">
                    {p.priceSyp.toLocaleString("en-US")} ل.س
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        p.isActive
                          ? "bg-[#D8F1E4] text-[#15803D]"
                          : "bg-[#F6F0E9] text-[#475569]"
                      }`}
                    >
                      {p.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditDialog(p)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#0F172A] bg-white px-3.5 text-xs font-semibold text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all"
                      >
                        <PencilIcon className="size-3.5" />
                        <span>تعديل</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProductId(p.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#BA1A1A] bg-white px-3.5 text-xs font-semibold text-[#BA1A1A] hover:bg-[#BA1A1A] hover:text-white transition-all"
                      >
                        <TrashBinIcon className="size-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-[24px] bg-white p-6 text-right">
          <DialogHeader className="text-right border-b border-[#EBE1D6] pb-3">
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
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">اسم المنتج</FieldLabel>
              <Input
                {...register("title")}
                type="text"
                placeholder="مثال: أباجورة خشب جوز"
                className="h-11 rounded-[14px]"
              />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">التصنيف</FieldLabel>
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
                className="font-mono h-11 rounded-[14px]"
              />
              <FieldError errors={[errors.priceSyp]} />
            </Field>

            <Field>
              <FieldLabel className="text-xs font-semibold text-[#0F172A]">الوصف</FieldLabel>
              <Input
                {...register("description")}
                type="text"
                placeholder="وصف مواصفات المنتج"
                className="h-11 rounded-[14px]"
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE1D6]">
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
        <Dialog open={Boolean(deletingProductId)} onOpenChange={() => setDeletingProductId(null)}>
          <DialogContent className="max-w-sm rounded-[24px] bg-white p-6 text-right">
            <DialogHeader className="text-right">
              <DialogTitle className="text-base font-bold text-[#BA1A1A]">
                تأكيد حذف المنتج
              </DialogTitle>
              <DialogDescription className="text-xs text-[#475569] mt-2">
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
