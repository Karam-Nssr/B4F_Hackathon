import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Keep the internal locale route from re-entering Proxy after a rewrite.
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

export default createMiddleware(routing);
