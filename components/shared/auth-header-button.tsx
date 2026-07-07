"use client";

import { useEffect, useState } from "react";
import { APP_ROUTES } from "@/constants/routes";
import { AUTH_CHANGE_EVENT, hasAuthSession } from "@/utils/demo-commerce";
import { LockerButton } from "./locker-button";

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

  return (
    <LockerButton href={isAuthenticated ? APP_ROUTES.profile : APP_ROUTES.auth} size="compact" variant="ghost">
      {isAuthenticated ? "Профиль" : "Войти"}
    </LockerButton>
  );
}
