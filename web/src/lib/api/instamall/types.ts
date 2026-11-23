/*
Pseudocode:
Objective: describe the raw JSON shapes returned by the NestJS backend.
Input: none (pure types mirroring backend DTOs and Mongoose lean documents).
Process: declare each endpoint's response/request shape using backend field names,
including populated references where the backend populates them.
Output: typed DTOs consumed by the InstaMall adapter and its mappers.
*/
export type UserRoleDto = "user" | "shop" | "admin";
export type OrderStatusDto = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface AuthUserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRoleDto;
  phone?: string;
  nationalId?: string;
  createdAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  role: UserRoleDto;
  phone?: string;
  nationalId?: string;
}

export interface UpdateProfileBody {
  fullName?: string;
  phone?: string;
  nationalId?: string;
}

export interface ShopDto {
  _id: string;
  shopName: string;
  category: string;
  description?: string;
  imageUrl?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  ownerId?: string;
}

export interface AdminShopDto extends ShopDto {
  ownerId: string;
}

export interface ProductDto {
  _id: string;
  shopId: string;
  title: string;
  description: string;
  category: string;
  priceSyp: number;
  imageUrl: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ShopOrderItemDto {
  productTitle: string;
  unitPriceSyp: number;
  quantity: number;
}

export interface PopulatedShopDto {
  _id?: string;
  shopName?: string;
  category?: string;
}

export interface PopulatedMasterOrderDto {
  _id?: string;
  createdAt?: string;
}

export interface ShopSubOrderDto {
  _id: string;
  masterOrderId: string | PopulatedMasterOrderDto;
  shopId: string | PopulatedShopDto;
  invoiceNumber: string;
  items: ShopOrderItemDto[];
  subtotalSyp: number;
  customerName: string;
  customerPhone: string;
  customerNationalId: string;
  status: OrderStatusDto;
  confirmationWindowHours: number;
  createdAt: string;
}

export interface MasterOrderDto {
  _id: string;
  userId: string;
  totalAmountSyp: number;
  customerPhone: string;
  customerNationalId: string;
  createdAt: string;
  shopSubOrders?: ShopSubOrderDto[];
}

export interface ShopOverviewDto {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSalesSyp: number;
}

export interface AdminUserDto {
  _id: string;
  fullName: string;
  email: string;
  role: UserRoleDto;
  createdAt: string;
}

export interface AdminStatsDto {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
}

export interface CreateProductBody {
  title: string;
  description: string;
  category: string;
  priceSyp: number;
  imageUrl: string;
  isActive?: boolean;
}

export type UpdateProductBody = Partial<CreateProductBody>;

export interface ProductQuery {
  category?: string;
  search?: string;
  shopId?: string;
  minPriceSyp?: number;
  maxPriceSyp?: number;
}
