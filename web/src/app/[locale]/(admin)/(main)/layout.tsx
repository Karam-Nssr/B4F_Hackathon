/*
Pseudocode:
Objective: define this segment's layout boundary.
Input: nested route content.
Process: delegate to the shared pass-through layout.
Output: preserve current UI while keeping a segment-specific layout entry point.
*/
import RouteLayout from "@/components/common/route-layout";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RouteLayout>{children}</RouteLayout>
);

export default Layout;
