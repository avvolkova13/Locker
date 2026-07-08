"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import {
  homeCarouselFilters,
  homeCarouselProducts,
} from "@/mock-data/home-carousel";
import type {
  HomeCarouselCategory,
  HomeCarouselProduct,
} from "@/types/home-carousel";
import {
  addCartItem,
  COMMERCE_CHANGE_EVENT,
  formatLockerExchangeRate,
  formatProductPrice,
  formatProductRubApprox,
  getCartItems,
  getProductPaymentAmountLk,
} from "@/utils/demo-commerce";
import {
  getFloatValue,
  productHasSouvenir,
  productHasStatTrak,
} from "@/utils/product-info";
import styles from "./catalog-page.module.css";

type CatalogCategory = HomeCarouselCategory | "all";
type SortMode = "popular" | "new" | "price-asc" | "price-desc" | "float-asc";
type CatalogFilter = "all" | string;

type CatalogPageProps = {
  initialCategory?: CatalogCategory;
};

const CATALOG_PAGE_SIZE = 18;
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

function parseSales(stat: string) {
  const numeric = stat.replace(/\s/g, "").match(/\d+/);

  return numeric ? Number(numeric[0]) : 0;
}

function getUniqueOptions(selector: (product: HomeCarouselProduct) => string) {
  return Array.from(new Set(homeCarouselProducts.map(selector).filter(Boolean))).sort((first, second) =>
    first.localeCompare(second, "ru"),
  );
}

function getAvailabilityLabel(value: HomeCarouselProduct["availability"]) {
  const labels: Record<HomeCarouselProduct["availability"], string> = {
    available: "В наличии",
    instant: "Автовыдача",
    limited: "Ограничено",
    preorder: "Под заказ",
  };

  return labels[value];
}

function parseFilterNumber(value: string) {
  const normalizedValue = value.replace(/\s/g, "").replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}

function toggleFilterValue(value: string, selectedValues: string[]) {
  return selectedValues.includes(value)
    ? selectedValues.filter((item) => item !== value)
    : [...selectedValues, value];
}

export function CatalogPage({ initialCategory = "all" }: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>(initialCategory);
  const [cartCount, setCartCount] = useState(0);
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState<CatalogFilter>("all");
  const [collection, setCollection] = useState<CatalogFilter>("all");
  const [floatFrom, setFloatFrom] = useState("");
  const [floatTo, setFloatTo] = useState("");
  const [onlySouvenir, setOnlySouvenir] = useState(false);
  const [onlyStatTrak, setOnlyStatTrak] = useState(false);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [productType, setProductType] = useState<CatalogFilter>("all");
  const [rarities, setRarities] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [wears, setWears] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [cartToast, setCartToast] = useState<string | null>(null);
  const loadMoreTimeoutRef = useRef<number | null>(null);
  const cartToastTimeoutRef = useRef<number | null>(null);
  const router = useRouter();

  const availabilities = useMemo(
    () => Array.from(new Set(homeCarouselProducts.map((product) => product.availability))),
    [],
  );
  const collections = useMemo(() => getUniqueOptions((product) => product.collection), []);
  const productTypes = useMemo(() => getUniqueOptions((product) => product.productType), []);
  const rarityOptions = useMemo(() => getUniqueOptions((product) => product.rarity), []);
  const wearOptions = useMemo(() => getUniqueOptions((product) => product.wear), []);
  const priceFromValue = useMemo(() => parseFilterNumber(priceFrom), [priceFrom]);
  const priceToValue = useMemo(() => parseFilterNumber(priceTo), [priceTo]);
  const floatFromValue = useMemo(() => parseFilterNumber(floatFrom), [floatFrom]);
  const floatToValue = useMemo(() => parseFilterNumber(floatTo), [floatTo]);

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
      .filter((product) => availability === "all" || product.availability === availability)
      .filter((product) => collection === "all" || product.collection === collection)
      .filter((product) => productType === "all" || product.productType === productType)
      .filter((product) => rarities.length === 0 || rarities.includes(product.rarity))
      .filter((product) => wears.length === 0 || wears.includes(product.wear))
      .filter((product) => {
        const price = getProductPaymentAmountLk(product);

        if (priceFromValue !== null && price < priceFromValue) {
          return false;
        }

        if (priceToValue !== null && price > priceToValue) {
          return false;
        }

        return true;
      })
      .filter((product) => {
        const floatValue = getFloatValue(product);

        if (floatFromValue !== null && (floatValue === null || floatValue < floatFromValue)) {
          return false;
        }

        if (floatToValue !== null && (floatValue === null || floatValue > floatToValue)) {
          return false;
        }

        return true;
      })
      .filter((product) => !onlyStatTrak || productHasStatTrak(product))
      .filter((product) => !onlySouvenir || productHasSouvenir(product))
      .filter((product) => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          product.name,
          product.description,
          product.categoryLabel,
          product.collection,
          product.productType,
          product.rarity,
          product.stat,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((first, second) => {
        if (sortMode === "price-asc") {
          return getProductPaymentAmountLk(first) - getProductPaymentAmountLk(second);
        }

        if (sortMode === "price-desc") {
          return getProductPaymentAmountLk(second) - getProductPaymentAmountLk(first);
        }

        if (sortMode === "new") {
          return homeCarouselProducts.indexOf(second) - homeCarouselProducts.indexOf(first);
        }

        if (sortMode === "float-asc") {
          return (getFloatValue(first) ?? Number.POSITIVE_INFINITY) - (getFloatValue(second) ?? Number.POSITIVE_INFINITY);
        }

        return parseSales(second.stat) - parseSales(first.stat);
      });
  }, [
    activeCategory,
    availability,
    collection,
    floatFromValue,
    floatToValue,
    onlySouvenir,
    onlyStatTrak,
    priceFromValue,
    priceToValue,
    productType,
    query,
    rarities,
    sortMode,
    wears,
  ]);

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
  }, [
    activeCategory,
    availability,
    collection,
    floatFrom,
    floatTo,
    onlySouvenir,
    onlyStatTrak,
    priceFrom,
    priceTo,
    productType,
    query,
    rarities,
    sortMode,
    wears,
  ]);

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

  function openProduct(product: HomeCarouselProduct) {
    router.push(getProductRoute(product.id));
  }

  function handleProductKeyDown(event: KeyboardEvent<HTMLElement>, product: HomeCarouselProduct) {
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openProduct(product);
  }

  function handleCartButtonClick(event: MouseEvent<HTMLButtonElement>, product: HomeCarouselProduct) {
    event.stopPropagation();
    handleAddToCart(product);
  }

  function resetFilters() {
    setAvailability("all");
    setCollection("all");
    setFloatFrom("");
    setFloatTo("");
    setOnlySouvenir(false);
    setOnlyStatTrak(false);
    setPriceFrom("");
    setPriceTo("");
    setProductType("all");
    setQuery("");
    setRarities([]);
    setSortMode("popular");
    setWears([]);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="catalog-title">
        <div>
          <div className={styles.heroTop}>
            <Link className={styles.backLink} href={APP_ROUTES.home}>
              ← На главную
            </Link>
            <span className={styles.currencyContext} title="Локерсы — внутренняя валюта Locker">
              Локерсы · {formatLockerExchangeRate()}
            </span>
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

        <div className={styles.typeBar} aria-label="Типы предметов">
          <button
            data-active={productType === "all" || undefined}
            onClick={() => setProductType("all")}
            type="button"
          >
            Все типы
          </button>
          {productTypes.map((item) => (
            <button
              data-active={productType === item || undefined}
              key={item}
              onClick={() => setProductType(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.results} aria-label="Товары">
        <div className={styles.catalogBody}>
          <aside className={styles.filterPanel} aria-label="Расширенные фильтры">
            <div className={styles.filterBlock}>
              <div className={styles.filterTitle}>
                <strong>Цена</strong>
                <span>LK</span>
              </div>
              <div className={styles.rangeInputs}>
                <input
                  aria-label="Цена от"
                  inputMode="numeric"
                  onChange={(event) => setPriceFrom(event.target.value.replace(/[^\d\s]/g, ""))}
                  placeholder="Цена от"
                  value={priceFrom}
                />
                <input
                  aria-label="Цена до"
                  inputMode="numeric"
                  onChange={(event) => setPriceTo(event.target.value.replace(/[^\d\s]/g, ""))}
                  placeholder="Цена до"
                  value={priceTo}
                />
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterTitle}>
                <strong>Тип доставки</strong>
              </div>
              <div className={styles.radioList}>
                <label>
                  <input checked={availability === "all"} name="delivery" onChange={() => setAvailability("all")} type="radio" />
                  <span>Все</span>
                </label>
                {availabilities.map((item) => (
                  <label key={item}>
                    <input checked={availability === item} name="delivery" onChange={() => setAvailability(item)} type="radio" />
                    <span>{getAvailabilityLabel(item)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterTitle}>
                <strong>Редкость</strong>
              </div>
              <div className={styles.checkList}>
                {rarityOptions.map((item) => (
                  <label key={item}>
                    <input
                      checked={rarities.includes(item)}
                      onChange={() => setRarities((currentValue) => toggleFilterValue(item, currentValue))}
                      type="checkbox"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterTitle}>
                <strong>Износ</strong>
              </div>
              <div className={styles.checkList}>
                {wearOptions.map((item) => (
                  <label key={item}>
                    <input
                      checked={wears.includes(item)}
                      onChange={() => setWears((currentValue) => toggleFilterValue(item, currentValue))}
                      type="checkbox"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterBlock}>
              <div className={styles.filterTitle}>
                <strong>Float</strong>
              </div>
              <div className={styles.rangeInputs}>
                <input
                  aria-label="Float от"
                  inputMode="decimal"
                  onChange={(event) => setFloatFrom(event.target.value.replace(/[^\d.,]/g, ""))}
                  placeholder="от 0.00"
                  value={floatFrom}
                />
                <input
                  aria-label="Float до"
                  inputMode="decimal"
                  onChange={(event) => setFloatTo(event.target.value.replace(/[^\d.,]/g, ""))}
                  placeholder="до 1.00"
                  value={floatTo}
                />
              </div>
            </div>

            <label className={styles.field}>
              <span>Коллекция</span>
              <select onChange={(event) => setCollection(event.target.value)} value={collection}>
                <option value="all">Все коллекции</option>
                {collections.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.filterBlock}>
              <div className={styles.filterTitle}>
                <strong>Особенности</strong>
              </div>
              <div className={styles.checkList}>
                <label>
                  <input checked={onlyStatTrak} onChange={(event) => setOnlyStatTrak(event.target.checked)} type="checkbox" />
                  <span>StatTrak</span>
                </label>
                <label>
                  <input checked={onlySouvenir} onChange={(event) => setOnlySouvenir(event.target.checked)} type="checkbox" />
                  <span>Souvenir</span>
                </label>
              </div>
            </div>

            <button className={styles.resetButton} onClick={resetFilters} type="button">
              Сбросить фильтры
            </button>
          </aside>

          <div className={styles.resultsColumn}>
            <div className={styles.marketToolbar}>
              <label className={styles.searchField}>
                <span>Поиск</span>
                <input
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="AK-47, Dragon Lore, Rust"
                  type="search"
                  value={query}
                />
              </label>

              <label className={styles.sortField}>
                <span>Сортировка</span>
                <select onChange={(event) => setSortMode(event.target.value as SortMode)} value={sortMode}>
                  <option value="popular">Популярные</option>
                  <option value="new">Новинки</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="float-asc">Float: минимальный</option>
                </select>
              </label>
            </div>

            <div className={styles.resultsHeader}>
              <span>{filteredProducts.length} позиций</span>
              <p>Откройте карточку, чтобы проверить цену в LK, наличие, float и параметры предмета.</p>
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
                      role="link"
                      style={{ "--product-accent": product.accent } as CSSProperties}
                      tabIndex={0}
                      onClick={() => openProduct(product)}
                      onKeyDown={(event) => handleProductKeyDown(event, product)}
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
                          <span>{product.productType}</span>
                          <span>{getAvailabilityLabel(product.availability)}</span>
                        </div>
                        <h2>
                          <Link href={getProductRoute(product.id)}>{product.name}</Link>
                        </h2>
                        <p>{product.description}</p>
                        <div className={styles.productBottom}>
                          <div>
                            <strong>{formatProductPrice(product)}</strong>
                            <em>{formatProductRubApprox(product)}</em>
                            <span>{product.stat}</span>
                          </div>
                          <button
                            aria-label={`Добавить в корзину: ${product.name}`}
                            className={styles.productCartButton}
                            type="button"
                            onClick={(event) => handleCartButtonClick(event, product)}
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
                <p>Измените категорию, фильтры или поисковый запрос.</p>
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
          </div>
        </div>
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
