import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import { ProductActions, ProductCartQuickLink } from "@/features/account/product-actions";
import { homeCarouselProducts } from "@/mock-data/home-carousel";
import type { HomeCarouselProduct } from "@/types/home-carousel";
import { formatLockerExchangeRate, formatProductPrice, formatProductRubApprox } from "@/utils/demo-commerce";
import {
  getAvailabilityText,
  getFloatPosition,
  getFloatValue,
  getProductDescription,
  getProductDisplayName,
  getProductFamily,
  getWearLabel,
  getWearShort,
  WEAR_MARKS,
} from "@/utils/product-info";
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
  const relatedProducts = getRelatedProducts(product);
  const productFamily = getProductFamily(product);
  const productDisplayName = getProductDisplayName(product);
  const wearShort = getWearShort(product);
  const wearLabel = getWearLabel(product);
  const floatValue = getFloatValue(product);
  const floatPosition = getFloatPosition(product);
  const productDescription = getProductDescription(product);
  const summarySpecs = [
    ["Состояние", wearLabel],
    ["Износ", floatValue === null ? product.wear : floatValue.toFixed(6)],
    ["Редкость", product.rarity],
    ["Коллекция", product.collection],
  ];

  return (
    <main className={styles.page} style={{ "--product-accent": product.accent } as CSSProperties}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.backLink} href={APP_ROUTES.catalog}>
            ← В каталог
          </Link>
          <span className={styles.currencyContext} title="Локерсы — внутренняя валюта Locker">
            Локерсы · {formatLockerExchangeRate()}
          </span>
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
            <div>
              <span className={styles.productFamily}>{productFamily}</span>
              <h1 id="product-title">{productDisplayName}</h1>
              <div className={styles.meta}>
                <span>{product.categoryLabel}</span>
                <span>{product.productType}</span>
                {wearShort ? <span data-tone="wear">{wearShort}</span> : null}
                <span data-tone="rarity">{product.rarity}</span>
              </div>
            </div>

            <div className={styles.purchasePanel}>
              <div className={styles.priceBox}>
                <span className={styles.priceLabel}>Цена</span>
                <strong>{formatProductPrice(product)}</strong>
                <em className={styles.priceApprox}>{formatProductRubApprox(product)}</em>
              </div>
            </div>

            <dl className={styles.summarySpecs}>
              {summarySpecs.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>

            <section className={styles.descriptionCard} aria-labelledby="description-title">
              <h2 id="description-title">Описание</h2>
              <p>{productDescription}</p>
            </section>

            {floatValue !== null && floatPosition !== null ? (
              <section className={styles.wearPanel} aria-label="Шкала износа">
                <div className={styles.wearHeader}>
                  <span>Износ: {floatValue.toFixed(6)}</span>
                  <strong>{wearLabel}</strong>
                </div>
                <div className={styles.wearTrack}>
                  <span style={{ left: `${floatPosition}%` }} />
                </div>
                <div className={styles.wearMarks}>
                  {WEAR_MARKS.map((mark) => (
                    <span key={mark.label}>{mark.label}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <div className={styles.ctaCluster}>
              <ProductActions buttonLabel={`Купить — ${formatProductPrice(product)}`} productId={product.id} />
            </div>

            <p className={styles.stockLine}>{getAvailabilityText(product)}</p>
          </div>
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
                  <strong>{formatProductPrice(item)}</strong>
                  <em>{formatProductRubApprox(item)}</em>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
