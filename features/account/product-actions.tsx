"use client";

import Link from "next/link";
import { useState } from "react";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES } from "@/constants/routes";
import { addCartItem } from "@/utils/demo-commerce";
import styles from "./account-pages.module.css";

export function ProductActions({ productId }: { productId: string }) {
  const [message, setMessage] = useState("");

  function handleAddToCart() {
    addCartItem(productId);
    setMessage("Товар добавлен в корзину.");
  }

  return (
    <div className={styles.inlineActions}>
      <LockerButton type="button" onClick={handleAddToCart}>
        Добавить в корзину
      </LockerButton>
      <Link className={styles.plainButton} href={APP_ROUTES.cart}>
        Открыть корзину
      </Link>
      {message ? (
        <p className={styles.inlineFeedback} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
