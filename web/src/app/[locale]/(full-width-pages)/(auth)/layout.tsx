import ThemeToggler from "@/components/common/theme-toggler";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen bg-bg">
      {children}
      <div className="fixed inset-e-6 bottom-6 z-50 hidden sm:block">
        <ThemeToggler />
      </div>
    </div>
  );
};

export default AuthLayout;
