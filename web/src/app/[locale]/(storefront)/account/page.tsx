/*
Pseudocode:
Objective: render User Account & Saved Identity settings matching Figma user_account.html.
Input: currentUser and updateIdentity action from useInstaMallStore.
Process:
- Two-column layout: User profile sidebar and Saved Identity form card.
- User profile sidebar with pastel circle monogram avatar, name, email, link to orders, role switcher, and logout.
- Saved Identity card with Phone number input and 11-digit National ID input.
- React Hook Form with Zod validation that tolerates formatted spaces and normalizes values.
- Clean notification banner when saved.
Output: a production-ready user account and identity management page.
*/
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formatPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

interface FormData {
  phone: string;
  nationalId: string;
}

const accountSchema = z.object({
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .refine(
      (val) => /^[+\d][\d\s+-]{6,}$/.test(val.trim()),
      { message: "أدخل رقم هاتف صالحاً" },
    ),
  nationalId: z
    .string()
    .min(1, "الرقم الوطني مطلوب")
    .refine(
      (val) => val.replace(/\s/g, "").length === 11 && /^\d+$/.test(val.replace(/\s/g, "")),
      { message: "الرقم الوطني يجب أن يتكون من 11 رقماً" },
    ),
});

const AccountPage = () => {
  const router = useRouter();
  const { currentUser, updateIdentity, logout, loginAsDemo } = useInstaMallStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    try {
      await loginAsDemo("user");
    } catch {
      setSaveError("تعذر تسجيل الدخول التجريبي");
    }
  };

  // Keep every hook above the guard so the component never changes hook order.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      phone: currentUser?.phone ? formatPhone(currentUser.phone) : "",
      nationalId: currentUser?.nationalId ?? "",
    },
  });

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#EBE1D6] bg-white p-10 text-center shadow-card space-y-5 my-8">
        <div className="flex size-14 items-center justify-center rounded-[18px] bg-[#FDE7EA] text-2xl">
          👤
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#0F172A]">تسجيل الدخول مطلوب لعرض الحساب</h2>
          <p className="text-sm text-[#475569]">
            يرجى تسجيل الدخول للوصول إلى بيانات الهوية المحفوظة المستخدمة في الفواتير.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void handleDemoLogin()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#C40027] px-6 text-sm font-semibold text-white shadow-red hover:bg-[#a50021]"
          >
            الدخول المباشر كمشتري تجريبي
          </button>
          <Link
            href="/auth"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#0F172A] bg-white px-6 text-sm font-semibold text-[#0F172A] hover:bg-[#F6F0E9]"
          >
            صفحة تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    setSaveError(null);
    try {
      await updateIdentity(data.phone.trim(), data.nationalId.replace(/\s/g, ""));
      setSuccessMessage("تم حفظ بيانات الهوية بنجاح واستخدامها في الفواتير المستقبلية.");
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "تعذر حفظ البيانات");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="space-y-8 text-right">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#0F172A] md:text-4xl">حسابي</h1>
        <p className="text-base text-[#475569]">
          إدارة بيانات الهوية المستخدمة في الفواتير والطلبات.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Card */}
        <div className="w-full shrink-0 rounded-[22px] border border-[#EBE1D6] bg-white p-6 shadow-[0px_4px_16px_rgba(15,23,42,0.06)] lg:w-[320px] space-y-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-[18px] bg-[#FDE7EA] text-xl font-bold text-[#0F172A] shadow-xs">
              {currentUser.fullName?.trim()?.[0] || "م"}
            </div>
            <h2 className="mt-3 text-lg font-bold text-[#0F172A]">
              {currentUser.fullName}
            </h2>
            <p className="text-xs text-[#475569]">{currentUser.email}</p>
          </div>

          <div className="h-px bg-[#EBE1D6]" />

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/orders"
              className="flex items-center justify-between rounded-[14px] bg-[#F6F0E9] px-4 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#ECE3D9] transition-colors"
            >
              <span>طلباتي والفواتير</span>
              <span className="font-mono text-xs">←</span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center justify-between rounded-[14px] px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F6F0E9] hover:text-[#0F172A] transition-colors"
            >
              <span>السلة الموحدة</span>
              <span className="font-mono text-xs">←</span>
            </Link>
          </nav>

          <div className="h-px bg-[#EBE1D6]" />

          {/* Quick Role Switcher for Demo */}
          <div className="rounded-[14px] bg-[#FBF8F4] p-3 text-right">
            <p className="text-xs font-medium text-[#475569]">التبديل بين البوابات (تجريبي):</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Link
                href="/shop"
                className="rounded-full bg-[#1E293B] px-3 py-1 text-xs font-medium text-white hover:bg-[#2C4180]"
              >
                لوحة التاجر
              </Link>
              <Link
                href="/admin"
                className="rounded-full bg-[#1E293B] px-3 py-1 text-xs font-medium text-white hover:bg-[#2C4180]"
              >
                لوحة المشرف
              </Link>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full pt-2 text-start text-sm font-semibold text-[#BA1A1A] hover:underline"
          >
            تسجيل الخروج
          </button>
        </div>

        {/* Main Identity Settings Card */}
        <div className="flex-1 rounded-[22px] border border-[#EBE1D6] bg-white p-6 md:p-8 shadow-[0px_4px_16px_rgba(15,23,42,0.06)] space-y-6">
          <div className="space-y-1 border-b border-[#EBE1D6]/70 pb-4">
            <h2 className="text-xl font-bold text-[#0F172A]">بيانات الفاتورة المحفوظة</h2>
            <p className="text-sm text-[#475569]">
              تُستخدم تلقائياً في كل طلب وفاتورة دون إعادة إدخالها عند كل عملية شراء.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="rounded-[14px] border border-[#15803D]/30 bg-[#D8F1E4] p-4 text-sm font-medium text-[#15803D]">
              {successMessage}
            </div>
          )}

          {saveError && (
            <div className="rounded-[14px] border border-[#C40027]/40 bg-[#FFF3F1] p-4 text-sm font-medium text-[#BA1A1A]">
              {saveError}
            </div>
          )}

          <form
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            className="space-y-6"
            noValidate
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Phone Field */}
              <Field>
                <FieldLabel className="text-sm font-semibold text-[#0F172A]">
                  رقم الهاتف (09xx xxx xxx)
                </FieldLabel>
                <Input
                  {...register("phone")}
                  type="text"
                  className="font-mono text-sm h-12 rounded-[14px] border-[#94A3B8]"
                  placeholder="+963900000001"
                />
                <FieldError errors={[errors.phone]} />
              </Field>

              {/* National ID Field */}
              <Field>
                <FieldLabel className="text-sm font-semibold text-[#0F172A]">
                  الرقم الوطني (11 رقماً)
                </FieldLabel>
                <Input
                  {...register("nationalId")}
                  type="text"
                  maxLength={11}
                  className="font-mono text-sm h-12 rounded-[14px] border-[#94A3B8]"
                  placeholder="00000000000"
                />
                <FieldError errors={[errors.nationalId]} />
              </Field>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#C40027] px-8 text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95 disabled:opacity-60"
              >
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ البيانات"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
