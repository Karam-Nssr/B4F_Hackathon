/*
Pseudocode:
Objective: define the InstaMall domain data models used across all portals.
Input: backend DTOs adapted through the InstaMall API adapter.
Process: map the SAD v1.2 entities to TypeScript interfaces/types and mark fields
the backend does not expose as optional so the UI can render an honest fallback.
Output: typed models for users, shops, products, cart, sub-orders, master orders,
and the admin/shop reporting models.
*/
export type UserRole = "user" | "shop" | "admin";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  nationalId?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
}

export interface ShopOverview {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSalesSyp: number;
}

export interface Shop {
  id: string;
  ownerId: string;
  shopName: string;
  category: string;
  description: string;
  avatarChar: string;
  avatarBg: string;
  city?: string;
  productCount?: number;
  responseTimeHours?: number;
  isActive: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  title: string;
  category: string;
  description: string;
  priceSyp: number;
  imageUrl: string;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  shopId: string;
  shopName: string;
  shopCity: string;
  title: string;
  unitPriceSyp: number;
  quantity: number;
  imageUrl: string;
  variantNote?: string;
  shopResponseHours: number;
}

export type SubOrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface SubOrderItem {
  productId?: string;
  title: string;
  unitPriceSyp: number;
  quantity: number;
  imageUrl?: string;
  variantNote?: string;
}

export interface ShopSubOrder {
  id: string;
  masterOrderId: string;
  masterOrderNumber: string;
  shopId: string;
  shopName: string;
  shopCity: string;
  invoiceNumber: string;
  items: SubOrderItem[];
  subtotalSyp: number;
  customerName: string;
  customerPhone: string;
  customerNationalId: string;
  status: SubOrderStatus;
  confirmationWindowHours: number;
  remainingHours: number;
  createdAt: string;
}

export interface MasterOrder {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerNationalId: string;
  totalAmountSyp: number;
  createdAt: string;
  subOrders: ShopSubOrder[];
  confirmationWindowHours: number;
}
