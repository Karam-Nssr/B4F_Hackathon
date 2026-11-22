/*
Pseudocode:
Objective: expose one browser-side adapter for every InstaMall backend endpoint.
Input: endpoint DTOs, the persisted JWT, and optional abort signals from React effects.
Process: build the shared API client with bearer-token injection, use createCollectionAdapter
for list endpoints, and map DTOs into UI models before returning them to the store.
Output: typed auth, catalog, order, shop, and admin operations plus a readable error parser.
*/
import createApiClient, { type ApiError } from "@/lib/api/client";
import createCollectionAdapter from "@/lib/api/collection-adapter";
import type {
  AdminStats,
  AdminUser,
  MasterOrder,
  Product,
  Shop,
  ShopSubOrder,
} from "@/types/instamall";
import {
  mapAdminStats,
  mapAdminUser,
  mapAuthUser,
  mapMasterOrder,
  mapProduct,
  mapShop,
  mapShopOverview,
  mapShopSubOrder,
  deriveOrderNumber,
} from "./mappers";
import { getApiBaseUrl, getStoredToken } from "./session";
import type {
  AdminStatsDto,
  AdminUserDto,
  AuthResponseDto,
  AuthUserDto,
  CreateProductBody,
  LoginBody,
  MasterOrderDto,
  OrderStatusDto,
  ProductDto,
  RegisterBody,
  ShopDto,
  ShopOverviewDto,
  ShopSubOrderDto,
  UpdateProductBody,
  UpdateProfileBody,
} from "./types";

export * from "./types";
export {
  clearSession,
  DEMO_ACCOUNTS,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "./session";
export {
  getRemainingHours,
  mapMasterOrder as toMasterOrder,
  mapProduct,
  mapShop,
  mapShopSubOrder,
} from "./mappers";

const client = createApiClient({
  baseUrl: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  onRequest: (request) => {
    const token = getStoredToken();
    if (!token) return request;

    const headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return new Request(request, { headers });
  },
});

export const getApiErrorMessage = (error: unknown): string => {
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "body" in error
  ) {
    const { status, body } = error as ApiError;
    try {
      const parsed = JSON.parse(body) as { message?: string | string[] };
      if (Array.isArray(parsed.message) && parsed.message.length > 0) {
        return parsed.message.join("، ");
      }
      if (typeof parsed.message === "string") return parsed.message;
    } catch {
      // Fall back to the raw body below.
    }
    if (status === 401) return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
    if (status === 403) return "غير مسموح لك بتنفيذ هذا الإجراء";
    return body || `تعذر إكمال الطلب (${status})`;
  }

  return error instanceof Error ? error.message : "حدث خطأ غير متوقع";
};

let productShopNames = new Map<string, string>();

const shopsAdapter = createCollectionAdapter<ShopDto, Shop>({
  list: (signal) => client.get<ShopDto[]>("/shops", { signal }),
  toModel: (dto) => mapShop(dto),
});

const productsAdapter = createCollectionAdapter<ProductDto, Product>({
  list: async (signal) => {
    const [products, shops] = await Promise.all([
      client.get<ProductDto[]>("/products", { signal }),
      client.get<ShopDto[]>("/shops", { signal }),
    ]);
    productShopNames = new Map(shops.map((shop) => [shop._id, shop.shopName]));
    return products;
  },
  toModel: (dto) => mapProduct(dto, productShopNames.get(dto.shopId) ?? "متجر"),
});

const shopProductsAdapter = createCollectionAdapter<ProductDto, Product>({
  list: async (signal) => {
    const [products, shops] = await Promise.all([
      client.get<ProductDto[]>("/shop/products", { signal }),
      client.get<ShopDto[]>("/shops", { signal }),
    ]);
    productShopNames = new Map(shops.map((shop) => [shop._id, shop.shopName]));
    return products;
  },
  toModel: (dto) => mapProduct(dto, productShopNames.get(dto.shopId) ?? "متجرك"),
});

const myOrdersAdapter = createCollectionAdapter<MasterOrderDto, MasterOrder>({
  list: (signal) => client.get<MasterOrderDto[]>("/orders/my", { signal }),
  toModel: mapMasterOrder,
});

const shopOrdersAdapter = createCollectionAdapter<
  ShopSubOrderDto,
  ShopSubOrder
>({
  list: (signal) => client.get<ShopSubOrderDto[]>("/shop/orders", { signal }),
  toModel: (dto) => {
    const masterId =
      typeof dto.masterOrderId === "string" ? dto.masterOrderId : "";
    return mapShopSubOrder(dto, deriveOrderNumber(masterId || dto._id));
  },
});

const adminShopsAdapter = createCollectionAdapter<ShopDto, Shop>({
  list: (signal) => client.get<ShopDto[]>("/admin/shops", { signal }),
  toModel: (dto) => mapShop(dto),
});

const adminUsersAdapter = createCollectionAdapter<AdminUserDto, AdminUser>({
  list: (signal) => client.get<AdminUserDto[]>("/admin/users", { signal }),
  toModel: mapAdminUser,
});

export const login = (body: LoginBody): Promise<AuthResponseDto> =>
  client.post<AuthResponseDto, LoginBody>("/auth/login", body);

export const register = (body: RegisterBody): Promise<AuthResponseDto> =>
  client.post<AuthResponseDto, RegisterBody>("/auth/register", body);

export const getMe = (): Promise<AuthUserDto> =>
  client.get<AuthUserDto>("/users/me");

export const updateMe = (
  body: UpdateProfileBody,
): Promise<AuthUserDto> =>
  client.patch<AuthUserDto, UpdateProfileBody>("/users/me", body);

export const listShops = (signal?: AbortSignal): Promise<Shop[]> =>
  shopsAdapter.list(signal);

export const listProducts = (signal?: AbortSignal): Promise<Product[]> =>
  productsAdapter.list(signal);

export const listShopProducts = (signal?: AbortSignal): Promise<Product[]> =>
  shopProductsAdapter.list(signal);

export const createProduct = (
  body: CreateProductBody,
): Promise<ProductDto> =>
  client.post<ProductDto, CreateProductBody>("/shop/products", body);

export const updateProduct = (
  id: string,
  body: UpdateProductBody,
): Promise<ProductDto> =>
  client.patch<ProductDto, UpdateProductBody>(`/shop/products/${id}`, body);

export const deleteProduct = (id: string): Promise<void> =>
  client.delete<void>(`/shop/products/${id}`);

export const createOrder = (
  items: Array<{ productId: string; quantity: number }>,
): Promise<MasterOrderDto> =>
  client.post<MasterOrderDto, { items: Array<{ productId: string; quantity: number }> }>(
    "/orders",
    { items },
  );

export const listMyOrders = (signal?: AbortSignal): Promise<MasterOrder[]> =>
  myOrdersAdapter.list(signal);

export const listShopOrders = (signal?: AbortSignal): Promise<ShopSubOrder[]> =>
  shopOrdersAdapter.list(signal);

export const updateSubOrderStatus = (
  id: string,
  status: OrderStatusDto,
): Promise<ShopSubOrderDto> =>
  client.patch<ShopSubOrderDto, { status: OrderStatusDto }>(
    `/shop/orders/${id}/status`,
    { status },
  );

export const getShopOverview = (
  signal?: AbortSignal,
): Promise<ShopOverviewDto> =>
  client.get<ShopOverviewDto>("/shop/overview", { signal });

export const getAdminStats = (signal?: AbortSignal): Promise<AdminStats> =>
  client
    .get<AdminStatsDto>("/admin/stats", { signal })
    .then(mapAdminStats);

export const listAdminShops = (signal?: AbortSignal): Promise<Shop[]> =>
  adminShopsAdapter.list(signal);

export const listAdminUsers = (signal?: AbortSignal): Promise<AdminUser[]> =>
  adminUsersAdapter.list(signal);

export const mapCreatedProduct = (dto: ProductDto): Product =>
  mapProduct(dto, productShopNames.get(dto.shopId) ?? "متجرك");

export const toUserProfile = mapAuthUser;

export const toShopOverview = mapShopOverview;
