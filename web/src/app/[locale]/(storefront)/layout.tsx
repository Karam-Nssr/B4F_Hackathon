/*
Pseudocode:
Objective: provide the storefront layout shell with 72px navy topbar, responsive container, and navy footer.
Input: child route content (home, stores, cart, orders, account).
Process: compose StorefrontNavbar, responsive max-width container with proper padding, and StorefrontFooter.
Output: a full-height storefront layout with sticky header, consistent gutters, and footer.
*/
import StorefrontNavbar from "@/components/storefront/navbar";
import StorefrontFooter from "@/components/storefront/footer";

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8F4]">
      <StorefrontNavbar />
      <main className="flex-1 pb-12 pt-6">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <StorefrontFooter />
    </div>
  );
};

export default StorefrontLayout;
