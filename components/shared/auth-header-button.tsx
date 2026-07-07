"use client";

import { useEffect, useState } from "react";
import { APP_ROUTES } from "@/constants/routes";
import { AUTH_CHANGE_EVENT, clearAuthSession, hasAuthSession } from "@/utils/demo-commerce";
import { LockerButton } from "./locker-button";
import styles from "./auth-header-button.module.css";

export function AuthHeaderButton() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function updateState() {
      setIsAuthenticated(hasAuthSession());
    }

    updateState();
    window.addEventListener("storage", updateState);
    window.addEventListener(AUTH_CHANGE_EVENT, updateState);

    return () => {
      window.removeEventListener("storage", updateState);
      window.removeEventListener(AUTH_CHANGE_EVENT, updateState);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <LockerButton href={APP_ROUTES.auth} size="compact" variant="ghost">
        Войти
      </LockerButton>
    );
  }

  return (
    <div className={styles.actions}>
      <LockerButton href={APP_ROUTES.profile} size="compact" variant="ghost">
        Профиль
      </LockerButton>
      <button className={styles.signOut} type="button" onClick={clearAuthSession}>
        Выйти
      </button>
    </div>
  );
}
