import { APP_ROUTES } from "@/constants/routes";
import { homeCarouselProducts } from "@/mock-data/home-carousel";
import type { HomeCarouselProduct } from "@/types/home-carousel";

export const AUTH_CHANGE_EVENT = "locker-auth-change";
export const COMMERCE_CHANGE_EVENT = "locker-commerce-change";

const AUTH_STORAGE_KEY = "locker.demo.session";
const CART_STORAGE_KEY = "locker.demo.cart";
const BALANCE_STORAGE_KEY = "locker.demo.balance";
const STEAM_STORAGE_KEY = "locker.demo.steam";
const ORDERS_STORAGE_KEY = "locker.demo.orders";

export type DemoSession = {
  email: string;
  signedInAt: string;
};

export type DemoCartItem = {
  addedAt: string;
  productId: string;
  quantity: number;
};

export type DemoPaymentMethod = "card" | "sbp";

export type DemoSteamData = {
  steamId: string;
  tradeUrl: string;
};

export type DemoOrderStatus = "created" | "sent" | "processing" | "completed" | "error";

export type DemoOrder = {
  createdAt: string;
  id: string;
  items: DemoCartItem[];
  products: HomeCarouselProduct[];
  status: DemoOrderStatus;
  steamData?: DemoSteamData;
  totalRub: number;
};

export const DEFAULT_TOP_UP_AMOUNT = 3000;

function isBrowser() {
  return typeof window !== "undefined";
}

function dispatchCommerceChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(COMMERCE_CHANGE_EVENT));
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getAuthSession() {
  return readJson<DemoSession | null>(AUTH_STORAGE_KEY, null);
}

export function hasAuthSession() {
  return Boolean(getAuthSession());
}

export function saveAuthSession(email: string) {
  if (!isBrowser()) {
    return;
  }

  writeJson<DemoSession>(AUTH_STORAGE_KEY, {
    email,
    signedInAt: new Date().toISOString(),
  });
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getSafeReturnTo(fallback: string = APP_ROUTES.profile) {
  if (!isBrowser()) {
    return fallback;
  }

  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("returnTo");

  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return fallback;
  }

  return returnTo;
}

export function getCartItems() {
  return readJson<DemoCartItem[]>(CART_STORAGE_KEY, []);
}

export function getCartProducts(items = getCartItems()) {
  return items
    .map((item) => ({
      item,
      product: homeCarouselProducts.find((product) => product.id === item.productId),
    }))
    .filter((entry): entry is { item: DemoCartItem; product: HomeCarouselProduct } => Boolean(entry.product));
}

export function addCartItem(productId: string) {
  const items = getCartItems();
  const existingItem = items.find((item) => item.productId === productId);

  const nextItems = existingItem
    ? items.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
    : [
        ...items,
        {
          addedAt: new Date().toISOString(),
          productId,
          quantity: 1,
        },
      ];

  writeJson(CART_STORAGE_KEY, nextItems);
  dispatchCommerceChange();
}

export function setCartItemQuantity(productId: string, quantity: number) {
  const nextQuantity = Math.max(1, Math.round(quantity));

  writeJson(
    CART_STORAGE_KEY,
    getCartItems().map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item)),
  );
  dispatchCommerceChange();
}

export function removeCartItem(productId: string) {
  writeJson(
    CART_STORAGE_KEY,
    getCartItems().filter((item) => item.productId !== productId),
  );
  dispatchCommerceChange();
}

export function clearCart() {
  writeJson<DemoCartItem[]>(CART_STORAGE_KEY, []);
  dispatchCommerceChange();
}

export function getBalance() {
  return readJson<number>(BALANCE_STORAGE_KEY, 0);
}

export function setBalance(value: number) {
  writeJson(BALANCE_STORAGE_KEY, Math.max(0, Math.round(value)));
  dispatchCommerceChange();
}

export function addBalance(amount: number) {
  setBalance(getBalance() + amount);
}

export function debitBalance(amount: number) {
  const balance = getBalance();

  if (balance < amount) {
    return false;
  }

  setBalance(balance - amount);
  return true;
}

export function getSteamData() {
  return readJson<DemoSteamData | null>(STEAM_STORAGE_KEY, null);
}

export function saveSteamData(data: DemoSteamData) {
  writeJson(STEAM_STORAGE_KEY, data);
  dispatchCommerceChange();
}

export function getOrders() {
  return readJson<DemoOrder[]>(ORDERS_STORAGE_KEY, []);
}

export function saveOrder(order: DemoOrder) {
  writeJson<DemoOrder[]>(ORDERS_STORAGE_KEY, [order, ...getOrders()]);
  dispatchCommerceChange();
}

export function createDemoOrder(products: HomeCarouselProduct[], items: DemoCartItem[], steamData?: DemoSteamData) {
  const order: DemoOrder = {
    createdAt: new Date().toISOString(),
    id: `LK-${Date.now().toString(36).toUpperCase()}`,
    items,
    products,
    status: "processing",
    steamData,
    totalRub: getProductsTotalRub(products, items),
  };

  saveOrder(order);
  return order;
}

export function productNeedsSteam(product: HomeCarouselProduct) {
  return product.category === "cs2" || product.category === "csgo" || product.category === "dota2" || product.category === "rust";
}

export function cartNeedsSteam(products: HomeCarouselProduct[]) {
  return products.some(productNeedsSteam);
}

function getPriceNumbers(value: string) {
  return Array.from(value.matchAll(/\d+(?:[\s,.]\d+)*/g)).map((match) =>
    Number(match[0].replace(/\s/g, "").replace(",", ".")),
  );
}

export function getProductPaymentAmountRub(product: HomeCarouselProduct) {
  const numbers = getPriceNumbers(product.price);
  const mainNumber = numbers.at(-1) ?? 0;

  if (product.price.includes("€")) {
    return Math.max(1, Math.round(mainNumber * 100));
  }

  if (product.price.includes("zł")) {
    return Math.max(1, Math.round(mainNumber * 25));
  }

  if (product.price.includes("₽")) {
    return Math.max(1, Math.round(mainNumber));
  }

  return Math.max(1, Math.round(mainNumber));
}

export function getProductsTotalRub(products: HomeCarouselProduct[], items: DemoCartItem[]) {
  return products.reduce((total, product) => {
    const quantity = items.find((item) => item.productId === product.id)?.quantity ?? 1;
    return total + getProductPaymentAmountRub(product) * quantity;
  }, 0);
}

export function formatRub(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "RUB",
  }).format(value);
}

export function getStatusLabel(status: DemoOrderStatus) {
  const labels: Record<DemoOrderStatus, string> = {
    created: "Создан",
    sent: "Передан поставщику",
    processing: "В обработке",
    completed: "Выполнен",
    error: "Ошибка",
  };

  return labels[status];
}

export function getStatusFlow(status: DemoOrderStatus) {
  const flow = [
    ["created", "Заказ создан"],
    ["sent", "Передан поставщику"],
    ["processing", "В обработке"],
    ["completed", "Выполнен"],
    ["error", "Ошибка"],
  ] as const;
  const activeIndex = flow.findIndex(([key]) => key === status);

  return flow.map(([key, label], index) => ({
    key,
    label,
    state: key === "error" && status === "error" ? "error" : index < activeIndex ? "done" : index === activeIndex ? "current" : "pending",
  }));
}
