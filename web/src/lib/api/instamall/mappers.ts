/*
Pseudocode:
Objective: convert raw NestJS DTOs into the UI domain models used by all portals.
Input: backend DTOs plus optional context (shop names, master order numbers, identity).
Process: rename _id fields, populate display-only values the backend does not expose,
and derive remaining confirmation hours from createdAt + confirmationWindowHours.
Output: stable UI models; missing backend fields stay undefined so pages render "—".
*/
import type {
  AdminStats,
  AdminUser,
  MasterOrder,
  Product,
  Shop,
  ShopOverview,
  ShopSubOrder,
  UserProfile,
} from "@/types/instamall";
import type {
  AdminStatsDto,
  AdminUserDto,
  AuthUserDto,
  MasterOrderDto,
  PopulatedMasterOrderDto,
  PopulatedShopDto,
  ProductDto,
  ShopDto,
  ShopOverviewDto,
  ShopSubOrderDto,
} from "./types";

const AVATAR_BACKGROUNDS = [
  "bg-rose-100 dark:bg-rose-950",
  "bg-sky-100 dark:bg-sky-950",
  "bg-emerald-100 dark:bg-emerald-950",
  "bg-amber-100 dark:bg-amber-950",
];

const deriveAvatar = (seed: string): { avatarChar: string; avatarBg: string } => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return {
    avatarChar: seed.trim().charAt(0) || "م",
    avatarBg: AVATAR_BACKGROUNDS[hash % AVATAR_BACKGROUNDS.length],
  };
};

export const deriveOrderNumber = (id: string): string => {
  const suffix =
    id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "000000";
  return `MO-${suffix}`;
};

export const getRemainingHours = (
  createdAt: string,
  windowHours: number,
): number => {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return windowHours;
  const elapsedHours = (Date.now() - created) / 3_600_000;
  return Math.max(0, Math.round(windowHours - elapsedHours));
};

export const mapAuthUser = (dto: AuthUserDto): UserProfile => ({
  id: dto.id,
  fullName: dto.fullName,
  email: dto.email,
  role: dto.role,
  phone: dto.phone,
  nationalId: dto.nationalId,
  createdAt: dto.createdAt,
});

export const mapShop = (dto: ShopDto, productCount?: number): Shop => ({
  id: dto._id,
  ownerId: dto.ownerId ?? "",
  shopName: dto.shopName,
  category: dto.category,
  description: dto.description ?? "",
  ...deriveAvatar(dto.shopName || dto._id),
  productCount,
  isActive: dto.isActive ?? true,
  createdAt: dto.createdAt,
});

export const mapProduct = (dto: ProductDto, shopName: string): Product => ({
  id: dto._id,
  shopId: dto.shopId,
  shopName,
  title: dto.title,
  category: dto.category,
  description: dto.description,
  priceSyp: dto.priceSyp,
  imageUrl: dto.imageUrl,
  isActive: dto.isActive,
});

const resolveMasterOrderId = (
  value: string | PopulatedMasterOrderDto,
): string => (typeof value === "string" ? value : (value?._id ?? ""));

const resolveShop = (
  value: string | PopulatedShopDto,
): { id: string; name?: string } => {
  if (typeof value === "string") return { id: value };
  return { id: value?._id ?? "", name: value?.shopName };
};

export const mapShopSubOrder = (
  dto: ShopSubOrderDto,
  masterOrderNumber: string,
  fallbackShopName = "متجرك",
): ShopSubOrder => {
  const shop = resolveShop(dto.shopId);

  return {
    id: dto._id,
    masterOrderId: resolveMasterOrderId(dto.masterOrderId),
    masterOrderNumber,
    shopId: shop.id,
    shopName: shop.name || fallbackShopName,
    shopCity: "",
    invoiceNumber: dto.invoiceNumber,
    items: dto.items.map((item) => ({
      title: item.productTitle,
      unitPriceSyp: item.unitPriceSyp,
      quantity: item.quantity,
    })),
    subtotalSyp: dto.subtotalSyp,
    customerName: dto.customerName,
    customerPhone: dto.customerPhone,
    customerNationalId: dto.customerNationalId,
    status: dto.status,
    confirmationWindowHours: dto.confirmationWindowHours,
    remainingHours: getRemainingHours(
      dto.createdAt,
      dto.confirmationWindowHours,
    ),
    createdAt: dto.createdAt,
  };
};

export const mapMasterOrder = (dto: MasterOrderDto): MasterOrder => {
  const orderNumber = deriveOrderNumber(dto._id);
  const subOrders = (dto.shopSubOrders ?? []).map((subOrder) =>
    mapShopSubOrder(subOrder, orderNumber),
  );

  return {
    id: dto._id,
    orderNumber,
    userId: dto.userId,
    customerName: subOrders[0]?.customerName ?? "",
    customerPhone: dto.customerPhone,
    customerNationalId: dto.customerNationalId,
    totalAmountSyp: dto.totalAmountSyp,
    createdAt: dto.createdAt,
    subOrders,
    confirmationWindowHours: subOrders[0]?.confirmationWindowHours ?? 24,
  };
};

export const mapAdminUser = (dto: AdminUserDto): AdminUser => ({
  id: dto._id,
  fullName: dto.fullName,
  email: dto.email,
  role: dto.role,
  createdAt: dto.createdAt,
});

export const mapAdminStats = (dto: AdminStatsDto): AdminStats => ({
  totalUsers: dto.totalUsers,
  totalShops: dto.totalShops,
  activeShops: dto.activeShops,
});

export const mapShopOverview = (dto: ShopOverviewDto): ShopOverview => ({
  totalProducts: dto.totalProducts,
  totalOrders: dto.totalOrders,
  pendingOrders: dto.pendingOrders,
  completedOrders: dto.completedOrders,
  totalSalesSyp: dto.totalSalesSyp,
});
