import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import { homeCarouselProducts } from "@/mock-data/home-carousel";
import type { HomeCarouselProduct } from "@/types/home-carousel";
import styles from "./account-pages.module.css";

const cartProducts = [
  homeCarouselProducts.find((product) => product.id === "steam-points-autodelivery"),
  homeCarouselProducts.find((product) => product.id === "cs2-ak47-wild-lotus-fn"),
].filter(Boolean) as HomeCarouselProduct[];

const checkoutProducts = [
  homeCarouselProducts.find((product) => product.id === "rust-fire-jacket"),
].filter(Boolean) as HomeCarouselProduct[];

const historyProducts = [
  homeCarouselProducts.find((product) => product.id === "steam-region-kazakhstan"),
  homeCarouselProducts.find((product) => product.id === "chatgpt-plus-global"),
  homeCarouselProducts.find((product) => product.id === "rust-tempered-mp5"),
].filter(Boolean) as HomeCarouselProduct[];

function PageShell({
  actions,
  backHref = APP_ROUTES.home,
  backLabel = "На главную",
  children,
  eyebrow,
  side,
  text,
  title,
}: {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  eyebrow: string;
  side?: ReactNode;
  text: string;
  title: string;
}) {
  return (
    <main className={styles.page} aria-labelledby="page-title">
      <div className={styles.shell}>
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
            <span className={styles.eyebrow}>{eyebrow}</span>
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

function ProductMiniCard({ product }: { product: HomeCarouselProduct }) {
  return (
    <article className={styles.itemCard} style={{ "--item-accent": product.accent } as CSSProperties}>
      <div className={styles.itemVisual}>
        {product.imageUrl ? (
          <Image alt={product.imageAlt} fill sizes="124px" src={product.imageUrl} />
        ) : (
          <span>{product.visualCode}</span>
        )}
      </div>
      <div>
        <div className={styles.itemMeta}>
          <span className={styles.tag}>{product.categoryLabel}</span>
          <span className={styles.tag}>{product.source}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
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
  rows,
  total,
}: {
  action: ReactNode;
  rows: Array<[string, string]>;
  total: string;
}) {
  return (
    <aside className={styles.summaryCard}>
      <span className={styles.sectionLabel}>Итог</span>
      <h2>Проверка перед оплатой</h2>
      <div className={styles.summaryRows}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className={styles.totalRow}>
        <span>К оплате</span>
        <strong>{total}</strong>
      </div>
      <div className={styles.actionStack}>{action}</div>
      <p className={styles.notice}>Списание с баланса появится после подключения авторизации, платежей и checkout.</p>
    </aside>
  );
}

function StatusRail() {
  const statuses = [
    ["Аккаунт", "Нужен вход", "warning"],
    ["Баланс", "Недостаточно средств", "warning"],
    ["Steam", "Проверяется до оплаты", "muted"],
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

export function CartScreen() {
  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.checkout}>Оформить заказ</LockerButton>}
      backHref={APP_ROUTES.catalog}
      backLabel="В каталог"
      eyebrow="Корзина"
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>Баланс</span>
          <strong>0 ₽</strong>
          <p>Покупка оплачивается с внутреннего баланса Locker.</p>
        </div>
      }
      text="Проверьте товары, цену и условия выдачи. Если товару нужны данные Steam, это будет видно до оплаты."
      title="Корзина"
    >
      <div className={styles.grid}>
        <section className={styles.panel} aria-label="Товары в корзине">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.sectionLabel}>2 позиции</span>
              <h2>Товары к покупке</h2>
            </div>
            <Link className={styles.utilityLink} href={APP_ROUTES.catalog}>
              Добавить товар
            </Link>
          </div>
          <div className={styles.itemList}>
            {cartProducts.map((product) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <SummaryCard
          action={<LockerButton href={APP_ROUTES.auth}>Войти и продолжить</LockerButton>}
          rows={[
            ["Товары", "2"],
            ["Оплата", "Баланс Locker"],
            ["Выдача", "После обработки"],
          ]}
          total="На checkout"
        />
      </div>
    </PageShell>
  );
}

export function CheckoutScreen() {
  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.balance}>Пополнить баланс</LockerButton>}
      backHref={APP_ROUTES.cart}
      backLabel="В корзину"
      eyebrow="Оформление"
      side={<StatusRail />}
      text="На этом шаге Locker должен проверить вход, баланс и данные для выдачи до списания средств."
      title="Оформление заказа"
    >
      <div className={styles.grid}>
        <section className={styles.panel} aria-label="Состав заказа">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.sectionLabel}>Заказ</span>
              <h2>Проверьте состав</h2>
              <p>Финальное подтверждение появится после подключения checkout.</p>
            </div>
          </div>
          <div className={styles.itemList}>
            {checkoutProducts.map((product) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        <SummaryCard
          action={<button className={styles.plainButton} disabled type="button">Подтверждение недоступно</button>}
          rows={[
            ["Аккаунт", "Не выполнен вход"],
            ["Баланс", "0 ₽"],
            ["Steam", "Может понадобиться"],
          ]}
          total="398.67 €"
        />
      </div>
    </PageShell>
  );
}

export function AuthScreen() {
  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.catalog}>Перейти в каталог</LockerButton>}
      eyebrow="Аккаунт"
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>После входа</span>
          <strong>Баланс</strong>
          <p>Профиль, корзина и история покупок будут связаны с аккаунтом Locker.</p>
        </div>
      }
      text="Вход нужен для баланса, оформления покупки и истории заказов. Форма пока не отправляет данные."
      title="Вход и регистрация"
    >
      <div className={styles.twoColumn}>
        <section className={styles.formPanel} aria-labelledby="login-title">
          <span className={styles.sectionLabel}>Вход</span>
          <h2 id="login-title">Уже есть аккаунт</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Email</span>
              <input autoComplete="email" placeholder="name@example.com" type="email" />
            </label>
            <label className={styles.field}>
              <span>Пароль</span>
              <input autoComplete="current-password" placeholder="Введите пароль" type="password" />
            </label>
            <button className={styles.plainButton} disabled type="button">Вход будет подключён</button>
          </div>
        </section>
        <section className={styles.formPanel} aria-labelledby="register-title">
          <span className={styles.sectionLabel}>Регистрация</span>
          <h2 id="register-title">Новый аккаунт</h2>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Email</span>
              <input autoComplete="email" placeholder="name@example.com" type="email" />
            </label>
            <label className={styles.field}>
              <span>Пароль</span>
              <input autoComplete="new-password" placeholder="Минимум 8 символов" type="password" />
            </label>
            <p className={styles.helperText}>Правила регистрации и подтверждение email будут зависеть от backend.</p>
            <button className={styles.plainButton} disabled type="button">Создание будет подключено</button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function BalanceScreen() {
  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.catalog}>Выбрать товар</LockerButton>}
      eyebrow="Баланс"
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>Доступно</span>
          <strong>0 ₽</strong>
          <p>Реальные операции появятся после платёжной интеграции.</p>
        </div>
      }
      text="Сначала пользователь пополняет внутренний счёт, затем оплачивает покупки с баланса Locker."
      title="Пополнение баланса"
    >
      <div className={styles.grid}>
        <section className={styles.formPanel} aria-labelledby="balance-title">
          <span className={styles.sectionLabel}>Сумма</span>
          <h2 id="balance-title">Выберите пополнение</h2>
          <div className={styles.amountGrid} aria-label="Варианты суммы">
            <button data-active="true" type="button">500 ₽</button>
            <button type="button">1 000 ₽</button>
            <button type="button">3 000 ₽</button>
          </div>
          <label className={styles.field}>
            <span>Своя сумма</span>
            <input inputMode="numeric" placeholder="Например, 1500" />
          </label>
          <p className={styles.notice}>Комиссии, лимиты и доступные способы оплаты зависят от платёжного провайдера.</p>
        </section>
        <section className={styles.panel} aria-labelledby="method-title">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.sectionLabel}>Способ</span>
              <h2 id="method-title">Оплата будет подключена позже</h2>
            </div>
          </div>
          <div className={styles.methodGrid}>
            <div className={styles.methodCard}>
              <strong>Банковская карта</strong>
              <span>Появится после подключения провайдера.</span>
            </div>
            <div className={styles.methodCard}>
              <strong>СБП</strong>
              <span>Доступность зависит от юридических реквизитов.</span>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function ProfileScreen() {
  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.purchaseHistory}>История покупок</LockerButton>}
      eyebrow="Профиль"
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>Состояние</span>
          <strong>Гость</strong>
          <p>Данные профиля появятся после входа.</p>
        </div>
      }
      text="Профиль собирает баланс, текущие действия и покупки в одном месте."
      title="Профиль Locker"
    >
      <div className={styles.profileGrid}>
        <section className={styles.profileCard}>
          <span className={styles.sectionLabel}>Баланс</span>
          <h2>0 ₽</h2>
          <p>Средства для оплаты покупок внутри Locker.</p>
          <Link className={styles.panelLink} href={APP_ROUTES.balance}>
            <strong>Пополнить</strong>
            <span>Открыть страницу баланса</span>
          </Link>
        </section>
        <section className={styles.profileCard}>
          <span className={styles.sectionLabel}>Корзина</span>
          <h2>2 товара</h2>
          <p>Проверьте товары перед оформлением.</p>
          <Link className={styles.panelLink} href={APP_ROUTES.cart}>
            <strong>Открыть</strong>
            <span>Перейти к корзине</span>
          </Link>
        </section>
        <section className={styles.profileCard}>
          <span className={styles.sectionLabel}>Steam</span>
          <h2>Не указан</h2>
          <p>Данные будут запрошены только там, где они нужны.</p>
          <div className={styles.profileMetric}>
            <span>Статус</span>
            <strong>Позже</strong>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function PurchaseHistoryScreen() {
  return (
    <PageShell
      actions={<LockerButton href={APP_ROUTES.catalog}>Открыть каталог</LockerButton>}
      backHref={APP_ROUTES.profile}
      backLabel="В профиль"
      eyebrow="Покупки"
      side={
        <div className={styles.ledgerCard}>
          <span className={styles.smallLabel}>История</span>
          <strong>Демо</strong>
          <p>Пример отображения статусов до подключения реальных заказов.</p>
        </div>
      }
      text="Здесь пользователь должен видеть, что произошло с покупкой и какое действие требуется дальше."
      title="История покупок"
    >
      <div className={styles.grid}>
        <section className={styles.panel} aria-label="Список покупок">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.sectionLabel}>Заказы</span>
              <h2>Последние операции</h2>
            </div>
          </div>
          <div className={styles.historyList}>
            {historyProducts.map((product, index) => (
              <article className={styles.historyCard} key={product.id}>
                <div>
                  <span className={styles.status} data-tone={index === 0 ? "muted" : index === 1 ? undefined : "warning"}>
                    {index === 0 ? "Получен" : index === 1 ? "В обработке" : "Требуется действие"}
                  </span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className={styles.historyFooter}>
                    <Link className={styles.utilityLink} href={getProductRoute(product.id)}>
                      Открыть товар
                    </Link>
                    <span className={styles.smallLabel}>{product.source}</span>
                  </div>
                </div>
                <strong className={styles.historyPrice}>{product.price}</strong>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.panel} aria-labelledby="status-title">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.sectionLabel}>Статусы</span>
              <h2 id="status-title">Что означает статус</h2>
            </div>
          </div>
          <div className={styles.statusRail}>
            {["Ожидает оплаты", "Оплачен", "В обработке", "Требуется действие", "Получен", "Ошибка", "Возврат"].map((status) => (
              <div className={styles.statusRow} key={status}>
                <strong>{status}</strong>
                <span>Пояснение показывается рядом с заказом.</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
