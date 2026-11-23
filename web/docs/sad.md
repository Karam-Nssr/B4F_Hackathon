# System Analysis Document (SAD)
**Project:** InstaMall — Multi-Vendor Syrian Marketplace[cite: 1]  
**Document Version:** 1.2 (Updated Draft)  
**Author:** Abdallah Mohammed Nahry  
**Date:** 22/11/2026  
**Status:** For Review  
**Reviewers:** Product Owner, Lead Architect, QA Lead  
**Related Docs:** PRD-001 (Product Requirements), UI-001 (Wireframes)

---

## 1. Introduction

### 1.1 Purpose
Describe the functional scope, architectural blueprint, data models, and operational constraints for **InstaMall**—a localized multi-vendor marketplace tailored for the Syrian market—so that design, development, and testing proceed from a single agreed baseline[cite: 1].

### 1.2 Scope (MoSCoW Prioritization)
* **Must Have (v1 Core):**
  * **3-Role RBAC System:** Dedicated authentication (Sign In / Sign Up) and interfaces for **User (Customer)**, **Shop (Vendor)**, and **Admin** across Web and Mobile.
  * **One-Time Client Identity Registration:** Users provide their **Phone Number** and **National ID Number** once during Sign Up (and can update them in Profile), and both are automatically attached to every placed order and generated invoice without re-entering them at checkout.
  * **Unified Marketplace & Split-Order Engine:** Customers browse products across independent small shops (clothing, gifts, accessories, home goods, decor), add items from multiple shops into a **unified cart**, and place a single checkout order that automatically splits into independent **sub-orders per shop**[cite: 1].
  * **Shop Confirmation Window (1 to 24 Hours):** Each shop has a realistic confirmation window between **1 hour and 24 hours** to review and confirm whether it can fulfill its sub-order.
  * **Syrian Market Localization:** Full Arabic **RTL (Right-to-Left)** support and pricing/calculations strictly in **Syrian Pounds (SYP)**[cite: 1].
  * **User Portal (Web & Mobile):** Home page, Shops browsing, User Orders & invoices, and Profile management.
  * **Shop Dashboard (Web):** Overview metrics, minimal CRUD CMS for managing products, and Shop Orders management (viewing client contact/national ID details on the invoice and confirming/updating sub-orders within the 1–24 hour window).
  * **Admin Dashboard (Web):** Lightweight dashboard displaying user and shop statistics and summary lists.
* **Should Have (v1.1):**
  * Basic search and category/price filtering on Home and Shops pages.
  * Shop account activation/suspension toggle by Admin.
* **Could Have (v2):**
  * Product variants (sizes/colors) and stock counters.
  * Exportable/printable invoice views.
* **Won't Have (Explicitly Out of Scope for v1):**
  * **No Payment System:** Zero integration with electronic payment gateways or online checkout transactions[cite: 1].
  * **No Delivery Module:** No courier dispatch, delivery tracking, or shipping rate calculators[cite: 1].
  * Wishlists, product ratings/reviews, or real-time in-app messaging.

### 1.3 Definitions
* **Marketplace:** A multi-vendor platform aggregating independent small shops under a unified storefront without holding platform-owned inventory[cite: 1].
* **Master Order:** The single order submitted by a User containing items from one or more Shops.
* **Sub-Order (Shop Order):** An automatically split portion of a Master Order routed to a single Shop, carrying an invoice with the buyer's Phone Number and National ID.
* **Confirmation Window (1–24 Hours):** The target timeframe within which a Shop reviews and confirms whether it can handle and fulfill a sub-order.
* **SYP:** Syrian Pound, the sole currency used across product listings, carts, and invoices[cite: 1].
* **RTL:** Right-to-Left layout direction for native Arabic support[cite: 1].

### 1.4 Intended Audience
Product owner, mobile/web/backend developers, UI/UX designers, QA engineers, and platform administrators.

---

## 2. System Overview

### 2.1 Business Problem
Small independent merchants in Syria (selling clothing, gifts, accessories, home goods, and decor) struggle to reach buyers through scattered social media posts, while building full-scale platforms with online payment and delivery integrations is impractical for v1[cite: 1]. **InstaMall** provides a SHEIN-inspired Arabic RTL marketplace experience with a unified cart, automatic order splitting per shop, one-time buyer identity capture (Phone + National ID), and SYP pricing—while keeping payment and delivery offline between shop and buyer[cite: 1].

### 2.2 Goals & Objectives
| ID | Objective | Measure |
| :--- | :--- | :--- |
| **G-1** | Smooth multi-shop ordering | User can browse, add items from multiple shops, and submit an order without re-entering Phone or National ID. |
| **G-2** | Accurate order splitting | Every multi-shop order automatically splits into separate Shop Sub-Orders with attached buyer invoices[cite: 1]. |
| **G-3** | Practical shop confirmation window | Shops review and confirm order fulfillment capacity within **1 to 24 hours** of order placement. |
| **G-4** | Native Syrian localization | Interfaces support Arabic RTL and display prices in Syrian Pounds (SYP)[cite: 1]. |

### 2.3 Stakeholders
* **Customer (User):** Browses products and shops in RTL with SYP prices, uses a unified cart, and tracks orders/invoices using credentials saved at registration[cite: 1].
* **Merchant (Shop):** Uses the web dashboard to manage products via minimal CRUD CMS, view incoming sub-orders with buyer Phone & National ID on the invoice, and confirm orders within 1–24 hours.
* **Platform Administrator (Admin):** Monitors high-level platform statistics (users, shops, orders) via the web dashboard.

### 2.4 Success Criteria
* All **Must Have** Functional Requirements (`FR-01` through `FR-12`) pass acceptance tests.
* Registration captures Phone Number and National ID once and automatically attaches them to every subsequent order invoice.
* Multi-shop orders reliably split into per-shop sub-orders, and shops can confirm/manage them within the **1–24 hour** window.
* Web (Next.js 16 + TailAdmin) and Mobile (Flutter + BLoC) clients render RTL layouts and SYP prices cleanly.

---

## 3. Functional Requirements

### 3.1 User Roles
| Role | Capabilities |
| :--- | :--- |
| **Guest** | View home/catalogue and shops, register (`user` or `shop`), sign in. |
| **User (Customer)** | Sign up (providing Phone & National ID once) / sign in, browse Home & Shops, use unified cart, place orders (auto-attaching Phone & National ID to invoices), view User Orders, manage Profile. |
| **Shop (Vendor)** | Sign up / sign in to Web Shop Dashboard, view overview stats, manage products (minimal CRUD CMS), view Shop Orders with client Phone & National ID on invoice, confirm/update orders within 1–24 hours. |
| **Admin** | Sign up / sign in to Web Admin Dashboard, view platform statistics on users and shops and summary lists. |

### 3.2 Use Cases
| ID | Use Case | Actor | Precondition | Main Flow | Postcondition |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Register with Identity Details | Guest | Email/phone not already registered | User selects role (`user` or `shop`), enters credentials, and (for `user`) enters **Phone Number** and **National ID** once. | Account created with saved Phone & National ID; JWT returned. |
| **UC-02** | Place Multi-Shop Order | User | Authenticated `User`; cart has items | User places order from unified cart; system automatically attaches saved Phone & National ID to generated invoices. | Master order created and split into sub-orders per shop; cart cleared. |
| **UC-03** | Confirm Sub-Order (1–24h Window) | Shop | Authenticated `Shop`; pending sub-order exists | Shop inspects sub-order invoice (items, SYP total, client Phone & National ID) and confirms ability to handle within 1–24 hours. | Sub-order status updates to `CONFIRMED` for buyer visibility. |
| **UC-04** | Manage Shop Products (CRUD) | Shop | Authenticated `Shop` | Shop creates, lists, edits, or deletes products with SYP prices in the CMS. | Product catalog reflects changes for buyers. |
| **UC-05** | View Admin Stats | Admin | Authenticated `Admin` | Admin opens Admin Dashboard. | System displays user and shop counts and summary records. |

### 3.3 Functional Requirements (MoSCoW)
| ID | Requirement | Priority | Source |
| :--- | :--- | :--- | :--- |
| **FR-01** | System shall support Sign Up and Sign In across three roles: `user`, `shop`, and `admin`. | **Must** | UC-01 |
| **FR-02** | System shall capture the user's **Phone Number** and **National ID** once during registration (and allow editing in Profile), automatically attaching them to every order and invoice without re-entry at checkout. | **Must** | UC-01, UC-02 |
| **FR-03** | System shall provide a User marketplace experience (Home page, Shops browsing, User Orders, and Profile) in Arabic RTL with prices in SYP[cite: 1]. | **Must** | Marketplace |
| **FR-04** | System shall support a unified cart across multiple shops and automatically split a placed order into separate **Shop Sub-Orders** with attached client invoices[cite: 1]. | **Must** | UC-02 |
| **FR-05** | System shall support a **1 to 24 hour** order confirmation window where a shop reviews and confirms whether it can handle each incoming sub-order. | **Must** | UC-03 |
| **FR-06** | System shall provide a **Shop Dashboard** featuring an overview section, a minimal standard **CRUD CMS** for managing products, and a **Shop Orders** page showing client details (Phone Number and National ID) on the invoice. | **Must** | UC-03, UC-04 |
| **FR-07** | System shall provide an **Admin Dashboard** displaying key statistics for users and shops along with summary lists. | **Must** | UC-05 |
| **FR-08** | System should allow Users to update their saved Phone Number and National ID from their Profile page, applying to future orders. | **Should** | UC-02 |
| **FR-09** | System could allow Admins to toggle shop active status (`is_active`). | **Could** | Governance |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
| :--- | :--- | :--- |
| **NFR-01** | **Localization & RTL** | Web and mobile interfaces must support Arabic RTL layout direction and display monetary amounts in Syrian Pounds (SYP)[cite: 1]. |
| **NFR-02** | **Security & Privacy** | Passwords must be hashed with `bcrypt`; API endpoints must enforce JWT authentication and role-based access control (`user`, `shop`, `admin`), restricting buyer Phone Number and National ID visibility to the owning user and the fulfilling shop(s). |

---

## 5. System Architecture

### 5.1 Architecture Style
**Multi-Client REST Architecture over a Shared Backend:**
* **Mobile App:** Built with **Flutter** and **BLoC** state management following a **3-layer feature-based architecture** (Presentation Layer, Domain Layer, Data Layer per feature).
* **Web App:** Built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**, using the **TailAdmin Next.js boilerplate** for structured dashboard views.
* **Backend API:** Built with **NestJS** and **TypeScript**, using **JWT**, **bcrypt**, and **MongoDB** for persistent storage.

### 5.2 Component Diagram
```text
+-------------------------------+       +-----------------------------------+
|      Mobile App (Flutter)     |       |        Web App (Next.js 16)       |
|  BLoC State Management        |       |  React 19 + Tailwind CSS v4       |
|  3-Layer Feature Architecture |       |  TailAdmin Next.js Boilerplate    |
+---------------+---------------+       +-----------------+-----------------+
                |                                         |
                +--------------------+--------------------+
                                     | HTTPS / JSON (REST + JWT)
                                     v
             +-----------------------------------------------+
             |             NestJS API (TypeScript)             |
             |  Auth (JWT + bcrypt) | RBAC Guards | Modules  |
             |  Users | Shops | Products | Orders & Invoices |
             +-----------------------+-----------------------+
                                     | Mongoose / MongoDB Driver
                                     v
             +-----------------------------------------------+
             |                   MongoDB                     |
             |  users | shops | products | master_orders     |
             |  shop_sub_orders                              |
             +-----------------------------------------------+
```

### 5.3 Tech Stack
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Mobile Client** | Flutter + BLoC (3-layer feature-based architecture) | Predictable reactive state management with clean separation of UI, business logic, and data sources per feature. |
| **Web Client** | Next.js 16 + React 19 + Tailwind CSS v4 + TailAdmin Next.js boilerplate | Modern React/Next.js routing with ready-made dashboard layout components and utility-first v4 styling. |
| **Backend** | NestJS + TypeScript | Modular, strongly typed Node.js framework suited for role-based APIs and domain services. |
| **Auth & Security** | JWT + bcrypt | Token-based stateless sessions with role claims and secure password hashing. |
| **Database** | MongoDB | Flexible document store for users, shops, products, split sub-orders, and invoice snapshots. |

### 5.4 Backend Layering (NestJS)
* **Controllers & Guards:** Handle HTTP requests, validate payloads, verify JWT tokens, and enforce role guards (`user`, `shop`, `admin`).
* **Services:** Implement authentication, profile identity storage, product CRUD, unified cart order-splitting, invoice generation with buyer Phone & National ID, and 1–24 hour shop confirmation status transitions.
* **Schemas / Repositories:** Define MongoDB/Mongoose models and database queries.

---

## 6. Data Model

### 6.1 Collections & Relationships
* **`users`:** Stores `fullName`, `email`, `passwordHash`, `role` (`user` | `shop` | `admin`), `phone` (captured once at registration for users), and `nationalId` (captured once at registration for users).
* **`shops`:** Linked to a `shop` user (`ownerId`); stores `shopName`, `category`, `description`, `isActive`.
* **`products`:** Linked to a `shopId`; stores `title`, `description`, `category`, `priceSyp`, `imageUrl`, `isActive`.
* **`master_orders`:** Linked to `userId`; stores `totalAmountSyp`, auto-attached `customerPhone`, auto-attached `customerNationalId`, `createdAt`.
* **`shop_sub_orders`:** Linked to `masterOrderId` and `shopId`; stores `invoiceNumber`, `items[]` (product title, unit price in SYP, quantity), `subtotalSyp`, auto-attached `customerName`, `customerPhone`, `customerNationalId`, `status` (`PENDING` | `CONFIRMED` | `COMPLETED` | `CANCELLED`), `confirmationWindowHours` (`24`h target window, confirmed within `1–24` hours), and `createdAt`.

### 6.2 Validation Rules
* **Registration Identity Fields:** `phone` and `nationalId` are collected during user sign-up and automatically populated onto every order and invoice.
* **SYP Prices:** `priceSyp`, `subtotalSyp`, and `totalAmountSyp` must be positive numbers expressed in Syrian Pounds.
* **Sub-Order Confirmation:** Shops confirm sub-orders within the **1 to 24 hour** window after order creation.

---

## 7. API Specification

| Method | Path | Purpose | Auth / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register account (`role`, credentials, and `phone` + `nationalId` for users) | Public |
| `POST` | `/api/auth/login` | Sign in and receive JWT token | Public |
| `GET` | `/api/products` | Browse/filter marketplace products in SYP | Public / User |
| `GET` | `/api/shops` | Browse available shops | Public / User |
| `GET` | `/api/users/me` & `PATCH /api/users/me` | View/update user profile (including saved Phone & National ID) | User |
| `POST` | `/api/orders` | Create order from unified cart, splitting into shop sub-orders and auto-attaching saved Phone & National ID to invoices | User |
| `GET` | `/api/orders/my` | List user's orders, sub-orders, and invoices | User |
| `GET` | `/api/shop/overview` | Get shop dashboard summary metrics | Shop |
| `GET`, `POST`, `PATCH`, `DELETE` | `/api/shop/products` (`/:id`) | Minimal CRUD CMS for shop products | Shop |
| `GET` | `/api/shop/orders` | List shop sub-orders with invoice details (client Phone & National ID) | Shop |
| `PATCH` | `/api/shop/orders/:id/status` | Confirm or update sub-order status (within 1–24 hour confirmation window) | Shop |
| `GET` | `/api/admin/stats` | Get platform stats for users and shops | Admin |
| `GET` | `/api/admin/users` & `GET /api/admin/shops` | View user and shop summary lists | Admin |

---

## 8. UI / UX Requirements

| Role / Platform | Screen / Section | Contents & Behavior |
| :--- | :--- | :--- |
| **Auth (Web & Mobile)** | Sign In / Sign Up | Role selection (`user`, `shop`, `admin`); User Sign Up captures **Phone Number** and **National ID** once so checkout stays streamlined. |
| **User (Web & Mobile)** | Home Page | RTL product feed with SYP pricing, category sections, and quick add-to-cart[cite: 1]. |
| **User (Web & Mobile)** | Shops Browsing | Directory of independent shops and their product listings[cite: 1]. |
| **User (Web & Mobile)** | Unified Cart & Checkout | Combines items from multiple shops; order confirmation splits sub-orders per shop and attaches the user's saved Phone & National ID to each invoice without re-asking for them[cite: 1]. |
| **User (Web & Mobile)** | User Orders & Profile | View order history, invoices, and shop confirmation status (1–24h window); manage Profile details. |
| **Shop (Web — TailAdmin)** | Overview, Product CMS & Orders | Overview KPIs; minimal CRUD table/forms for products; Shop Orders view displaying client Phone & National ID on the invoice and status confirmation actions (1–24h window). |
| **Admin (Web — TailAdmin)** | Admin Dashboard | Stat cards and summary tables for users and shops. |

---

## 9. Security & Privacy

* Passwords are hashed using `bcrypt` before saving to MongoDB.
* Endpoints are protected with JWT authentication and role guards so `user`, `shop`, and `admin` routes remain isolated.
* Each user's **Phone Number** and **National ID** are stored on the user record, attached to generated order invoices, and visible only to that user and the shop(s) fulfilling the sub-order.

---

## 10. Deployment & Infrastructure

* **Mobile App:** Built and distributed from the Flutter codebase (Android/iOS) connected to the NestJS REST API.
* **Web App:** Next.js 16 application built with React 19 and Tailwind CSS v4 (TailAdmin boilerplate).
* **Backend & Database:** NestJS TypeScript service connected to a MongoDB instance with environment-configured secrets.

---

## 11. Testing Strategy

* **Mobile Unit & BLoC Tests:** Verify BLoC states/events across feature layers (Auth, Marketplace, Cart, Orders).
* **Backend Integration Tests:** Verify 3-role auth, one-time identity attachment on invoices, multi-shop sub-order splitting, CRUD product operations, and sub-order status updates.
* **UI & RTL Verification:** Verify Arabic RTL layout alignment and SYP currency display across Next.js web and Flutter mobile screens[cite: 1].

---

## 12. Assumptions, Constraints & Risks

### 12.1 Assumptions
* Users provide accurate Phone Number and National ID details during sign-up, which are automatically attached to every order invoice.
* Shops need **1 to 24 hours** to review incoming sub-orders and confirm whether they can fulfill them.
* Payment and delivery occur offline directly between the shop and the customer (no payment gateway or delivery module in v1)[cite: 1].

### 12.2 Constraints
* Strictly scoped to core features for `user`, `shop`, and `admin` roles in Arabic RTL with SYP pricing[cite: 1].
* Built using Flutter + BLoC (3-layer feature architecture), Next.js 16 + React 19 + Tailwind CSS v4 + TailAdmin, and NestJS + TypeScript + JWT + bcrypt + MongoDB.

### 12.3 Risks & Mitigations
| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Delayed Shop Response** | Buyers wait too long to know if a shop can fulfill an order. | Set a clear **1 to 24 hour** confirmation expectation for shops on incoming sub-orders. |
| **Stale Identity Info** | A user's phone number changes after registration. | Allow updating Phone Number and National ID in the User Profile for future orders. |

---

## 13. Indicative Timeline

| Phase | Focus | Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | Analysis & Setup | Finalized SAD, MongoDB schemas, NestJS project setup, TailAdmin web setup, and Flutter 3-layer BLoC structure. |
| **Phase 2** | Backend Core | Auth (JWT + bcrypt), 3-role RBAC, one-time Phone/National ID capture, Product CRUD, and Split-Order + Invoice service. |
| **Phase 3** | Web & Mobile UI | RTL User pages (Home, Shops, Orders, Profile), Shop Dashboard (Overview, CRUD CMS, Orders with invoice client details), and Admin Dashboard. |
| **Phase 4** | Testing & Release | End-to-end testing of multi-shop splitting, 1–24h confirmation flow, RTL layout, and SYP display. |

---

## 14. Appendices
* **Appendix A — Glossary:** See Section 1.3.
* **Appendix B — Order & Confirmation Flow:** Sign Up (save Phone & National ID once) $\rightarrow$ Unified Cart Checkout $\rightarrow$ Auto-Split into Shop Sub-Orders + Invoices (with Phone & National ID) $\rightarrow$ Shop Confirms within **1–24 hours**.
* **Appendix C — Change Log:** `v1.2 (22/11/2026)` — Updated identity capture to one-time registration, set shop confirmation window to 1–24 hours, removed NFR-03 and NFR-04, and updated tech stack to Flutter + BLoC, Next.js 16 + React 19 + Tailwind CSS v4 + TailAdmin, and NestJS + MongoDB.