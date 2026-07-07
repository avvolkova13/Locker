"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import type { HomeCarouselProduct } from "@/types/home-carousel";
import {
  addBalance,
  addCartItem,
  cartNeedsSteam,
  clearAuthSession,
  clearCart,
  COMMERCE_CHANGE_EVENT,
  createDemoOrder,
  debitBalance,
  DEFAULT_TOP_UP_AMOUNT,
  formatRub,
  getAuthSession,
  getBalance,
  getCartProducts,
  getOrders,
  getProductsTotalRub,
  getSafeReturnTo,
  getStatusFlow,
  getStatusLabel,
  getSteamData,
  removeCartItem,
  saveSteamData,
  setCartItemQuantity,
  type DemoCartItem,
  type DemoOrder,
  type DemoPaymentMethod,
  type DemoSession,
  type DemoSteamData,
} from "@/utils/demo-commerce";
import { AuthForms } from "./auth-forms";
import styles from "./account-pages.module.css";

type CartEntry = {
  item: DemoCartItem;
  product: HomeCarouselProduct;
};

type CommerceSnapshot = {
  balance: number;
  cartEntries: CartEntry[];
  orders: DemoOrder[];
  session: DemoSession | null;
  steamData: DemoSteamData | null;
};

const STATUS_EXPLANATIONS = [
  ["Создан", "Заказ принят Locker."],
  ["Передан поставщику", "Данные переданы для выдачи."],
  ["В обработке", "Поставщик выполняет заказ."],
  ["Выполнен", "Товар выдан или доступ открыт."],
  ["Ошибка", "Нужно проверить детали заказа."],
] as const;

function getSnapshot(): CommerceSnapshot {
  return {
    balance: getBalance(),
    cartEntries: getCartProducts(),
    orders: getOrders(),
    session: getAuthSession(),
    steamData: getSteamData(),
  };
}

function useCommerceSnapshot() {
  const [snapshot, setSnapshot] = useState<CommerceSnapshot>({
    balance: 0,
    cartEntries: [],
    orders: [],
    session: null,
    steamData: null,
  });

  useEffect(() => {
    function updateSnapshot() {
      setSnapshot(getSnapshot());
    }

    updateSnapshot();
    window.addEventListener("storage", updateSnapshot);
    window.addEventListener(COMMERCE_CHANGE_EVENT, updateSnapshot);
    window.addEventListener("locker-auth-change", updateSnapshot);

    return () => {
      window.removeEventListener("storage", updateSnapshot);
      window.removeEventListener(COMMERCE_CHANGE_EVENT, updateSnapshot);
      window.removeEventListener("locker-auth-change", updateSnapshot);
    };
  }, []);

  return snapshot;
}

function PageShell({
  actions,
  backHref = APP_ROUTES.home,
  backLabel = "На главную",
  children,
  eyebrow,
  side,
  shellClassName,
  text,
  title,
}: {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  eyebrow: string;
  side?: ReactNode;
  shellClassName?: string;
  text: string;
  title: string;
}) {
  return (
    <main className={styles.page} aria-labelledby="page-title">
      <div className={shellClassName ? `${styles.shell} ${shellClassName}` : styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.backLink} href={backHref}>
            ← {backLabel}
          </Link>
          <div className={styles.topLinks}>
            <Link className={styles.utilityLink} href={APP_ROUTES.catalog}>
              Каталог
            </Link>
            <Link className={styles.utilityLink} href={APP_ROUTES.cart}>
              Корзина
            </Link>
            <Link className={styles.utilityLink} href={APP_ROUTES.profile}>
              Профиль
            </Link>
          </div>
        </div>

        <section className={styles.hero}>
          <div>
            {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
            <h1 id="page-title">{title}</h1>
            <p>{text}</p>
            {actions ? <div className={styles.actionStack}>{actions}</div> : null}
          </div>
          {side ? <aside className={styles.heroAside}>{side}</aside> : null}
        </section>

        {children}
      </div>
    </main>
  );
}

function ProductMiniCard({
  onDecrease,
  onIncrease,
  onRemove,
  product,
  quantity = 1,
}: {
  onDecrease?: () => void;
  onIncrease?: () => void;
  onRemove?: () => void;
  product: HomeCarouselProduct;
  quantity?: number;
}) {
  return (
    <article className={styles.itemCard} style={{ "--item-accent": product.accent } as CSSProperties}>
      <Link className={styles.itemVisual} href={getProductRoute(product.id)}>
        {product.imageUrl ? (
          <Image alt={product.imageAlt} fill sizes="124px" src={product.imageUrl} />
        ) : (
          <span>{product.visualCode}</span>
        )}
      </Link>
      <div>
        <div className={styles.itemMeta}>
          <span className={styles.tag}>{product.categoryLabel}</span>
          <span className={styles.tag}>{product.source}</span>
          {quantity > 1 ? <span className={styles.tag}>x{quantity}</span> : null}
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        {onDecrease && onIncrease ? (
          <div className={styles.quantityControl} aria-label={`Количество ${product.name}`}>
            <button disabled={quantity <= 1} type="button" onClick={onDecrease}>
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={onIncrease}>
              +
            </button>
          </div>
        ) : null}
        {onRemove ? (
          <button className={styles.textButton} type="button" onClick={onRemove}>
            Удалить
          </button>
        ) : null}
      </div>
      <div className={styles.itemPrice}>
        <strong>{product.price}</strong>
        <span>{product.stat}</span>
      </div>
    </article>
  );
}

function SummaryCard({
  action,
  notice = "Перед списанием Locker проверит аккаунт, баланс и данные для выдачи.",
  rows,
  showLabel = true,
  title = "Проверка перед оплатой",
  total,
}: {
  action: ReactNode;
  notice?: string;
  rows: Array<[string, string]>;
  showLabel?: boolean;
  title?: string;
  total: string;
}) {
  return (
    <aside className={styles.summaryCard}>
      {showLabel ? <span className={styles.sectionLabel}>Итог</span> : null}
      <h2>{title}</h2>
      <div className={styles.summaryRows}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className={styles.totalRow}>
        <span>К оплате с баланса</span>
        <strong>{total}</strong>
      </div>
      <div className={styles.actionStack}>{action}</div>
      <p className={styles.notice}>{notice}</p>
    </aside>
  );
}

function EmptyState({ action, text, title }: { action: ReactNode; text: string; title: string }) {
  return (
    <section className={styles.emptyState}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className={styles.actionStack}>{action}</div>
      </div>
    </section>
  );
}

function StatusRail({ balance, hasSteamData, needsSteam }: {
  balance: number;
  hasSteamData: boolean;
  needsSteam: boolean;
}) {
  const statuses = [
    ["Баланс", balance > 0 ? formatRub(balance) : "0 ₽", balance > 0 ? undefined : "warning"],
    ["Steam", needsSteam ? (hasSteamData ? "Данные указаны" : "Нужны данные") : "Не требуется", needsSteam && !hasSteamData ? "warning" : "muted"],
  ] as const;

  return (
    <div className={styles.statusRail}>
      {statuses.map(([label, value, tone]) => (
        <div className={styles.statusRow} key={label}>
          <strong>{label}</strong>
          <span className={styles.status} data-tone={tone}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function getProducts(entries: CartEntry[]) {
  return entries.map((entry) => entry.product);
}

export function CartScreen() {
  const { balance, cartEntries, session } = useCommerceSnapshot();
  const products = getProducts(cartEntries);
  const totalRub = getProductsTotalRub(products, cartEntries.map((entry) => entry.item));
  const checkoutHref = session ? APP_ROUTES.checkout : `${APP_ROUTES.auth}?returnTo=${APP_ROUTES.checkout}`;

  return (
    <PageShell
      backHref={APP_ROUTES.catalog}
      backLabel="В каталог"
      eyebrow=""
      shellClassName={styles.cartPageShell}
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>Баланс</span>
          <strong>{formatRub(balance)}</strong>
          <p>Сначала пополните баланс картой или через СБП. Покупки списываются с баланса Locker.</p>
          <Link className={styles.ledgerAction} href={`${APP_ROUTES.balance}?returnTo=${APP_ROUTES.cart}`}>
            Пополнить
          </Link>
        </div>
      }
      text="Проверьте товары, цену и условия выдачи. Если товару нужны данные Steam, это будет видно до оплаты."
      title="Корзина"
    >
      {products.length === 0 ? (
        <EmptyState
          action={<LockerButton href={APP_ROUTES.catalog}>Выбрать товар</LockerButton>}
          text="Добавьте товар из каталога, чтобы перейти к оформлению."
          title="Корзина пуста"
        />
      ) : (
        <div className={`${styles.grid} ${styles.cartGrid}`}>
          <section className={styles.panel} aria-label="Товары в корзине">
            <div className={styles.panelHeader}>
              <div>
                <h2>Товары к покупке</h2>
              </div>
            </div>
            <div className={styles.itemList}>
              {cartEntries.map(({ item, product }) => (
                <ProductMiniCard
                  key={product.id}
                  product={product}
                  quantity={item.quantity}
                  onDecrease={() => setCartItemQuantity(product.id, item.quantity - 1)}
                  onIncrease={() => addCartItem(product.id)}
                  onRemove={() => removeCartItem(product.id)}
                />
              ))}
            </div>
          </section>
          <SummaryCard
            action={<LockerButton href={checkoutHref}>{session ? "Оформить заказ" : "Войти и оформить"}</LockerButton>}
            rows={[
              ["Товары", String(products.length)],
              ["Оплата", "Баланс Locker"],
            ]}
            showLabel={false}
            title="Итог"
            total={formatRub(totalRub)}
          />
        </div>
      )}
    </PageShell>
  );
}

export function CheckoutScreen() {
  const router = useRouter();
  const { balance, cartEntries, session, steamData } = useCommerceSnapshot();
  const products = getProducts(cartEntries);
  const totalRub = getProductsTotalRub(products, cartEntries.map((entry) => entry.item));
  const needsSteam = cartNeedsSteam(products);
  const [steamValues, setSteamValues] = useState<DemoSteamData>(steamData ?? { steamId: "", tradeUrl: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasSteamData = !needsSteam || Boolean((steamData?.steamId || steamValues.steamId).trim() && (steamData?.tradeUrl || steamValues.tradeUrl).trim());
  const hasEnoughBalance = balance >= totalRub;

  useEffect(() => {
    if (steamData) {
      setSteamValues(steamData);
    }
  }, [steamData]);

  function handleSteamSubmit() {
    const steamId = steamValues.steamId.trim();
    const tradeUrl = steamValues.tradeUrl.trim();

    if (!steamId || !tradeUrl) {
      setError("Укажите Steam ID и Trade URL.");
      return;
    }

    saveSteamData({ steamId, tradeUrl });
    setError("Данные Steam сохранены.");
  }

  function handleConfirm() {
    if (!session) {
      router.push(`${APP_ROUTES.auth}?returnTo=${APP_ROUTES.checkout}`);
      return;
    }

    if (products.length === 0) {
      setError("В корзине нет товаров.");
      return;
    }

    if (!hasEnoughBalance) {
      setError("На балансе недостаточно средств. Пополните баланс и вернитесь к оформлению.");
      return;
    }

    if (needsSteam && !hasSteamData) {
      setError("Для игровых предметов нужны Steam ID и Trade URL.");
      return;
    }

    setError("");
    setIsLoading(true);

    window.setTimeout(() => {
      const debited = debitBalance(totalRub);

      if (!debited) {
        setIsLoading(false);
        setError("Баланс изменился. Проверьте сумму перед повторной оплатой.");
        return;
      }

      createDemoOrder(products, cartEntries.map((entry) => entry.item), needsSteam ? getSteamData() ?? steamValues : undefined);
      clearCart();
      setIsLoading(false);
      router.push(APP_ROUTES.purchaseHistory);
    }, 850);
  }

  return (
    <PageShell
      actions={<LockerButton href={`${APP_ROUTES.balance}?returnTo=${APP_ROUTES.checkout}`}>Пополнить баланс</LockerButton>}
      backHref={APP_ROUTES.cart}
      backLabel="В корзину"
      eyebrow=""
      side={<StatusRail balance={balance} hasSteamData={hasSteamData} needsSteam={needsSteam} />}
      text="Перед оплатой Locker проверяет вход, баланс и данные для выдачи."
      title="Оформление заказа"
    >
      {products.length === 0 ? (
        <EmptyState
          action={<LockerButton href={APP_ROUTES.catalog}>Открыть каталог</LockerButton>}
          text="Добавьте товар в корзину, чтобы оформить покупку."
          title="Нет товаров для оформления"
        />
      ) : (
        <div className={styles.grid}>
          <section className={styles.panel} aria-label="Состав заказа">
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.sectionLabel}>Заказ</span>
                <h2>Проверьте состав</h2>
                <p>Карта и СБП используются для пополнения. Сам заказ списывается с баланса Locker.</p>
              </div>
            </div>
            <div className={styles.itemList}>
              {cartEntries.map(({ item, product }) => (
                <ProductMiniCard key={product.id} product={product} quantity={item.quantity} />
              ))}
            </div>
            {needsSteam ? (
              <div className={styles.steamForm}>
                <span className={styles.sectionLabel}>Steam</span>
                <h3>Данные для выдачи</h3>
                <p>Для игровых предметов нужны Steam ID и Trade URL. Мы проверяем это до списания баланса.</p>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span>Steam ID</span>
                    <input
                      value={steamValues.steamId}
                      placeholder="7656119..."
                      onChange={(event) => setSteamValues((current) => ({ ...current, steamId: event.target.value }))}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Trade URL</span>
                    <input
                      value={steamValues.tradeUrl}
                      placeholder="https://steamcommunity.com/tradeoffer/new/..."
                      onChange={(event) => setSteamValues((current) => ({ ...current, tradeUrl: event.target.value }))}
                    />
                  </label>
                  <button className={styles.plainButton} type="button" onClick={handleSteamSubmit}>
                    Сохранить Steam
                  </button>
                </div>
              </div>
            ) : null}
            {error ? (
              <p className={error.includes("сохранены") ? styles.successText : styles.fieldError} role="status">
                {error}
              </p>
            ) : null}
          </section>
          <SummaryCard
            action={
              <button className={styles.plainButton} disabled={isLoading} type="button" onClick={handleConfirm}>
                {isLoading ? "Создаём заказ…" : session ? "Подтвердить заказ" : "Войти и продолжить"}
              </button>
            }
            rows={[
              ["Баланс", formatRub(balance)],
              ["Steam", needsSteam ? (hasSteamData ? "Данные есть" : "Нужны данные") : "Не требуется"],
            ]}
            total={formatRub(totalRub)}
          />
        </div>
      )}
    </PageShell>
  );
}

export function AuthScreen() {
  return (
    <main className={styles.page} aria-labelledby="page-title">
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.backLink} href={APP_ROUTES.home}>
            ← На главную
          </Link>
          <div className={styles.topLinks}>
            <Link className={styles.utilityLink} href={APP_ROUTES.catalog}>
              Каталог
            </Link>
            <Link className={styles.utilityLink} href={APP_ROUTES.cart}>
              Корзина
            </Link>
            <Link className={styles.utilityLink} href={APP_ROUTES.profile}>
              Профиль
            </Link>
          </div>
        </div>

        <section className={styles.authLayout}>
          <div className={styles.authIntro}>
            <h1 id="page-title">Вход и регистрация</h1>
            <p>Вход нужен для баланса, оформления покупки и истории заказов.</p>
          </div>
          <AuthForms />
        </section>
      </div>
    </main>
  );
}

export function BalanceScreen() {
  const returnTo = useMemo(() => getSafeReturnTo(APP_ROUTES.catalog), []);
  const { balance } = useCommerceSnapshot();
  const [amount, setAmount] = useState(DEFAULT_TOP_UP_AMOUNT);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<DemoPaymentMethod>("card");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const selectedAmount = customAmount ? Number(customAmount) : amount;

  function handleTopUp() {
    if (!Number.isFinite(selectedAmount) || selectedAmount < 100) {
      setMessage({ text: "Минимальная сумма пополнения — 100 ₽.", type: "error" });
      return;
    }

    setMessage(null);
    setIsLoading(true);

    window.setTimeout(() => {
      addBalance(selectedAmount);
      setIsLoading(false);
      setMessage({
        text: method === "card" ? "Баланс пополнен картой." : "Баланс пополнен через СБП.",
        type: "success",
      });
    }, 850);
  }

  return (
    <PageShell
      actions={<LockerButton href={returnTo}>{returnTo === APP_ROUTES.checkout ? "Вернуться к оформлению" : "Выбрать товар"}</LockerButton>}
      eyebrow=""
      side={
        <div className={styles.ledgerCard}>
          <strong>{formatRub(balance)}</strong>
          <p>Баланс используется для оплаты товаров внутри Locker.</p>
        </div>
      }
      text="Пополните баланс картой или через СБП, затем оплатите покупку с баланса Locker."
      title="Пополнение баланса"
    >
      <div className={styles.balanceFlow}>
        <section className={styles.formPanel} aria-labelledby="balance-title">
          <h2 id="balance-title">Выберите пополнение</h2>
          <div className={styles.amountGrid} aria-label="Варианты суммы">
            {[500, 1000, 3000].map((value) => (
              <button
                data-active={!customAmount && amount === value}
                key={value}
                type="button"
                onClick={() => {
                  setAmount(value);
                  setCustomAmount("");
                }}
              >
                {formatRub(value)}
              </button>
            ))}
          </div>
          <label className={styles.field}>
            <input
              aria-label="Своя сумма пополнения"
              inputMode="numeric"
              placeholder="Например, 1500"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value.replace(/\D/g, ""))}
            />
          </label>
          {message ? (
            <p className={message.type === "success" ? styles.successText : styles.fieldError} role="status">
              {message.text}
            </p>
          ) : null}
          <div className={styles.paymentStep} aria-labelledby="method-title">
          <h2 id="method-title">Выберите способ оплаты</h2>
          <div className={styles.methodGrid}>
            <button className={styles.methodCard} data-active={method === "card"} type="button" onClick={() => setMethod("card")}>
              <strong>Банковская карта</strong>
              <span>Оплата картой с зачислением на баланс Locker.</span>
            </button>
            <button className={styles.methodCard} data-active={method === "sbp"} type="button" onClick={() => setMethod("sbp")}>
              <strong>СБП</strong>
              <span>Перевод через СБП с проверкой суммы перед оплатой.</span>
            </button>
          </div>
          </div>
          <div className={styles.actionStack}>
            <button className={styles.plainButton} disabled={isLoading} type="button" onClick={handleTopUp}>
              {isLoading ? "Пополняем баланс…" : "Пополнить баланс"}
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function ProfileScreen() {
  const router = useRouter();
  const { balance, cartEntries, orders, session } = useCommerceSnapshot();

  function handleSignOut() {
    clearAuthSession();
    router.push(APP_ROUTES.auth);
  }

  return (
    <PageShell
      eyebrow="Профиль"
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>Состояние</span>
          <strong>{session ? "Активен" : "Гость"}</strong>
          <p>{session ? session.email : "Войдите, чтобы оформить покупку и сохранить историю."}</p>
          {session ? (
            <button className={styles.ledgerAction} type="button" onClick={handleSignOut}>
              Выйти
            </button>
          ) : null}
        </div>
      }
      text="Профиль собирает баланс, корзину и покупки в одном месте."
      title="Профиль Locker"
    >
      <div className={styles.profileGrid}>
        <section className={styles.profileCard}>
          <span className={styles.sectionLabel}>Баланс</span>
          <h2>{formatRub(balance)}</h2>
          <p>Средства для оплаты покупок внутри Locker.</p>
          <Link className={styles.panelLink} href={APP_ROUTES.balance}>
            <strong>Пополнить</strong>
            <span>Открыть страницу баланса</span>
          </Link>
        </section>
        <section className={styles.profileCard}>
          <span className={styles.sectionLabel}>Корзина</span>
          <h2>{cartEntries.length} товара</h2>
          <p>Проверьте товары перед оформлением.</p>
          <Link className={styles.panelLink} href={APP_ROUTES.cart}>
            <strong>Открыть</strong>
            <span>Перейти к корзине</span>
          </Link>
        </section>
        <section className={styles.profileCard}>
          <span className={styles.sectionLabel}>Покупки</span>
          <h2>{orders.length}</h2>
          <p>Заказы и статусы сохраняются в истории.</p>
          <Link className={styles.panelLink} href={APP_ROUTES.purchaseHistory}>
            <strong>Смотреть</strong>
            <span>Открыть историю</span>
          </Link>
        </section>
      </div>
    </PageShell>
  );
}

export function PurchaseHistoryScreen() {
  const { orders } = useCommerceSnapshot();

  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.catalog} size="compact">Открыть каталог</LockerButton>}
      backHref={APP_ROUTES.profile}
      backLabel="В профиль"
      eyebrow=""
      text="Здесь видно, что произошло с покупкой и какое действие требуется дальше."
      title="История покупок"
    >
      <div className={styles.historyLayout}>
        <section className={styles.panel} aria-label="Список покупок">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.sectionLabel}>Заказы</span>
              <h2>Последние операции</h2>
            </div>
          </div>
          {orders.length === 0 ? (
            <EmptyState
              action={<LockerButton href={APP_ROUTES.catalog}>Открыть каталог</LockerButton>}
              text="После покупки заказ появится здесь со статусом."
              title="Покупок пока нет"
            />
          ) : (
            <div className={styles.historyList}>
              {orders.map((order) => (
                <article className={styles.historyCard} key={order.id}>
                  <div>
                    <span className={styles.status} data-tone={order.status === "error" ? "warning" : undefined}>
                      {getStatusLabel(order.status)}
                    </span>
                    <h3>{order.products.map((product) => product.name).join(", ")}</h3>
                    <p>Заказ {order.id}. Оплата списана с баланса Locker.</p>
                    <div className={styles.historyFooter}>
                      {order.products[0] ? (
                        <Link className={styles.utilityLink} href={getProductRoute(order.products[0].id)}>
                          Открыть товар
                        </Link>
                      ) : null}
                      <span className={styles.smallLabel}>{new Date(order.createdAt).toLocaleDateString("ru-RU")}</span>
                    </div>
                    <div className={styles.timeline}>
                      {getStatusFlow(order.status).map((step) => (
                        <span data-state={step.state} key={step.key}>
                          {step.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <strong className={styles.historyPrice}>{formatRub(order.totalRub)}</strong>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className={styles.statusGuide} aria-labelledby="status-title">
          <h2 id="status-title">Что означает статус</h2>
          <div className={styles.statusGuideList}>
            {STATUS_EXPLANATIONS.map(([status, text]) => (
              <div className={styles.statusRow} key={status}>
                <strong>{status}</strong>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
