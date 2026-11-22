/*
Pseudocode:
Objective: persist the backend JWT and cached identity, and resolve the browser API base URL.
Input: values written by login/register actions and the current runtime environment.
Process: read/write namespaced localStorage keys with SSR guards; build an absolute
/suffixed API base URL so the shared createApiClient can resolve relative paths.
Output: token/user accessors, a session clear helper, demo credentials, and the API base URL.
*/
import type { LoginBody, UserRoleDto } from "./types";

const TOKEN_KEY = "instamall.auth.token";
const USER_KEY = "instamall.auth.user";

export interface CachedUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRoleDto;
  phone?: string;
  nationalId?: string;
  createdAt: string;
}

const readStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be disabled; the in-memory store still works for this session.
  }
};

const removeStorage = (key: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
};

export const getStoredToken = (): string | null => readStorage(TOKEN_KEY);

export const setStoredToken = (token: string): void =>
  writeStorage(TOKEN_KEY, token);

export const getStoredUser = (): CachedUser | null => {
  const raw = readStorage(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedUser;
  } catch {
    removeStorage(USER_KEY);
    return null;
  }
};

export const setStoredUser = (user: CachedUser): void =>
  writeStorage(USER_KEY, JSON.stringify(user));

export const clearSession = (): void => {
  removeStorage(TOKEN_KEY);
  removeStorage(USER_KEY);
};

export const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return `${window.location.origin.replace(/\/+$/, "")}/api`;
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3001"
  ).replace(/\/+$/, "");

  return `${siteUrl}/api`;
};

export const DEMO_ACCOUNTS: Record<UserRoleDto, LoginBody> = {
  admin: { email: "admin@instamall.local", password: "Admin12345!" },
  user: { email: "buyer@instamall.local", password: "Buyer12345!" },
  shop: { email: "shop@instamall.local", password: "Shop12345!" },
};
