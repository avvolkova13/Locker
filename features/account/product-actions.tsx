"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES } from "@/constants/routes";
import { addCartItem, COMMERCE_CHANGE_EVENT, getCartItems } from "@/utils/demo-commerce";
import styles from "./account-pages.module.css";

const CART_TOAST_DURATION_MS = 2600;

function getCartCount() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function ProductCartQuickLink({
  badgeClassName,
  className,
}: {
  badgeClassName?: string;
  className?: string;
}) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      setCartCount(getCartCount());
    }

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener(COMMERCE_CHANGE_EVENT, updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener(COMMERCE_CHANGE_EVENT, updateCartCount);
    };
  }, []);

  return (
    <Link className={className} href={APP_ROUTES.cart}>
      <span>Корзина</span>
      <strong className={badgeClassName}>{cartCount}</strong>
    </Link>
  );
}

export function ProductActions({ productId }: { productId: string }) {
  const [message, setMessage] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
  }, []);

  function handleAddToCart() {
    addCartItem(productId);
    setMessage(true);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setMessage(false);
      toastTimeoutRef.current = null;
    }, CART_TOAST_DURATION_MS);
  }

  return (
    <div className={styles.inlineActions}>
      <LockerButton type="button" onClick={handleAddToCart}>
        Добавить в корзину
      </LockerButton>
      {message ? (
        <div className={styles.cartToast} role="status">
          <span>Добавлено в корзину</span>
          <strong>Товар добавлен</strong>
          <Link href={APP_ROUTES.cart}>Перейти в корзину</Link>
        </div>
      ) : null}
    </div>
  );
}
