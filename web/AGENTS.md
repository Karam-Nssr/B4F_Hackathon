# AGENTS.md — TailAdmin Next.js Boilerplate

Next.js 16 (App Router) · React 19 · strict TypeScript · Tailwind CSS v4 · next-intl v4 · Base UI · react-hook-form + zod · TanStack Table · ApexCharts · FullCalendar · Swiper · flatpickr

- **Project scope:** This is a generic, front-end-only boilerplate. Do not add Next.js API routes, application server actions, databases, or project-specific business services. External and mock data are consumed through browser-side adapters.
- **Keep it lightweight:** Prefer platform APIs and installed libraries over custom infrastructure. Use composition and existing UI primitives; do not introduce wrappers, packages, or abstractions without a concrete need.
- **No inline styles:** Use Tailwind classes and existing design tokens. Prefer class-based APIs for third-party components rather than `style` props.
- **Function syntax:** Write components, hooks, and helpers as arrow functions. Use a dedicated `export default Name` statement at the end of component modules. Preserve any necessary named exports used by barrels or shared modules.
- **New modules:** Before implementation, put a concise, stepwise pseudocode comment at the top of each new file and complex module. Keep it focused on objective, input/process/output, and meaningful error paths.
- **Routes:** Every route segment must define its own `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx`. Keep segment files small and locale/layout aware; `error.tsx` must follow the Next.js client error-boundary requirements.
- **Quality scope:** Do not add test frameworks or CI/CD configuration. Use the existing lint/build commands when dependencies are available.

- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint` (`eslint .`). Format with Prettier (`prettier-plugin-tailwindcss` sorts classes). Node >= 20.9.
- Path alias `@/*` → `src/*`. Use it for cross-folder imports; relative imports within a feature folder.
- Don't install new packages without asking the user. Check `package.json` first. Most needs are already covered.

## Repo map

Route groups `(name)/` don't affect URLs. Component folders mirror the route groups. Explore below this level directly.

```
src/
├── app/[locale]/                 # every page lives under [locale]
│   ├── (admin)/                  # dashboard shell, main pages, charts, and UI demos
│   ├── (full-width-pages)/       # auth and error pages without the dashboard shell
│   ├── [route-segment]/          # each segment owns layout/loading/error/not-found files
│   ├── global-error.tsx          # fallback for root-layout failures
│   └── layout.tsx                # locale root: NextIntlClientProvider → ThemeProvider → DirectionProvider → TooltipProvider → ToastProvider
├── components/
│   ├── ui/                       # primitives (Base UI + cva): button, dialog, sheet, field, input, select, combobox, table, tabs, sidebar…
│   ├── common/                   # component-card, page-breadcrumb, route boundaries, vector-map
│   ├── main/<area>/              # e.g. main/dashboard/analytics/active-user-graph/
│   ├── others/                   # charts, maps, ui-elements
│   ├── support/                  # chat, email, support
│   └── full-width-pages/         # auth, pages
├── lib/api/                      # shared fetch client and collection adapter
├── layout/
│   ├── app-layout/{header,sidebar}/  # main shell; nav menu is sidebar/data.tsx
│   ├── header/                   # notification-dropdown, theme-toggler, user-dropdown
│   └── layout-one … layout-six/  # {header,sidebar} for the alternative shells
├── context/theme-context.tsx     # ThemeProvider / useTheme (light | dark | auto)
├── hooks/use-mobile.ts           # useIsMobile (< xl)
├── icons/                        # icon components + index.tsx barrel
├── i18n/                         # routing.ts, request.ts, navigation.ts, languages.ts
├── lib/api/                      # shared fetch client and adapter helpers
├── messages/                     # en.json (add locales only when explicitly configured)
├── utils/                        # cn, getInitials (barrel: "@/utils")
└── proxy.ts                      # next-intl middleware
```

- New admin page: add the route under the right group, then add its menu entry in `src/layout/app-layout/sidebar/data.tsx`. Renamed routes get a permanent redirect in `next.config.ts` `redirects()`.
- Data flow: page/client component → feature adapter → shared `createApiClient` (`fetch`) → external API; adapt external DTOs to UI models before rendering. Mock implementations can satisfy the same adapter contract.

## Components

- **Files and folders are kebab-case** (`card-header.tsx`, `use-mobile.ts`). Components use arrow functions and a dedicated default export at the end of the file.
- **One widget, one folder**: `index.tsx` composes the parts; split sections into sibling files (`card-header.tsx`, `transaction-row.tsx`) and keep static data/types/helpers in `data.ts`, `types.ts`, `utils.ts`. No monolithic files.
- Define a typed props interface per sub-component. Keep state in the container (`index.tsx`) and keep the parts presentational.
- Build from `@/components/ui/*` primitives before raw HTML or new libraries. They wrap `@base-ui/react` and use `cva` variants. Add a variant there instead of overriding styles at call sites. Merge classes with `cn` from `@/utils`.
- Pages: `PageBreadcrumb` (`@/components/common/page-breadcrumb`) at the top, sections wrapped in `ComponentCard` (`@/components/common/component-card`). Static `export const metadata` per page.
- Modals/drawers: `@/components/ui/dialog` / `sheet`. Tooltips: `@/components/ui/tooltip` (provider is already in the root layout).
- Add `"use client"` for hooks, event handlers, or browser APIs. Server layouts/pages inside `[locale]` call `setRequestLocale(locale)` (all `(layouts)/*` and the ai-assistant/support pages do).
- Global state: `useTheme` (`@/context/theme-context`) and `useSidebar` (`@/components/ui/sidebar`). Don't add new providers without need.
- **Forms**: `react-hook-form` + `zodResolver` with a zod schema, rendered with `ui/field` + `ui/input` (see `full-width-pages/auth/sign-in/form.tsx`).
- **Tables**: `@tanstack/react-table` rendered through `@/components/ui/table` (see `main/tables/data-tables/`).
- **Charts**: always `const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })`, never a static import.
- **FullCalendar / Swiper / flatpickr**: imported inside a `"use client"` component (see `main/calendar/`, `others/ui-elements/carousels/`, `main/forms/form-elements/default-inputs/date-picker-input.tsx`). Follow that pattern.
- **Icons**: each icon is `src/icons/<kebab-name>.tsx` exporting an arrow-function `NameIcon(props: IconProps)` and a dedicated default export at the end; re-export names from `src/icons/index.tsx`. Import from `@/icons`. Never inline SVG in components. (Multi-color assets like the flags are `.svg` files re-exported via SVGR.)

## i18n (next-intl)

- `Link`, `useRouter`, `usePathname`, `redirect` come from `@/i18n/navigation`, never `next/link` / `next/navigation`. (`notFound` and `useParams` from `next/navigation` are fine.)
- Only `en` is currently configured in `src/i18n/routing.ts` (`localePrefix: "never"`, so URLs carry no locale). Add a locale only when its message catalog is provided.
- Client: `useTranslations("ns")`. Server: `getTranslations("ns")` from `next-intl/server`. Nest keys by feature (`ecommerce.metrics.customers`).
- Translated today: dashboards (`main/dashboard/*`), headers, sidebar, dropdowns, not-found. Top-level namespaces: `common`, `sidebar`, `header`, `userDropdown`, `notFound`, plus one per dashboard. Other demo pages are still hardcoded English.
- New user-facing text uses translations. Never leave a hardcoded string in an already-translated area. Add keys to every configured locale catalog.
- `ar` is RTL (`isRtl(locale)` in `src/i18n/languages.ts`). See the styling rules below.

## Styling (Tailwind v4)

- The theme lives in `src/app/globals.css` under `@theme`. There is no `tailwind.config`, so don't create one. Plugins: `@tailwindcss/forms`, `tw-animate-css`.
- Use tokens only, with no hex or pixel values in `className`:
  - Colors: `brand-50…950`, `gray-*`, `white`, `black`, `current`, `transparent`, plus Tailwind defaults.
  - Type: `font-outfit`, `text-heading-one…six`, `text-title-sm` / `text-title-lg`, plus standard sizes.
  - Shadows: `shadow-theme-xs…xl`, `shadow-focus-ring`, `shadow-tooltip`, `shadow-datepicker`, `shadow-slider-navigation`, `drop-shadow-4xl`.
  - Breakpoints: `2xsm` (375), `xsm` (425), `3xl` (2000) plus defaults. Z-index: `z-1`, `z-9`, `z-99` … `z-999999`.
  - Exception: chart option objects (`ApexOptions.colors`) take hex values copied from `@theme` (e.g. `#465fff` = brand-500).
- **Dark mode is class-based** (`.dark`). Every styled element needs its `dark:` variant.
- **Logical properties only** (RTL). Use `ms/me`, `ps/pe`, `start/end`, `border-s/e`, `rounded-s/e/ss/se/es/ee`, `text-start/end`, never `ml/mr`, `pl/pr`, `left/right`, `border-l/r`, `rounded-l/r`, `text-left/right`.
  - Flip directional glyphs (arrows, chevrons, prev/next) with `rtl:rotate-180` or `rtl:-scale-x-100`.
  - Mirror sliding elements: `-translate-x-full rtl:translate-x-full`. Use `ltr:` / `rtl:` for any other directional override.
- Reuse existing `@utility` classes in `globals.css` (`menu-item-*`, `menu-dropdown-*`, `nav-icon-item-*`, `docs-menu-item-*`, `docs-border-item-*`, `custom-scrollbar`, `no-scrollbar`) before adding new ones.
- Third-party overrides (ApexCharts, flatpickr, Swiper, simplebar, Prism, FullCalendar) go in the "third-party libraries CSS" section at the bottom of `globals.css`, in the existing `@apply` style. Their base CSS is imported in the root `layout.tsx`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
