import AuthPortal from "@/components/others/auth/auth-portal";
import type { SignupAccountType } from "@/lib/auth-routes";

interface SignInPageProps {
  searchParams: Promise<{
    mode?: string | string[];
    accountType?: string | string[];
  }>;
}

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { mode, accountType } = await searchParams;
  const modeValue = Array.isArray(mode) ? mode[0] : mode;
  const accountTypeValue = Array.isArray(accountType)
    ? accountType[0]
    : accountType;
  const initialAccountType: SignupAccountType | null =
    accountTypeValue === "buyer" || accountTypeValue === "seller"
      ? accountTypeValue
      : null;
  const initialMode =
    modeValue === "signup" || initialAccountType ? "signup" : "signin";

  return (
    <AuthPortal
      key={`${initialMode}:${initialAccountType ?? "choice"}`}
      initialMode={initialMode}
      initialAccountType={initialAccountType}
    />
  );
};

export default SignInPage;
