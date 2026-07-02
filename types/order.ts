export type OrderStatus =
  | "awaiting-payment"
  | "paid"
  | "processing"
  | "requires-user-action"
  | "delivered"
  | "failed"
  | "refunded"
  | "under-review";
