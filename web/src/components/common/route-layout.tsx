/*
Pseudocode:
Objective: provide a consistent, behavior-neutral layout for route segments.
Input: the segment's child content.
Process: preserve composition without adding page-specific state or styling.
Output: render children unchanged.
*/
const RouteLayout = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

export default RouteLayout;
