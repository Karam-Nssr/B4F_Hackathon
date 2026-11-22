/*
Pseudocode:
Objective: centralize InstaMall reactive state and route every mutation through the API adapter.
Input: browser-persisted auth session and actions from the storefront, shop, and admin portals.
Process: hydrate the cached user, load public catalog plus role-scoped data on role changes,
and call the real endpoints for auth, checkout, status changes, and product CRUD. Surface
every backend failure as both inline error state and a toast. Keep cart state local because
the backend has no cart endpoint.
Output: a reactive store whose lists and KPIs come only from the backend, with honest
fallbacks for fields the backend does not expose.
*/
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AdminStats,
  AdminUser,
  CartItem,
  MasterOrder,
  Product,
  Shop,
  ShopOverview,
  ShopSubOrder,
  UserProfile,
} from "@/types/instamall";
import * as api from "@/lib/api/instamall";
import { notifyError } from "@/components/ui/toast";
import type {
  CreateProductBody,
  UpdateProductBody,
  UserRoleDto,
} from "@/lib/api/instamall";

export type StoreRole = UserRoleDto;

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: StoreRole;
  phone?: string;
  nationalId?: string;
}

export interface InstaMallStore {
  cart: CartItem[];
  currentUser: UserProfile | null;
  currentShop: Shop | null;
  masterOrders: MasterOrder[];
  shopSubOrders: ShopSubOrder[];
  products: Product[];
  shops: Shop[];
  adminShops: Shop[];
  adminUsers: AdminUser[];
  adminStats: AdminStats | null;
  shopOverview: ShopOverview | null;
  activeRole: StoreRole;
  cartCount: number;
  isIdentitySet: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  refreshData: () => Promise<void>;
  updateIdentity: (phone: string, nationalId: string) => Promise<void>;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (input: RegisterInput) => Promise<UserProfile>;
  logout: () => void;
  loginAsDemo: (role: StoreRole) => Promise<UserProfile>;
  setActiveRole: (role: string) => void;
  checkout: () => Promise<MasterOrder | null>;
  confirmSubOrder: (id: string) => Promise<void>;
  rejectSubOrder: (id: string) => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const StoreContext = createContext<InstaMallStore | null>(null);

export const useInstaMallStore = (): InstaMallStore => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useInstaMallStore must be used within InstaMallStoreProvider");
  }
  return ctx;
};

interface InstaMallStoreProviderProps {
  children: ReactNode;
}

const makeFallbackShop = (id: string, shopName: string): Shop => ({
  id,
  ownerId: "",
  shopName,
  category: "",
  description: "",
  avatarChar: shopName.trim().charAt(0) || "م",
  avatarBg: "bg-rose-100 dark:bg-rose-950",
  isActive: true,
});

const toCreateProductBody = (product: Omit<Product, "id">): CreateProductBody => ({
  title: product.title,
  description: product.description,
  category: product.category,
  priceSyp: product.priceSyp,
  imageUrl: product.imageUrl,
  isActive: product.isActive,
});

const toUpdateProductBody = (updates: Partial<Product>): UpdateProductBody => {
  const body: UpdateProductBody = {};
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.category !== undefined) body.category = updates.category;
  if (updates.priceSyp !== undefined) body.priceSyp = updates.priceSyp;
  if (updates.imageUrl !== undefined) body.imageUrl = updates.imageUrl;
  if (updates.isActive !== undefined) body.isActive = updates.isActive;
  return body;
};

export const InstaMallStoreProvider = ({ children }: InstaMallStoreProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [adminShops, setAdminShops] = useState<Shop[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [shopOverview, setShopOverview] = useState<ShopOverview | null>(null);
  const [masterOrders, setMasterOrders] = useState<MasterOrder[]>([]);
  const [shopSubOrders, setShopSubOrders] = useState<ShopSubOrder[]>([]);
  const [activeRole, setActiveRoleState] = useState<StoreRole>("user");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reportError = useCallback((caught: unknown) => {
    const message = api.getApiErrorMessage(caught);
    setError(message);
    notifyError(message);
  }, []);

  // Restore the persisted session once on mount so navigation guards work after refresh.
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const cachedUser = api.getStoredUser();
      if (!cachedUser || !api.getStoredToken()) {
        setIsLoading(false);
        return;
      }
      setCurrentUser(api.toUserProfile(cachedUser));
      setActiveRoleState(cachedUser.role);
    });
    return () => {
      active = false;
    };
  }, []);

  // Reload public data and any role-scoped data whenever the identity or role changes.
  useEffect(() => {
    const controller = new AbortController();
    const role = currentUser?.role;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      const tasks: Array<Promise<unknown>> = [
        api.listShops(controller.signal).then(setShops),
      ];

      if (role === "shop") {
        tasks.push(api.listShopProducts(controller.signal).then(setProducts));
        tasks.push(
          api.listShopOrders(controller.signal).then(setShopSubOrders),
        );
        tasks.push(
          api
            .getShopOverview(controller.signal)
            .then((dto) => setShopOverview(api.toShopOverview(dto))),
        );
      } else {
        tasks.push(api.listProducts(controller.signal).then(setProducts));
      }

      if (role === "user") {
        tasks.push(
          api.listMyOrders(controller.signal).then((orders) => {
            setMasterOrders(orders);
            setShopSubOrders(orders.flatMap((order) => order.subOrders));
          }),
        );
      } else {
        setMasterOrders([]);
      }

      if (role === "admin") {
        tasks.push(api.getAdminStats(controller.signal).then(setAdminStats));
        tasks.push(api.listAdminShops(controller.signal).then(setAdminShops));
        tasks.push(api.listAdminUsers(controller.signal).then(setAdminUsers));
      } else {
        setAdminStats(null);
        setAdminShops([]);
        setAdminUsers([]);
      }

      const results = await Promise.allSettled(tasks);
      if (controller.signal.aborted) return;

      const failed = results.find(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      if (failed) reportError(failed.reason);
      setIsLoading(false);
    };

    void load();
    return () => controller.abort();
  }, [currentUser?.id, currentUser?.role, reloadKey, reportError]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isIdentitySet = Boolean(currentUser?.phone && currentUser?.nationalId);

  // Identify the signed-in shop from the products/orders the backend returns for it.
  const currentShop = useMemo<Shop | null>(() => {
    if (currentUser?.role !== "shop") return null;
    const ownedId = products[0]?.shopId ?? shopSubOrders[0]?.shopId;
    if (!ownedId) return null;
    return (
      shops.find((shop) => shop.id === ownedId) ??
      makeFallbackShop(ownedId, products[0]?.shopName ?? "متجرك")
    );
  }, [currentUser?.role, products, shopSubOrders, shops]);

  const clearError = useCallback(() => setError(null), []);

  const refreshData = useCallback(async () => {
    setReloadKey((key) => key + 1);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === item.productId);
      if (exists) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const applyAuth = useCallback((response: api.AuthResponseDto): UserProfile => {
    api.setStoredToken(response.accessToken);
    api.setStoredUser(response.user);
    const profile = api.toUserProfile(response.user);
    setCurrentUser(profile);
    setActiveRoleState(profile.role);
    setError(null);
    return profile;
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<UserProfile> => {
      try {
        return applyAuth(await api.login({ email, password }));
      } catch (caught) {
        reportError(caught);
        throw caught;
      }
    },
    [applyAuth, reportError],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<UserProfile> => {
      try {
        return applyAuth(await api.register(input));
      } catch (caught) {
        reportError(caught);
        throw caught;
      }
    },
    [applyAuth, reportError],
  );

  const loginAsDemo = useCallback(
    async (role: StoreRole): Promise<UserProfile> => {
      const credentials = api.DEMO_ACCOUNTS[role];
      return login(credentials.email, credentials.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    api.clearSession();
    setCurrentUser(null);
    setActiveRoleState("user");
    setMasterOrders([]);
    setShopSubOrders([]);
    setAdminStats(null);
    setAdminShops([]);
    setAdminUsers([]);
    setShopOverview(null);
    setError(null);
  }, []);

  const setActiveRole = useCallback((role: string) => {
    setActiveRoleState(role as StoreRole);
  }, []);

  const updateIdentity = useCallback(
    async (phone: string, nationalId: string) => {
      try {
        if (currentUser?.role === "user") {
          await api.updateMe({ phone, nationalId });
        }
        if (!currentUser) return;
        const updated: UserProfile = { ...currentUser, phone, nationalId };
        api.setStoredUser(updated);
        setCurrentUser(updated);
        setError(null);
      } catch (caught) {
        reportError(caught);
        throw caught;
      }
    },
    [currentUser, reportError],
  );

  const checkout = useCallback(async (): Promise<MasterOrder | null> => {
    if (cart.length === 0) return null;
    try {
      const created = await api.createOrder(
        cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      );
      const orders = await api.listMyOrders();
      setMasterOrders(orders);
      setShopSubOrders(orders.flatMap((order) => order.subOrders));
      clearCart();
      setError(null);
      return (
        orders.find((order) => order.id === created._id) ??
        api.toMasterOrder(created)
      );
    } catch (caught) {
      reportError(caught);
      throw caught;
    }
  }, [cart, clearCart, reportError]);

  const confirmSubOrder = useCallback(async (id: string) => {
    try {
      await api.updateSubOrderStatus(id, "CONFIRMED");
      setShopSubOrders((prev) =>
        prev.map((sub) =>
          sub.id === id
            ? { ...sub, status: "CONFIRMED" as const, remainingHours: 0 }
            : sub,
        ),
      );
      setError(null);
    } catch (caught) {
      reportError(caught);
      throw caught;
    }
  }, [reportError]);

  const rejectSubOrder = useCallback(async (id: string) => {
    try {
      await api.updateSubOrderStatus(id, "CANCELLED");
      setShopSubOrders((prev) =>
        prev.map((sub) =>
          sub.id === id
            ? { ...sub, status: "CANCELLED" as const, remainingHours: 0 }
            : sub,
        ),
      );
      setError(null);
    } catch (caught) {
      reportError(caught);
      throw caught;
    }
  }, [reportError]);

  const addProduct = useCallback(async (product: Omit<Product, "id">) => {
    try {
      const dto = await api.createProduct(toCreateProductBody(product));
      setProducts((prev) => [
        api.mapCreatedProduct(dto),
        ...prev.filter((item) => item.id !== dto._id),
      ]);
      setError(null);
    } catch (caught) {
      reportError(caught);
      throw caught;
    }
  }, [reportError]);

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      try {
        const dto = await api.updateProduct(id, toUpdateProductBody(updates));
        setProducts((prev) =>
          prev.map((item) =>
            item.id === dto._id ? api.mapCreatedProduct(dto) : item,
          ),
        );
        setError(null);
      } catch (caught) {
        reportError(caught);
        throw caught;
      }
    },
    [reportError],
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (caught) {
      reportError(caught);
      throw caught;
    }
  }, [reportError]);

  const value = useMemo<InstaMallStore>(
    () => ({
      cart,
      currentUser,
      currentShop,
      masterOrders,
      shopSubOrders,
      products,
      shops,
      adminShops,
      adminUsers,
      adminStats,
      shopOverview,
      activeRole,
      cartCount,
      isIdentitySet,
      isLoading,
      error,
      clearError,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshData,
      updateIdentity,
      login,
      register,
      logout,
      loginAsDemo,
      setActiveRole,
      checkout,
      confirmSubOrder,
      rejectSubOrder,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [
      cart,
      currentUser,
      currentShop,
      masterOrders,
      shopSubOrders,
      products,
      shops,
      adminShops,
      adminUsers,
      adminStats,
      shopOverview,
      activeRole,
      cartCount,
      isIdentitySet,
      isLoading,
      error,
      clearError,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshData,
      updateIdentity,
      login,
      register,
      logout,
      loginAsDemo,
      setActiveRole,
      checkout,
      confirmSubOrder,
      rejectSubOrder,
      addProduct,
      updateProduct,
      deleteProduct,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
