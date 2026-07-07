"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import {
  homeCarouselFilters,
  homeCarouselProducts,
} from "@/mock-data/home-carousel";
import type {
  HomeCarouselCategory,
  HomeCarouselProduct,
} from "@/types/home-carousel";
import { addCartItem, COMMERCE_CHANGE_EVENT, getCartItems } from "@/utils/demo-commerce";
import styles from "./catalog-page.module.css";

type CatalogCategory = HomeCarouselCategory | "all";
type SortMode = "popular" | "price-asc" | "price-desc" | "name";
type SourceFilter = "all" | string;

type CatalogPageProps = {
  initialCategory?: CatalogCategory;
};

const CATALOG_PAGE_SIZE = 14;
const CATALOG_LOAD_DELAY_MS = 280;
const CART_TOAST_DURATION_MS = 2600;

function getCatalogTile(index: number, itemCount = Number.POSITIVE_INFINITY) {
  const positionInGroup = index % 9;
  const group = Math.floor(index / 9) % 3;
  const remainingInCurrentView = itemCount - index;

  if (positionInGroup === 0 && remainingInCurrentView >= 5) {
    return {
      layout: group === 0 ? "feature-start" : group === 1 ? "feature-end" : "feature-middle",
      size: "featured",
    };
  }

  return {
    layout: "small",
    size: "small",
  };
}

function placeImageProductsOnFeaturedTiles(products: HomeCarouselProduct[]) {
  const productsWithImages = products.filter((product) => Boolean(product.imageUrl));
  const otherProducts = products.filter((product) => !product.imageUrl);
  const arrangedProducts: HomeCarouselProduct[] = [];
  let imageIndex = 0;
  let otherIndex = 0;

  for (let index = 0; index < products.length; index += 1) {
    const tile = getCatalogTile(index, products.length);
    const featuredProduct = productsWithImages[imageIndex];
    const regularProduct = otherProducts[otherIndex] ?? productsWithImages[imageIndex];

    if (tile.size === "featured" && featuredProduct) {
      arrangedProducts.push(featuredProduct);
      imageIndex += 1;
      continue;
    }

    if (regularProduct) {
      arrangedProducts.push(regularProduct);

      if (regularProduct.imageUrl) {
        imageIndex += 1;
      } else {
        otherIndex += 1;
      }
    }
  }

  return arrangedProducts;
}

const categoryLabels = [
  { label: "Все", value: "all" },
  ...homeCarouselFilters,
] satisfies Array<{ label: string; value: CatalogCategory }>;

function parsePrice(price: string) {
  const numeric = price
    .replace(/\s/g, "")
    .replace(",", ".")
    .match(/\d+(\.\d+)?/);

  return numeric ? Number(numeric[0]) : 0;
}

function parseSales(stat: string) {
  const numeric = stat.replace(/\s/g, "").match(/\d+/);

  return numeric ? Number(numeric[0]) : 0;
}

export function CatalogPage({ initialCategory = "all" }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>(initialCategory);
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [onlyWithImage, setOnlyWithImage] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const loadMoreTimeoutRef = useRef<number | null>(null);
  const cartToastTimeoutRef = useRef<number | null>(null);

  const sources = useMemo(
    () => Array.from(new Set(homeCarouselProducts.map((product) => product.source))).sort(),
    [],
  );

  useEffect(() => {
    function updateCartCount() {
      setCartCount(getCartItems().reduce((total, item) => total + item.quantity, 0));
    }

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener(COMMERCE_CHANGE_EVENT, updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener(COMMERCE_CHANGE_EVENT, updateCartCount);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return homeCarouselProducts
      .filter((product) => activeCategory === "all" || product.category === activeCategory)
      .filter((product) => source === "all" || product.source === source)
      .filter((product) => !onlyWithImage || Boolean(product.imageUrl))
      .filter((product) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          product.name,
          product.description,
          product.categoryLabel,
          product.source,
          product.stat,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((first, second) => {
        if (sortMode === "price-asc") {
          return parsePrice(first.price) - parsePrice(second.price);
        }

        if (sortMode === "price-desc") {
          return parsePrice(second.price) - parsePrice(first.price);
        }

        if (sortMode === "name") {
          return first.name.localeCompare(second.name, "ru");
        }

        return parseSales(second.stat) - parseSales(first.stat);
      });
  }, [activeCategory, onlyWithImage, query, sortMode, source]);

  const arrangedProducts = useMemo(
    () => placeImageProductsOnFeaturedTiles(filteredProducts),
    [filteredProducts],
  );

  useEffect(() => {
    if (loadMoreTimeoutRef.current) {
      window.clearTimeout(loadMoreTimeoutRef.current);
      loadMoreTimeoutRef.current = null;
    }

    setVisibleCount(CATALOG_PAGE_SIZE);
    setIsLoadingMore(false);
  }, [activeCategory, onlyWithImage, query, sortMode, source]);

  useEffect(() => () => {
    if (loadMoreTimeoutRef.current) {
      window.clearTimeout(loadMoreTimeoutRef.current);
    }

    if (cartToastTimeoutRef.current) {
      window.clearTimeout(cartToastTimeoutRef.current);
    }
  }, []);

  const visibleProducts = useMemo(
    () => arrangedProducts.slice(0, visibleCount),
    [arrangedProducts, visibleCount],
  );

  const hasMoreProducts = visibleProducts.length < arrangedProducts.length;

  function handleLoadMore() {
    if (isLoadingMore || !hasMoreProducts) {
      return;
    }

    setIsLoadingMore(true);

    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((currentCount) => Math.min(currentCount + CATALOG_PAGE_SIZE, arrangedProducts.length));
      setIsLoadingMore(false);
      loadMoreTimeoutRef.current = null;
    }, CATALOG_LOAD_DELAY_MS);
  }

  function handleAddToCart(product: HomeCarouselProduct) {
    addCartItem(product.id);
    setAddedProductId(product.id);
    setCartToast(product.name);

    if (cartToastTimeoutRef.current) {
      window.clearTimeout(cartToastTimeoutRef.current);
    }

    cartToastTimeoutRef.current = window.setTimeout(() => {
      setCartToast(null);
      cartToastTimeoutRef.current = null;
    }, CART_TOAST_DURATION_MS);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="catalog-title">
        <div>
          <div className={styles.heroTop}>
            <Link className={styles.backLink} href={APP_ROUTES.home}>
              ← На главную
            </Link>
            <Link className={styles.cartQuickLink} href={APP_ROUTES.cart}>
              <span>Корзина</span>
              <strong>{cartCount}</strong>
            </Link>
          </div>
          <h1 id="catalog-title">КАТАЛОГ LOCKER</h1>
        </div>
      </section>

      <section className={styles.controls} aria-label="Фильтры каталога">
        <div className={styles.categoryBar} role="tablist" aria-label="Категории">
          {categoryLabels.map((category) => (
            <button
              aria-selected={activeCategory === category.value}
              data-active={activeCategory === category.value || undefined}
              key={category.value}
              onClick={() => setActiveCategory(category.value)}
              role="tab"
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className={styles.filterGrid}>
          <label className={styles.field}>
            <span>Поиск</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="AK-47, ChatGPT, Rust"
              type="search"
              value={query}
            />
          </label>

          <label className={styles.field}>
            <span>Источник</span>
            <select onChange={(event) => setSource(event.target.value)} value={source}>
              <option value="all">Все источники</option>
              {sources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Сортировка</span>
            <select onChange={(event) => setSortMode(event.target.value as SortMode)} value={sortMode}>
              <option value="popular">Сначала популярные</option>
              <option value="price-asc">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="name">По названию</option>
            </select>
          </label>

          <label className={styles.toggle}>
            <input
              checked={onlyWithImage}
              onChange={(event) => setOnlyWithImage(event.target.checked)}
              type="checkbox"
            />
            <span>Только с изображением товара</span>
          </label>
        </div>
      </section>

      <section className={styles.results} aria-label="Товары">
        <div className={styles.resultsHeader}>
          <span>{filteredProducts.length} позиций</span>
          <p>Откройте карточку, чтобы проверить цену, условия выдачи и данные, которые могут понадобиться.</p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {visibleProducts.map((product, index) => {
              const tile = getCatalogTile(index, visibleProducts.length);

              return (
                <article
                  className={styles.productCard}
                  data-layout={tile.layout}
                  data-size={tile.size}
                  key={product.id}
                  style={{ "--product-accent": product.accent } as CSSProperties}
                >
                  <Link className={styles.productVisual} href={getProductRoute(product.id)}>
                    {product.imageUrl ? (
                      <Image
                        alt={product.imageAlt}
                        fill
                        sizes={
                          tile.size === "featured"
                            ? "(max-width: 700px) 94vw, (max-width: 1100px) 60vw, 48vw"
                            : "(max-width: 700px) 94vw, (max-width: 1100px) 30vw, 24vw"
                        }
                        src={product.imageUrl}
                      />
                    ) : (
                      <span>{product.visualCode}</span>
                    )}
                  </Link>
                  <div className={styles.productInfo}>
                    <div className={styles.productMeta}>
                      <span>{product.categoryLabel}</span>
                      <span>{product.source}</span>
                    </div>
                    <h2>
                      <Link href={getProductRoute(product.id)}>{product.name}</Link>
                    </h2>
                    <p>{product.description}</p>
                    <div className={styles.productBottom}>
                      <div>
                        <strong>{product.price}</strong>
                        <span>{product.stat}</span>
                      </div>
                      <button
                        aria-label={`Добавить в корзину: ${product.name}`}
                        className={styles.productCartButton}
                        type="button"
                        onClick={() => handleAddToCart(product)}
                      >
                        {addedProductId === product.id ? "Добавлено" : "В корзину"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>По этим параметрам ничего не найдено</h2>
            <p>Измените категорию, источник или поисковый запрос.</p>
          </div>
        )}

        {filteredProducts.length > 0 ? (
          <div className={styles.paginationPanel}>
            {hasMoreProducts ? (
              <button
                className={styles.loadMoreButton}
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                type="button"
              >
                {isLoadingMore ? "Загружаем товары…" : "Показать ещё"}
              </button>
            ) : (
              <p className={styles.endState}>Показаны все товары</p>
            )}
          </div>
        ) : null}
      </section>

      {cartToast ? (
        <div className={styles.cartToast} role="status">
          <span>Добавлено в корзину</span>
          <strong>{cartToast}</strong>
          <Link href={APP_ROUTES.cart}>Перейти в корзину</Link>
        </div>
      ) : null}
    </main>
  );
}
