# InstaMall

A localized multi-vendor marketplace built for the Syrian market. InstaMall brings independent small shops — clothing, gifts, accessories, home goods, and decor — into one Arabic, right-to-left storefront inspired by the fluid browsing experience of SHEIN, with every price shown in Syrian Pounds (SYP).

## The Idea

Small merchants in Syria often rely on scattered social media posts, which makes browsing, comparing, and ordering from several shops tedious for buyers. Building a full e-commerce platform with online payments and delivery is impractical for this market. InstaMall solves this by focusing on the part that matters most: a smooth, unified shopping and ordering experience.

- **One storefront, many shops:** Customers browse products and shops from independent vendors in a single RTL marketplace.
- **Unified cart, automatic split:** Items from multiple shops go into one cart; a single checkout becomes a master order that is automatically split into independent sub-orders per shop, each with its own invoice.
- **Identity captured once:** Buyers provide their phone number and national ID at registration, and both are attached automatically to every order and invoice — no re-entry at checkout.
- **Realistic shop workflow:** Vendors review their sub-orders and confirm fulfillment within a 1–24 hour window, with the buyer's contact details visible on the invoice.
- **Local by design:** Arabic RTL interfaces and SYP pricing across web and mobile.
- **Deliberately simple v1:** No payment gateway and no delivery module — payment and delivery are coordinated offline between shop and customer.

Three roles share the platform: **User (Customer)** shops and tracks orders, **Shop (Vendor)** manages products and fulfills sub-orders through a web dashboard, and **Admin** monitors platform statistics.

## Repository Layout

| Directory  | Description                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| `web/`     | Next.js 16 + React 19 + Tailwind CSS v4 storefront, shop dashboard, and admin dashboard (built on TailAdmin). |
| `mobile/`  | Flutter app with BLoC state management and a 3-layer feature-based architecture.                              |
| `backend/` | NestJS + TypeScript REST API with JWT authentication, role-based access control, and MongoDB persistence.     |
| `docs/`    | System analysis document (SAD), use-case diagram, and ERD.                                                    |

The authoritative functional and architectural baseline lives in [`web/docs/sad.md`](web/docs/sad.md).

## The Team (GoF - Gang of Four)

|            | Haidara Mahfoud                                                                      | Ahmad Alharbi                                                                                       | Karam Nassr                                                                                         | Abdullah Nahry                                                                            |
| ---------- | ------------------------------------------------------------------------------------ |:---------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------------------:| ----------------------------------------------------------------------------------------- |
| **Title**  | The Arbiter                                                                          | The Illusionist                                                                                     | The Artificer                                                                                       | The Alchemist                                                                             |
| **Role**   | Back-End — NestJS                                                                    | Team Leader & Front-End Web                                                                         | Mobile / Flutter & Idea Originator                                                                  | Back-End — NestJS                                                                         |
| **Duties** | The final authority governing API rules, validation, security, and system integrity. | Shapes the visual experience, interface craft, and overall vision that users see and interact with. | The inventive craftsman who sparked the concept and engineers the cross-platform mobile experience. | Transforms raw data, business logic, and complex inputs into clean, high-value responses. |