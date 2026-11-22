/*
Pseudocode:
Objective: render the complete Syrian Marketplace InstaMall Authentication Portal matching Figma auth.html and SAD v1.2.
Input: initialMode ("signup" | "signin") prop and the real auth actions from useInstaMallStore.
Process:
- Split-screen layout (Marketing Card on Right in RTL, Auth Form Card on Left in RTL).
- Mode toggle pills: "حساب جديد" (Sign Up) vs "تسجيل الدخول" (Sign In).
- Role selector pills: "مشتري" (Customer) vs "صاحب متجر" (Shop Owner).
- Capture email and password for sign-in; add full name, phone, and national ID for sign-up.
- React Hook Form + Zod validation with clear Arabic error states.
- On submit call the store's real login/register API actions, surface backend errors, and route by the returned role.
Output: a production-grade, beautifully localized authentication portal.
*/
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "@/i18n/navigation";
import { useInstaMallStore } from "@/context/instamall-store";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface AuthPageProps {
  initialMode?: "signup" | "signin";
}

interface AuthFormData {
  fullName?: string;
  email: string;
  phone?: string;
  nationalId?: string;
  password: string;
}

const authSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 خانات على الأقل"),
});

const AuthPortal = ({ initialMode = "signup" }: AuthPageProps) => {
  const router = useRouter();
  const { login, register: registerAccount, loginAsDemo } = useInstaMallStore();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [role, setRole] = useState<"user" | "shop">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nationalId: "",
      password: "",
    },
  });

  const routeByRole = (nextRole: "user" | "shop" | "admin") => {
    if (nextRole === "shop") router.push("/shop");
    else if (nextRole === "admin") router.push("/admin");
    else router.push("/");
  };

  const onSubmit = async (data: AuthFormData) => {
    setApiError(null);
    setSuccessMsg(null);

    try {
      if (mode === "signin") {
        const profile = await login(data.email, data.password);
        setSuccessMsg("تم تسجيل الدخول بنجاح! جارٍ تحويلك...");
        routeByRole(profile.role);
        return;
      }

      const profile = await registerAccount({
        fullName: data.fullName || "مستخدم InstaMall",
        email: data.email,
        password: data.password,
        role,
        phone: data.phone?.trim() || undefined,
        nationalId: data.nationalId?.trim() || undefined,
      });
      setSuccessMsg("تم إنشاء الحساب بنجاح! جارٍ تحويلك...");
      routeByRole(profile.role);
    } catch (caught) {
      setApiError(caught instanceof Error ? caught.message : "تعذر إكمال الطلب");
    }
  };

  const handleDemoLogin = async (demoRole: "user" | "shop" | "admin") => {
    setApiError(null);
    try {
      const profile = await loginAsDemo(demoRole);
      routeByRole(profile.role);
    } catch (caught) {
      setApiError(caught instanceof Error ? caught.message : "تعذر تسجيل الدخول التجريبي");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F4] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar Bar */}
      <div className="mx-auto w-full max-w-6xl mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo className="size-9" />
          <span
            className="font-brand text-2xl text-[#0F172A] font-normal"
          >
            InstaMall
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors"
        >
          الرجوع للمتجر الرئيسية ←
        </Link>
      </div>

      {/* Split Screen Container */}
      <div className="mx-auto w-full max-w-6xl flex flex-col lg:flex-row-reverse gap-8 items-stretch">
        {/* Right Side Card in RTL: Brand Marketing Card */}
        <div className="flex-1 rounded-[28px] bg-gradient-to-b from-[#2C4180] to-[#0F172A] p-8 md:p-12 text-white flex flex-col justify-between text-right shadow-xl">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-[#FFB3AF]">
              منصة المتاجر السورية المستقلة
            </span>

            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              ستايلك من متاجر سوريا بطلب واحد
            </h2>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[#FFB3AF]">
                  ✓
                </span>
                <span className="text-base md:text-lg font-medium text-white">
                  سلة واحدة لكل المتاجر وتوزيع تلقائي
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[#FFB3AF]">
                  ✓
                </span>
                <span className="text-base md:text-lg font-medium text-white">
                  تأكيد من المتجر خلال 1–24 ساعة
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[#FFB3AF]">
                  ✓
                </span>
                <span className="text-base md:text-lg font-medium text-white">
                  بالليرة السورية، الدفع والتسليم مباشرة دون بوابات إلكترونية
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#BEC6E0]">
            <span>تسوّق من متاجر متعددة بطلب موحد</span>
            <span className="font-mono">v1.2 Syrian Marketplace</span>
          </div>
        </div>

        {/* Left Side Card in RTL: Auth Form Card */}
        <div className="w-full lg:w-[480px] shrink-0 rounded-[28px] border border-[#EBE1D6] bg-white p-6 sm:p-10 shadow-[0px_4px_16px_rgba(15,23,42,0.06)] flex flex-col justify-between text-right">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">أهلاً بك في InstaMall</h1>
              <p className="mt-1 text-xs text-[#475569]">
                سجّل الدخول أو أنشئ حساباً لحفظ هويتك واستخدامها في الفواتير.
              </p>
            </div>

            {/* Mode Toggle Pills (حساب جديد vs تسجيل الدخول) */}
            <div className="flex rounded-full bg-[#F6F0E9] p-1">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
                  mode === "signup"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                حساب جديد
              </button>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
                  mode === "signin"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-[#475569] hover:text-[#0F172A]"
                }`}
              >
                تسجيل الدخول
              </button>
            </div>

            {/* Role Selector Pills (مشتري vs صاحب متجر) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0F172A] block">نوع الحساب</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 rounded-[14px] border py-2.5 px-3 text-xs font-semibold transition-all ${
                    role === "user"
                      ? "border-[#0F172A] bg-[#0F172A] text-white"
                      : "border-[#94A3B8]/50 bg-white text-[#475569] hover:bg-[#F6F0E9]"
                  }`}
                >
                  مشتري (زبون)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("shop")}
                  className={`flex-1 rounded-[14px] border py-2.5 px-3 text-xs font-semibold transition-all ${
                    role === "shop"
                      ? "border-[#0F172A] bg-[#0F172A] text-white"
                      : "border-[#94A3B8]/50 bg-white text-[#475569] hover:bg-[#F6F0E9]"
                  }`}
                >
                  صاحب متجر (تاجر)
                </button>
              </div>
            </div>

            {/* Success Banner */}
            {successMsg && (
              <div className="rounded-[14px] bg-[#D8F1E4] border border-[#15803D]/40 p-3 text-xs font-semibold text-[#15803D]">
                {successMsg}
              </div>
            )}

            {/* Backend Error Banner */}
            {apiError && (
              <div className="rounded-[14px] bg-[#FFF3F1] border border-[#C40027]/40 p-3 text-xs font-semibold text-[#BA1A1A]">
                {apiError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Full Name (Sign Up only) */}
              {mode === "signup" && (
                <Field>
                  <FieldLabel className="text-xs font-semibold text-[#0F172A]">الاسم الكامل</FieldLabel>
                  <Input
                    {...register("fullName")}
                    type="text"
                    placeholder="الاسم الكامل"
                    className="h-11 rounded-[14px] border-[#94A3B8]"
                  />
                  <FieldError errors={[errors.fullName]} />
                </Field>
              )}

              {/* Email */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                  البريد الإلكتروني
                </FieldLabel>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="buyer@instamall.local"
                  className="h-11 rounded-[14px] border-[#94A3B8]"
                />
                <FieldError errors={[errors.email]} />
              </Field>

              {/* Phone (Sign Up only) */}
              {mode === "signup" && (
                <Field>
                  <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                    رقم الهاتف (اختياري)
                  </FieldLabel>
                  <Input
                    {...register("phone")}
                    type="text"
                    placeholder="+963900000001"
                    className="font-mono text-sm h-11 rounded-[14px] border-[#94A3B8]"
                  />
                  <FieldError errors={[errors.phone]} />
                </Field>
              )}

              {/* National ID (Sign Up for Users only) */}
              {mode === "signup" && role === "user" && (
                <Field>
                  <FieldLabel className="text-xs font-semibold text-[#0F172A]">
                    الرقم الوطني (11 رقماً يُحفظ للفواتير)
                  </FieldLabel>
                  <Input
                    {...register("nationalId")}
                    type="text"
                    maxLength={11}
                    placeholder="00000000000"
                    className="font-mono text-sm h-11 rounded-[14px] border-[#94A3B8]"
                  />
                  <FieldError errors={[errors.nationalId]} />
                </Field>
              )}

              {/* Password */}
              <Field>
                <FieldLabel className="text-xs font-semibold text-[#0F172A]">كلمة المرور</FieldLabel>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 pe-10 rounded-[14px] border-[#94A3B8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 start-3 flex items-center text-[#94A3B8] hover:text-[#0F172A]"
                  >
                    {showPassword ? <EyeCloseIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
                <FieldError errors={[errors.password]} />
              </Field>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#C40027] text-sm font-semibold text-white shadow-[0px_4px_12px_rgba(196,0,39,0.28)] transition-all hover:bg-[#a50021] active:scale-95 disabled:opacity-60"
              >
                {isSubmitting
                  ? "جارٍ المعالجة..."
                  : mode === "signup"
                  ? "إنشاء الحساب والمتابعة"
                  : "تسجيل الدخول والمتابعة"}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EBE1D6] space-y-2 text-center">
            <p className="text-xs font-semibold text-[#475569]">
              تسجيل الدخول السريع للتجربة والتقييم (Demo):
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              <button
                type="button"
                onClick={() => void handleDemoLogin("user")}
                className="rounded-full bg-[#1E293B] px-3.5 py-1 text-xs font-medium text-white hover:bg-[#2C4180]"
              >
                مشتري تجريبي
              </button>
              <button
                type="button"
                onClick={() => void handleDemoLogin("shop")}
                className="rounded-full bg-[#B45309] px-3.5 py-1 text-xs font-medium text-white hover:bg-[#92400e]"
              >
                تاجر تجريبي
              </button>
              <button
                type="button"
                onClick={() => void handleDemoLogin("admin")}
                className="rounded-full bg-[#15803D] px-3.5 py-1 text-xs font-medium text-white hover:bg-[#166534]"
              >
                مشرف عام (Admin)
              </button>
            </div>
            <p className="text-[11px] text-[#94A3B8] pt-1">
              حسابات الإدارة والتجار مجهزة بصلاحيات RBAC كاملة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
