"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
} from "react";
import { LockerButton } from "@/components/shared/locker-button";
import { APP_ROUTES, getProductRoute } from "@/constants/routes";
import {
  homeCarouselFilters,
  homeCarouselProducts,
} from "@/mock-data/home-carousel";
import type {
  HomeCarouselCategory,
  HomeCarouselProduct,
} from "@/types/home-carousel";
import styles from "./home-page.module.css";

const trackRepeatCount = 9;
const trackCenterRepeat = Math.floor(trackRepeatCount / 2);
const carouselTransitionMs = 1500;
const initialTrackIndex =
  homeCarouselProducts.filter((product) => product.category === "steam-wallet").length * trackCenterRepeat;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getRelativeOffset(index: number, activeIndex: number, length: number) {
  let offset = index - activeIndex;

  if (offset > length / 2) {
    offset -= length;
  }

  if (offset < -length / 2) {
    offset += length;
  }

  return offset;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutSine(value: number) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function getOrbitStyle(
  visualOffset: number,
  productAccent: string,
  motionDirection: number,
): CSSProperties {
  const clampedOffset = clamp(visualOffset, -4.15, 4.15);
  const angle = clampedOffset * 0.64;
  const sin = Math.sin(angle);
  const centerWeight = Math.exp(-((Math.abs(clampedOffset) * 1.04) ** 2));
  const travelBias = motionDirection === 0
    ? 0
    : clamp(1 - Math.abs(clampedOffset) * 1.26, 0, 1) * Math.sign(clampedOffset) * motionDirection * 0.16;
  const frontDepth = clamp(centerWeight + travelBias, 0, 1);
  const sideDepth = 1 - frontDepth;
  const absOffset = Math.abs(clampedOffset);
  const xVw = sin * 66;
  const yPx = 14 + sideDepth * 126 + Math.max(0, absOffset - 2.45) * 34;
  const zPx = -650 + frontDepth * 820;
  const scale = 0.56 + frontDepth * 0.49 - Math.max(0, absOffset - 2.8) * 0.04;
  const rotateZ = -4.5 + sin * 12;
  const rotateY = -sin * 72;
  const rotateX = sideDepth * 4.5;
  const opacity = clamp(0.18 + frontDepth ** 1.25 * 0.82, 0, 1);
  const brightness = clamp(0.28 + frontDepth * 0.72, 0.28, 1);
  const blur = clamp(sideDepth * 1.7 + Math.max(0, absOffset - 3) * 0.8, 0, 2.4);
  const tiltVarX = absOffset < 0.55 ? "--active-tilt-x" : "--side-tilt-x";
  const tiltVarY = absOffset < 0.55 ? "--active-tilt-y" : "--side-tilt-y";

  return {
    "--float-delay": `${(-absOffset * 0.42).toFixed(2)}s`,
    "--product-accent": productAccent,
    filter: `blur(${blur.toFixed(2)}px) brightness(${brightness.toFixed(2)}) saturate(${(0.82 + frontDepth * 0.18).toFixed(2)})`,
    opacity,
    transform: `translate3d(calc(-50% + ${xVw.toFixed(2)}vw), ${yPx.toFixed(2)}px, ${zPx.toFixed(2)}px) rotateZ(${rotateZ.toFixed(2)}deg) rotateY(calc(${rotateY.toFixed(2)}deg + var(${tiltVarY}, 0deg))) rotateX(calc(${rotateX.toFixed(2)}deg + var(${tiltVarX}, 0deg))) scale(${scale.toFixed(3)})`,
    zIndex: Math.round(40 + frontDepth * 92 + Math.sign(clampedOffset) * motionDirection * 6 - absOffset),
  } as CSSProperties;
}

function ProductArtwork({ product }: { product: HomeCarouselProduct }) {
  return (
    <div
      className={styles.carouselArtwork}
      data-has-image={Boolean(product.imageUrl) || undefined}
      style={{ "--product-accent": product.accent } as CSSProperties}
      aria-label={product.imageUrl ? undefined : product.imageAlt}
      role={product.imageUrl ? undefined : "img"}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" />
      ) : (
        <span>{product.visualCode}</span>
      )}
    </div>
  );
}

function ProductCard({
  isActive,
  product,
}: {
  isActive: boolean;
  product: HomeCarouselProduct;
}) {
  return (
    <article className={styles.carouselCard} data-active={isActive || undefined}>
      <ProductArtwork product={product} />
      <div className={styles.carouselCardBody}>
        <div className={styles.carouselMeta}>
          <span>{product.categoryLabel}</span>
          {product.badge ? <span>{product.badge}</span> : null}
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className={styles.carouselPurchase}>
          <strong>{product.price}</strong>
          <span>{product.stat}</span>
        </div>
      </div>
    </article>
  );
}

export function ProductCarousel() {
  const [activeCategory, setActiveCategory] = useState<HomeCarouselCategory>("steam-wallet");
  const [activeTrackIndex, setActiveTrackIndex] = useState(initialTrackIndex);
  const [motionTrackIndex, setMotionTrackIndex] = useState(initialTrackIndex);
  const [dragProgress, setDragProgress] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [motionDirection, setMotionDirection] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const motionTrackIndexRef = useRef(initialTrackIndex);
  const dragRef = useRef({
    pointerId: -1,
    progress: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    hasDragged: false,
  });
  const suppressClickRef = useRef(false);

  const products = useMemo(
    () => homeCarouselProducts.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  const activeIndex = wrapIndex(activeTrackIndex, products.length);

  const trackItems = useMemo(
    () =>
      Array.from({ length: products.length * trackRepeatCount }, (_, trackIndex) => ({
        product: products[trackIndex % products.length],
        productIndex: trackIndex % products.length,
        trackIndex,
      })),
    [products],
  );

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const centeredTrackIndex = products.length * trackCenterRepeat;

    setIsMoving(false);
    setMotionDirection(0);
    setIsNormalizing(true);
    setDragProgress(0);
    setActiveTrackIndex(centeredTrackIndex);
    setMotionTrackIndex(centeredTrackIndex);
    motionTrackIndexRef.current = centeredTrackIndex;

    const frame = window.requestAnimationFrame(() => {
      setIsNormalizing(false);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [activeCategory, products.length]);

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return undefined;
    }

    const stageElement = stage;
    let frame = 0;
    const current = {
      x: 0,
      y: 0,
    };
    const target = {
      x: 0,
      y: 0,
    };

    function animate() {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      stageElement.style.setProperty("--deck-parallax-x", `${(current.x * 18).toFixed(2)}px`);
      stageElement.style.setProperty("--deck-parallax-y", `${(current.y * 10).toFixed(2)}px`);
      stageElement.style.setProperty("--deck-tilt-y", `${(current.x * 1.35).toFixed(2)}deg`);
      stageElement.style.setProperty("--active-tilt-x", `${(-current.y * 4.2).toFixed(2)}deg`);
      stageElement.style.setProperty("--active-tilt-y", `${(current.x * 5.4).toFixed(2)}deg`);
      stageElement.style.setProperty("--side-tilt-x", `${(-current.y * 1.2).toFixed(2)}deg`);
      stageElement.style.setProperty("--side-tilt-y", `${(current.x * 1.6).toFixed(2)}deg`);
      frame = window.requestAnimationFrame(animate);
    }

    function updateTarget(event: globalThis.PointerEvent) {
      if (dragRef.current.pointerId === event.pointerId) {
        return;
      }

      const rect = stageElement.getBoundingClientRect();
      target.x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5) * 2;
      target.y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5) * 2;
    }

    function resetTarget() {
      target.x = 0;
      target.y = 0;
    }

    frame = window.requestAnimationFrame(animate);
    stageElement.addEventListener("pointermove", updateTarget);
    stageElement.addEventListener("pointerleave", resetTarget);

    return () => {
      window.cancelAnimationFrame(frame);
      stageElement.removeEventListener("pointermove", updateTarget);
      stageElement.removeEventListener("pointerleave", resetTarget);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function normalizeTrackPosition(targetTrackIndex: number) {
    const centeredTrackIndex = products.length * trackCenterRepeat + wrapIndex(targetTrackIndex, products.length);
    const shouldNormalize = targetTrackIndex < products.length * 2 || targetTrackIndex > products.length * (trackRepeatCount - 3);

    if (!shouldNormalize) {
      return;
    }

    setIsNormalizing(true);
    setActiveTrackIndex(centeredTrackIndex);
    setMotionTrackIndex(centeredTrackIndex);
    motionTrackIndexRef.current = centeredTrackIndex;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsNormalizing(false);
      });
    });
  }

  function moveToTrack(targetTrackIndex: number) {
    if (isMoving) {
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const startTrackIndex = motionTrackIndexRef.current - dragRef.current.progress;
    const distance = targetTrackIndex - startTrackIndex;
    const startedAt = performance.now();

    setIsNormalizing(false);
    setDragProgress(0);
    setIsMoving(true);
    setMotionDirection(Math.sign(distance));
    setActiveTrackIndex(targetTrackIndex);
    setMotionTrackIndex(startTrackIndex);
    motionTrackIndexRef.current = startTrackIndex;

    function animateTrack(now: number) {
      const progress = clamp((now - startedAt) / carouselTransitionMs, 0, 1);
      const easedProgress = easeInOutSine(progress);
      const nextTrackIndex = startTrackIndex + distance * easedProgress;

      motionTrackIndexRef.current = nextTrackIndex;
      setMotionTrackIndex(nextTrackIndex);

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animateTrack);
        return;
      }

      animationFrameRef.current = null;
      motionTrackIndexRef.current = targetTrackIndex;
      setMotionTrackIndex(targetTrackIndex);
      setIsMoving(false);
      setMotionDirection(0);
      normalizeTrackPosition(targetTrackIndex);
    }

    animationFrameRef.current = window.requestAnimationFrame(animateTrack);
  }

  function moveToIndex(nextIndex: number) {
    const normalizedIndex = wrapIndex(nextIndex, products.length);
    const offset = getRelativeOffset(normalizedIndex, activeIndex, products.length);

    if (offset === 0) {
      return;
    }

    moveToTrack(activeTrackIndex + offset);
  }

  function goToNext() {
    moveToTrack(activeTrackIndex + 1);
  }

  function goToPrevious() {
    moveToTrack(activeTrackIndex - 1);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isMoving || event.button !== 0) {
      return;
    }

    const target = event.target;

    if (
      target instanceof Element &&
      (target.closest(`.${styles.carouselControls}`) || target.closest(`.${styles.carouselThumbs}`) || target.closest(`.${styles.carouselFilters}`))
    ) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      progress: 0,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      hasDragged: false,
    };
    setIsDragging(true);
    motionTrackIndexRef.current = motionTrackIndex;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current.pointerId !== event.pointerId || isMoving) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    const rect = event.currentTarget.getBoundingClientRect();
    const dragWidth = Math.max(240, Math.min(560, rect.width * 0.42));
    const nextProgress = clamp(deltaX / dragWidth, -1.05, 1.05);

    dragRef.current.lastX = event.clientX;
    dragRef.current.progress = nextProgress;
    dragRef.current.hasDragged = Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 0.7;
    setDragProgress(nextProgress);
  }

  function finishDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = dragRef.current.lastX - dragRef.current.startX;
    const releaseProgress = dragRef.current.progress;
    const shouldMove = Math.abs(releaseProgress) > 0.22 || Math.abs(deltaX) > 84;
    const direction = (releaseProgress || deltaX) < 0 ? 1 : -1;

    if (dragRef.current.hasDragged) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);
    }

    dragRef.current.pointerId = -1;
    setIsDragging(false);

    if (shouldMove) {
      moveToTrack(activeTrackIndex + direction);
    } else {
      setDragProgress(0);
    }
  }

  return (
    <section className={styles.productCarouselSection} id="goods" aria-labelledby="carousel-title">
      <div className={styles.carouselHeader}>
        <p>Выберите, что нужно именно вам</p>
        <h2 id="carousel-title">Выберите, что нужно именно вам</h2>
        <div className={styles.carouselFilters} role="tablist" aria-label="Категории товаров">
          {homeCarouselFilters.map((filter) => (
            <button
              aria-selected={activeCategory === filter.value}
              className={styles.carouselFilter}
              data-active={activeCategory === filter.value || undefined}
              key={filter.value}
              onClick={() => setActiveCategory(filter.value)}
              role="tab"
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={styles.carouselStage}
        ref={stageRef}
        data-moving={isMoving || undefined}
        data-dragging={isDragging || undefined}
        data-normalizing={isNormalizing || undefined}
        aria-live="polite"
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        style={{ "--active-accent": products[activeIndex]?.accent ?? "#90f6d9" } as CSSProperties}
      >
        <div className={styles.carouselDeck}>
          {trackItems.map(({ product, productIndex, trackIndex }) => {
            const visualOffset = trackIndex - motionTrackIndex + dragProgress;
            const isVisible = Math.abs(visualOffset) <= 4.15;
            const isActiveCard = productIndex === activeIndex && Math.abs(visualOffset) < 0.78;
            const side = !isActiveCard && visualOffset < -0.48 ? "left" : !isActiveCard && visualOffset > 0.48 ? "right" : undefined;

            if (!isVisible) {
              return null;
            }

            return (
              <Link
                aria-label={`Открыть услугу ${product.name}`}
                className={styles.carouselSlot}
                data-offset={Math.round(visualOffset)}
                data-position={isActiveCard ? "center" : undefined}
                data-side={side}
                href={getProductRoute(product.id)}
                key={`${product.id}-${trackIndex}`}
                onClick={(event) => {
                  if (suppressClickRef.current) {
                    event.preventDefault();
                  }
                }}
                style={getOrbitStyle(visualOffset, product.accent, motionDirection)}
                tabIndex={isVisible ? 0 : -1}
              >
                <ProductCard isActive={isActiveCard} product={product} />
              </Link>
            );
          })}
        </div>

        <div className={styles.carouselControls} aria-label="Управление каруселью">
          <button aria-label="Предыдущий товар" onClick={goToPrevious} type="button">
            ‹
          </button>
          <button aria-label="Следующий товар" onClick={goToNext} type="button">
            ›
          </button>
        </div>

        <div className={styles.carouselThumbs} aria-label="Товары категории">
          {products.map((product, index) => (
            <button
              aria-label={`Открыть ${product.name}`}
              aria-current={activeIndex === index}
              key={product.id}
              onClick={() => moveToIndex(index)}
              style={{ "--product-accent": product.accent } as CSSProperties}
              type="button"
            >
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" loading="lazy" />
              ) : (
                <span>{product.visualCode}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.carouselFooter}>
        <LockerButton href={APP_ROUTES.catalog}>
          Перейти в каталог
        </LockerButton>
      </div>
    </section>
  );
}
