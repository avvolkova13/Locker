import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import { ProductActions, ProductCartQuickLink } from "@/features/account/product-actions";
import { homeCarouselProducts } from "@/mock-data/home-carousel";
import type { HomeCarouselProduct } from "@/types/home-carousel";
import styles from "./product-page.module.css";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

function getProduct(productId: string) {
  return homeCarouselProducts.find((product) => product.id === productId);
}

function getServiceDetails(product: HomeCarouselProduct) {
  if (product.category === "steam-wallet") {
    return {
      delivery: "Автовыдача после оплаты",
      requirement: "Понадобится Steam-профиль или данные, указанные в карточке услуги.",
      check: "Проверьте регион и формат услуги до покупки.",
      result: "Начисление или доступ к услуге отображается в Steam.",
    };
  }

  if (product.category === "chatgpt") {
    return {
      delivery: "Доступ выдаётся после оплаты",
      requirement: "Проверьте срок, формат доступа и условия входа перед покупкой.",
      check: "Не меняйте данные аккаунта, если это запрещено условиями услуги.",
      result: "После выдачи вы получаете данные или инструкцию по использованию.",
    };
  }

  return {
    delivery: "Передача через Steam",
    requirement: "Могут понадобиться данные Steam. Точный способ будет показан до оплаты.",
    check: "Проверьте название предмета, состояние и цену до оплаты.",
    result: "После обработки предмет появится в вашем Steam-инвентаре.",
  };
}

function getProductSpecs(product: HomeCarouselProduct) {
  const commonSpecs = [
    ["Категория", product.categoryLabel],
    ["Источник данных", product.source],
    ["Статус", product.stat],
  ];

  if (product.category === "steam-wallet") {
    return [
      ...commonSpecs,
      ["Формат", "Пополнение или услуга Steam"],
      ["Выдача", "После оплаты"],
    ];
  }

  if (product.category === "chatgpt") {
    return [
      ...commonSpecs,
      ["Формат", "Подписка или аккаунт"],
      [
        "Срок",
        product.name.includes("30") || product.name.includes("месяц") ? "Около 30 дней" : "Указан в условиях",
      ],
    ];
  }

  return [
    ...commonSpecs,
    ["Игра", product.categoryLabel],
    ["Получение", "Через Steam"],
  ];
}

function getRelatedProducts(product: HomeCarouselProduct) {
  return homeCarouselProducts
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);
}

export function generateStaticParams() {
  return homeCarouselProducts.map((product) => ({
    productId: product.id,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getProduct(productId);

  if (!product) {
    return {
      title: "Услуга не найдена | Locker",
    };
  }

  return {
    title: `${product.name} | Locker`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const product = getProduct(productId);

  if (!product) {
    notFound();
  }

  const details = getServiceDetails(product);
  const specs = getProductSpecs(product);
  const relatedProducts = getRelatedProducts(product);

  return (
    <main className={styles.page} style={{ "--product-accent": product.accent } as CSSProperties}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.backLink} href={APP_ROUTES.catalog}>
            ← В каталог
          </Link>
          <ProductCartQuickLink className={styles.cartQuickLink} badgeClassName={styles.cartQuickBadge} />
        </div>

        <nav className={styles.breadcrumbs} aria-label="Навигация">
          <Link href={APP_ROUTES.home}>Главная</Link>
          <span>/</span>
          <Link href={APP_ROUTES.catalog}>Каталог</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className={styles.hero} aria-labelledby="product-title">
          <div className={styles.mediaPanel}>
            <div className={styles.productMedia}>
              {product.imageUrl ? (
                <Image
                  alt={product.imageAlt}
                  className={styles.productImage}
                  fill
                  loading="eager"
                  priority
                  sizes="(max-width: 760px) 92vw, 48vw"
                  src={product.imageUrl}
                />
              ) : (
                <span>{product.visualCode}</span>
              )}
            </div>
          </div>

          <div className={styles.summary}>
            <div className={styles.meta}>
              <span>{product.categoryLabel}</span>
              <span>{product.source}</span>
              {product.badge ? <span>{product.badge}</span> : null}
            </div>

            <h1 id="product-title">{product.name}</h1>
            <p>{product.description}</p>

            <div className={styles.purchasePanel}>
              <div>
                <span className={styles.priceLabel}>Цена</span>
                <strong>{product.price}</strong>
                <span className={styles.stat}>{product.stat}</span>
              </div>
              <ProductActions productId={product.id} />
            </div>

            <div className={styles.sourceNote}>
              <span>Цена, изображение и описание проверяются по утверждённому источнику данных.</span>
            </div>
          </div>
        </section>

        <section className={styles.specs} aria-label="Параметры товара">
          <div>
            <span>Параметры</span>
          </div>
          <dl>
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.detailsGrid} aria-label="Информация об услуге">
          <article>
            <span>Выдача</span>
            <h2>{details.delivery}</h2>
            <p>{details.result}</p>
          </article>
          <article>
            <span>Что нужно</span>
            <h2>Данные для выполнения</h2>
            <p>{details.requirement}</p>
          </article>
          <article>
            <span>Проверка</span>
            <h2>Перед оплатой</h2>
            <p>{details.check}</p>
          </article>
        </section>

        <section className={styles.process} aria-labelledby="process-title">
          <div>
            <h2 id="process-title">Как это работает</h2>
          </div>
          <ol>
            <li>
              <strong>Проверьте услугу</strong>
              <p>Сверьте название, категорию, цену и условия выдачи.</p>
            </li>
            <li>
              <strong>Добавьте в корзину</strong>
              <p>Пополните баланс картой или через СБП. Покупка списывается с баланса Locker.</p>
            </li>
            <li>
              <strong>Следите за статусом</strong>
              <p>После оплаты статус заказа будет обновляться в профиле.</p>
            </li>
          </ol>
        </section>

        {relatedProducts.length > 0 ? (
          <section className={styles.related} aria-labelledby="related-title">
            <div className={styles.relatedHeader}>
              <h2 id="related-title">Похожие позиции</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((item) => (
                <Link
                  className={styles.relatedCard}
                  href={getProductRoute(item.id)}
                  key={item.id}
                  style={{ "--product-accent": item.accent } as CSSProperties}
                >
                  <span>{item.categoryLabel}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <strong>{item.price}</strong>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
