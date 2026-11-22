/*
Pseudocode:
Objective: define this segment's not-found boundary.
Input: none.
Process: delegate translated 404 content and navigation to shared UI.
Output: a locale-aware not-found screen for the segment.
*/
import RouteNotFound from "@/components/common/route-not-found";

const NotFound = () => <RouteNotFound />;

export default NotFound;
