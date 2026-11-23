/*
Pseudocode:
Render sign-in, account-type links, or the preselected buyer/seller registration form.
Validate inputs with React Hook Form and Zod, call the existing auth actions, and route by returned role.
*/
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { authRoutes, type SignupAccountType } from "@/lib/auth-routes";
import { useInstaMallStore } from "@/context/instamall-store";
import { BrandLogo } from "@/components/storefront/brand-logo";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { notifySuccess } from "@/components/ui/toast";
import AuthMarketingPanel from "./auth-marketing-panel";

export interface AuthPageProps {
  initialMode?: "signup" | "signin";
  initialAccountType?: SignupAccountType | null;
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
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  password: z.string().min(6, "كلمة المرور يجب أن تتكون من 6 خانات على الأقل"),
});

const AuthPortal = ({
  initialMode = "signin",
  initialAccountType = null,
}: AuthPageProps) => {
  const router = useRouter();
  const t = useTranslations("auth");
  const { login, register: registerAccount } = useInstaMallStore();
  const [showPassword, setShowPassword] = useState(false);
  const isSignup = initialMode === "signup";
  const isChoosingAccountType = isSignup && initialAccountType === null;
  const isRegistration = isSignup && initialAccountType !== null;
  const registrationRole = initialAccountType === "seller" ? "shop" : "user";
  const pageTitle = !isSignup
    ? t("signinWelcome")
    : isChoosingAccountType
      ? t("signupChoiceTitle")
      : initialAccountType === "seller"
        ? t("sellerSignupTitle")
        : t("buyerSignupTitle");
  const pageDescription = !isSignup
    ? t("signinDescription")
    : isChoosingAccountType
      ? t("signupChoiceDescription")
      : t("signupDescription");

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
    try {
      if (!isSignup) {
        const profile = await login(data.email, data.password);
        notifySuccess("تم تسجيل الدخول بنجاح.");
        routeByRole(profile.role);
        return;
      }

      const profile = await registerAccount({
        fullName: data.fullName || "مستخدم InstaMall",
        email: data.email,
        password: data.password,
        role: registrationRole,
        phone: data.phone?.trim() || undefined,
        nationalId: data.nationalId?.trim() || undefined,
      });
      notifySuccess("تم إنشاء الحساب بنجاح.");
      routeByRole(profile.role);
    } catch {
      // The store reports login and registration failures through the global toast.
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-bg px-4 py-8 text-navy sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo className="size-9" />
          <span className="font-brand text-2xl font-normal">InstaMall</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-semibold text-muted transition-colors hover:text-navy"
        >
          الرجوع للمتجر الرئيسية ←
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-6 lg:flex-row-reverse lg:gap-8">
        <AuthMarketingPanel />

        <section className="w-full shrink-0 space-y-6 rounded-hero border border-line bg-surface p-6 text-right shadow-card sm:p-8 lg:w-[480px] lg:p-10">
          <div className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
              <p className="mt-1 text-xs text-muted">{pageDescription}</p>
            </header>

            {isChoosingAccountType ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href={authRoutes.signupFor("buyer")}
                    className="group rounded-card border border-line bg-surface p-4 transition hover:border-brand-blue hover:shadow-card focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                  >
                    <span className="block text-sm font-bold text-navy">
                      {t("buyerChoiceTitle")}
                    </span>
                    <span className="mt-2 block text-xs leading-6 text-muted">
                      {t("buyerChoiceDescription")}
                    </span>
                    <span className="mt-4 block text-xs font-semibold text-brand-blue">
                      {t("buyerChoiceAction")}
                    </span>
                  </Link>
                  <Link
                    href={authRoutes.signupFor("seller")}
                    className="group rounded-card border border-line bg-low p-4 transition hover:border-brand-blue hover:shadow-card focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
                  >
                    <span className="block text-sm font-bold text-navy">
                      {t("sellerChoiceTitle")}
                    </span>
                    <span className="mt-2 block text-xs leading-6 text-muted">
                      {t("sellerChoiceDescription")}
                    </span>
                    <span className="mt-4 block text-xs font-semibold text-brand-blue">
                      {t("sellerChoiceAction")}
                    </span>
                  </Link>
                </div>
                <p className="text-center text-xs text-muted">
                  {t("hasAccount")}{" "}
                  <Link
                    href={authRoutes.signIn}
                    className="font-semibold text-brand-blue hover:underline"
                  >
                    {t("signInLink")}
                  </Link>
                </p>
              </div>
            ) : (
              <>
                {isRegistration ? (
                  <div className="flex items-center justify-between rounded-form bg-low px-4 py-3 text-xs">
                    <span className="font-semibold">
                      {initialAccountType === "seller"
                        ? t("sellerAccountLabel")
                        : t("buyerAccountLabel")}
                    </span>
                    <Link
                      href={authRoutes.signupChoice}
                      className="font-semibold text-brand-blue hover:underline"
                    >
                      {t("changeAccountType")}
                    </Link>
                  </div>
                ) : (
                  <p className="text-xs text-muted">
                    {t("noAccount")}{" "}
                    <Link
                      href={authRoutes.signupChoice}
                      className="font-semibold text-brand-blue hover:underline"
                    >
                      {t("chooseAccountType")}
                    </Link>
                  </p>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  {isRegistration && (
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        الاسم الكامل
                      </FieldLabel>
                      <Input
                        {...register("fullName")}
                        type="text"
                        placeholder="الاسم الكامل"
                        className="h-11 rounded-form border-lineStrong"
                      />
                      <FieldError errors={[errors.fullName]} />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel className="text-xs font-semibold">
                      البريد الإلكتروني
                    </FieldLabel>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="name@example.com"
                      className="h-11 rounded-form border-lineStrong"
                    />
                    <FieldError errors={[errors.email]} />
                  </Field>

                  {isRegistration && (
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        رقم الهاتف
                      </FieldLabel>
                      <Input
                        {...register("phone")}
                        type="text"
                        inputMode="tel"
                        placeholder="+963900000001"
                        className="h-11 rounded-form border-lineStrong font-mono text-sm"
                      />
                      <FieldError errors={[errors.phone]} />
                    </Field>
                  )}

                  {isRegistration && initialAccountType === "buyer" && (
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        الرقم الوطني (11 رقماً يُحفظ للفواتير)
                      </FieldLabel>
                      <Input
                        {...register("nationalId")}
                        type="text"
                        maxLength={11}
                        placeholder="00000000000"
                        className="h-11 rounded-form border-lineStrong font-mono text-sm"
                      />
                      <FieldError errors={[errors.nationalId]} />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel className="text-xs font-semibold">
                      كلمة المرور
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-11 rounded-form border-lineStrong pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        aria-label={
                          showPassword
                            ? "إخفاء كلمة المرور"
                            : "إظهار كلمة المرور"
                        }
                        className="absolute inset-y-0 inset-e-3 flex items-center text-lineStrong hover:text-navy"
                      >
                        {showPassword ? (
                          <EyeCloseIcon className="size-6" />
                        ) : (
                          <EyeIcon className="size-6" />
                        )}
                      </button>
                    </div>
                    <FieldError errors={[errors.password]} />
                  </Field>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="shadow-theme-xs mt-2 h-12 w-full rounded-pill bg-brand-blue text-sm font-semibold text-white hover:bg-brand-blue-hover disabled:bg-brand-blue/60"
                  >
                    {isSubmitting
                      ? "جارٍ المعالجة..."
                      : isRegistration
                        ? initialAccountType === "seller"
                          ? t("submitSeller")
                          : t("submitBuyer")
                        : t("submitSignIn")}
                  </Button>
                </form>

                {isRegistration && (
                  <p className="text-center text-xs text-muted">
                    {t("hasAccount")}{" "}
                    <Link
                      href={authRoutes.signIn}
                      className="font-semibold text-brand-blue hover:underline"
                    >
                      {t("signInLink")}
                    </Link>
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthPortal;
