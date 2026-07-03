export const APP_ROUTES = {
  home: "/",
  catalog: "/catalog",
  cart: "/cart",
  auth: "/auth",
  balance: "/balance",
  checkout: "/checkout",
  profile: "/profile",
  purchaseHistory: "/profile/purchases",
  faq: "/faq",
  contacts: "/contacts",
  legal: "/legal",
  userAgreement: "/legal/user-agreement",
  privacy: "/legal/privacy",
  cookies: "/legal/cookies",
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;

export function getProductRoute(productId: string) {
  return `/product/${productId}`;
}
