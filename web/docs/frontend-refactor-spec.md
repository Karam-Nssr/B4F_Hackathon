# Web Frontend Refactor Specification

## Purpose

Make the storefront and admin web experience easier to navigate and maintain
without changing backend or mobile code, breaking existing business behavior,
or replacing the current design system.

The full frontend cleanup is intentionally incremental. This specification
defines the structure and acceptance criteria; each implementation slice must
be small enough to validate independently.

## Scope and constraints

- Modify files under `web/` only.
- Read backend contracts for reference, but do not change backend or mobile
  files.
- Reuse the installed Next.js, Tailwind, next-intl, and UI component APIs; do
  not add dependencies.
- Keep existing auth validation, identity fields, session behavior, role-based
  navigation, and toasts unless a separate requirement changes them.
- Delete code only after confirming it has no live route or import references.
- Never fabricate API values or add client-side access to data the backend does
  not authorize.

## Findings and constraints

1. `/signin` is the canonical authentication route. `/auth` and `/signup` are
   compatibility redirects; registration starts with separate buyer/seller
   links instead of an account-role selector inside the form.
2. The backend `/admin/users` query returns only `fullName`, `email`, `role`,
   and `createdAt`. It omits `phone`; the admin API has no per-user order-count
   field or endpoint.
3. The SAD's privacy requirements restrict buyer phone and national-ID
   visibility to the buyer and fulfilling shop(s). The admin UI must not expose
   those details. Order counts likewise must not be inferred from unrelated
   user-scoped endpoints.
4. The admin overview and users page use one shared directory component for
   search, role filtering, and table rendering.

## Target behavior

### Authentication

- `/signin` is the canonical authentication URL and opens in sign-in mode.
- `?mode=signup` opens a choice view with separate shopper and seller links.
- `accountType=buyer` or `accountType=seller` opens a registration form with
  that account type already selected; the form itself does not ask users to
  choose their role.
- Keep legacy entry points working: `/auth` redirects to `/signin`, and
  `/signup` redirects to `/signin?mode=signup`. Preserve the same behavior for
  English-prefixed URLs (`/en/...`) and let next-intl normalize the default
  Arabic locale.
- Keep sign-in separate from registration; show buyer and seller entry links in
  the storefront footer and mobile navigation.
- Sign-in asks only for credentials; buyer registration adds the identity field
  while seller registration uses its own preselected account type.
- Keep the shared portal and its existing role-based post-auth destinations,
  form validation, toast notifications, RTL layout, and design tokens.
- Do not reintroduce demo-account controls.

### Admin user directory

- Use one reusable directory/table in the admin overview and full users page.
- Show only data available and permitted in the current admin response:
  name, email, role, and account creation date.
- Do not display buyer phone or national ID in the admin view. Do not display
  per-user order counts until an approved API contract provides them.
- Provide clear loading, error, empty, search, and role-filter states.

### Broader frontend structure

- Keep route files small and locale-aware; put feature behavior and composed UI
  in feature folders under `src/components/`.
- Reuse `src/components/ui/` primitives, existing color/spacing tokens, and
  logical Tailwind properties for RTL.
- Keep API DTO-to-view-model conversion in `src/lib/api/`; keep backend field
  names out of presentation components.
- Use `next/image` for local/remote content images where appropriate.
- Remove only verified dead code. Do not perform a mass move or delete across
  unrelated routes in one change.

## Delivery order

1. Canonicalize authentication entry points and align storefront links.
2. Extract the duplicated admin user directory and show its permitted fields.
3. Refactor other web features one at a time, beginning with the most duplicated
   or confusing user-facing area.
4. Remove verified unused demo/template code only after checking imports,
   routes, and runtime behavior.

## Acceptance criteria

- Sign-in links open the sign-in form; buyer and seller links open the matching
  registration form on the same canonical page, and the generic sign-up route
  opens the account-type choice view.
- Legacy auth URLs redirect without loops and preserve the selected locale.
- Both admin user views use the same component and show only authorized,
  backend-provided fields.
- No files outside `web/` are changed.
- Changed files pass ESLint and TypeScript; the Next.js production build passes.

## Token-efficient Copilot handoff

> Work only in `web/`. Read `web/AGENTS.md` and this specification first. Make
> one feature-sized change at a time; inspect only the route, feature component,
> API adapter, and directly related tests. Reuse existing primitives and tokens.
> Do not change backend/mobile code, install packages, fabricate data, or delete
> code without proving it is unused. Run targeted ESLint and TypeScript checks,
> then the production build when routing or shared behavior changes. Report the
> files changed, checks run, and any API-level blocker.
