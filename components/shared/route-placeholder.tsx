import Link from "next/link";
import type { ReactNode } from "react";
import { APP_ROUTES } from "@/constants/routes";
import styles from "./route-placeholder.module.css";

type RoutePlaceholderProps = {
  actions?: ReactNode;
  children?: ReactNode;
  eyebrow?: string;
  text?: string;
  title: string;
};

export function RoutePlaceholder({
  actions,
  children,
  eyebrow = "Locker",
  text,
  title,
}: RoutePlaceholderProps) {
  return (
    <main className={styles.page} aria-labelledby="page-title">
      <div className={styles.shell}>
        <nav className={styles.breadcrumbs} aria-label="Навигация">
          <Link href={APP_ROUTES.home}>Главная</Link>
          <span>/</span>
          <span>{title}</span>
        </nav>

        <section className={styles.hero}>
          {eyebrow ? <span>{eyebrow}</span> : null}
          <h1 id="page-title">{title}</h1>
          {text ? <p>{text}</p> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </section>

        {children ? <div className={styles.content}>{children}</div> : null}
      </div>
    </main>
  );
}
