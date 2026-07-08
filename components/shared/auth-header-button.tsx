"use client";

import { useEffect, useState } from "react";
import { APP_ROUTES } from "@/constants/routes";
import {
  AUTH_CHANGE_EVENT,
  clearAuthSession,
  COMMERCE_CHANGE_EVENT,
  formatLocker,
  formatLockerExchangeRate,
  getBalance,
  hasAuthSession,
} from "@/utils/demo-commerce";
import { LockerButton } from "./locker-button";
import styles from "./auth-header-button.module.css";

export function AuthHeaderButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    function updateState() {
      setIsAuthenticated(hasAuthSession());
      setBalance(getBalance());
    }

    updateState();
    window.addEventListener("storage", updateState);
    window.addEventListener(AUTH_CHANGE_EVENT, updateState);
    window.addEventListener(COMMERCE_CHANGE_EVENT, updateState);

    return () => {
      window.removeEventListener("storage", updateState);
      window.removeEventListener(AUTH_CHANGE_EVENT, updateState);
      window.removeEventListener(COMMERCE_CHANGE_EVENT, updateState);
    };
  }, []);

  const currencyHint = "LK — локерсы, внутренняя валюта Locker. " + formatLockerExchangeRate();

  if (!isAuthenticated) {
    return (
      <div className={styles.actions}>
        <span className={styles.currencyPill} title={currencyHint}>
          <strong>Локерсы</strong>
          <span>{formatLockerExchangeRate()}</span>
        </span>
        <LockerButton href={APP_ROUTES.auth} size="compact" variant="ghost">
          Войти
        </LockerButton>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <span className={styles.balancePill} title={currencyHint}>
        <span>Баланс</span>
        <strong>{formatLocker(balance)}</strong>
      </span>
      <LockerButton href={APP_ROUTES.profile} size="compact" variant="ghost">
        Профиль
      </LockerButton>
      <LockerButton className={styles.signOut} size="compact" variant="ghost" onClick={clearAuthSession}>
        Выйти
      </LockerButton>
    </div>
  );
}
