import PageBreadcrumb from "@/components/common/page-breadcrumb";
import BlankPageContent from "@/components/main/pages/blank-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blank Page | TailAdmin - Next.js Admin Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

const BlankPage = () => {
  return (
    <div>
      <PageBreadcrumb pageTitle="Blank Page" />
      <BlankPageContent />
    </div>
  );
};

export default BlankPage;
