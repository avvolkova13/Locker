"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import styles from "./home-page.module.css";

const purchaseSteps = [
  {
    description: "Все цены и условия видны сразу. Без скрытых шагов.",
    title: "Выберите товар",
  },
  {
    description: "Пополните баланс в LK и используйте его для покупки.",
    title: "Пополните баланс",
  },
  {
    description: "Перед оплатой мы покажем всё, что понадобится для получения товара.",
    title: "Подтвердите покупку",
  },
  {
    description: "Заказ проходит понятные этапы — от обработки до выдачи.",
    title: "Следите за статусом",
  },
  {
    description: "После обработки Locker выдаёт товар или показывает следующий шаг.",
    title: "Получите товар",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PurchaseScenario() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return undefined;
    }

    let frame = 0;

    function updateProgress() {
      frame = 0;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const nextProgress = clamp(-rect.top / scrollable, 0, 1) * (purchaseSteps.length - 1);

      setProgress(nextProgress);
    }

    function requestUpdate() {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const activeIndex = clamp(Math.round(progress), 0, purchaseSteps.length - 1);
  const activeStep = purchaseSteps[activeIndex];

  return (
    <section className={styles.purchaseScenario} id="purchase" aria-labelledby="purchase-title" ref={sectionRef}>
      <div className={styles.purchaseSticky}>
        <div className={styles.purchaseIntro}>
          <h2 id="purchase-title">Как это работает</h2>
        </div>

        <div className={styles.purchaseDescription} aria-live="polite">
          <p className={styles.purchaseDescriptionText} key={activeStep.title}>
            {activeStep.description}
          </p>
        </div>

        <div
          className={styles.purchaseNumber}
          aria-hidden="true"
          style={{ "--counter-index": activeIndex } as CSSProperties}
        >
          <span className={styles.purchaseCounterZero}>0</span>
          <div className={styles.purchaseCounter}>
            {purchaseSteps.map((step, index) => (
              <span key={step.title}>{index + 1}</span>
            ))}
          </div>
        </div>

        <div className={styles.purchaseDiagonal} aria-label="Процесс покупки">
          {purchaseSteps.map((step, index) => {
            const offset = index - progress;
            const isActive = Math.abs(offset) < 0.52;
            const distance = Math.abs(offset);
            const cardStyle = {
              "--step-offset": offset,
              "--step-x": `${52 + offset * 88}%`,
              "--step-y": `${57 + offset * 36}%`,
              "--step-scale": String(clamp(1 - distance * 0.16, 0.7, 1)),
              "--step-opacity": String(clamp(1 - distance * 0.46, 0.12, 1)),
              "--step-dim": String(clamp(distance * 0.66, 0, 0.92)),
              "--step-z": String(50 - Math.round(distance * 8)),
            } as CSSProperties;

            return (
              <article
                aria-current={isActive ? "step" : undefined}
                className={styles.purchaseStepCard}
                key={step.title}
                style={cardStyle}
              >
                <h3>{step.title}</h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
