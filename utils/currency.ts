export const LOCKER_CURRENCY_NAME = "Локерсы";
export const LOCKER_CURRENCY_CODE = "LK";
export const RUB_TO_LOCKER_RATE = 1.7;

export function rubToLocker(amountRub: number) {
  return Math.max(0, Math.round(amountRub * RUB_TO_LOCKER_RATE));
}

export function lockerToRub(amountLk: number) {
  return Math.max(0, Math.round(amountLk / RUB_TO_LOCKER_RATE));
}

export function formatLocker(value: number) {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)))} ${LOCKER_CURRENCY_CODE}`;
}

export function formatRubPlain(value: number) {
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)))} ₽`;
}

export function formatApproxRubFromLocker(valueLk: number) {
  return `≈ ${formatRubPlain(lockerToRub(valueLk))}`;
}

export function formatLockerConversion(amountRub: number) {
  return `${formatRubPlain(amountRub)} → ${formatLocker(rubToLocker(amountRub))}`;
}

export function formatLockerExchangeRate() {
  return `1 ₽ = ${RUB_TO_LOCKER_RATE.toLocaleString("ru-RU")} ${LOCKER_CURRENCY_CODE}`;
}
