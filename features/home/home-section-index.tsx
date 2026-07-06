"use client";

import { useEffect, useState } from "react";
import styles from "./home-page.module.css";

const homeSections = [
  { id: "goods", label: "Товары" },
  { id: "purchase", label: "Покупка" },
  { id: "steam", label: "Steam" },
  { id: "faq", label: "FAQ" },
];

export function HomeSectionIndex() {
  const [activeId, setActiveId] = useState(homeSections[0]?.id ?? "");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const elements = homeSections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    function updateActiveSection() {
      const viewportAnchor = window.innerHeight * 0.42;
      const firstSection = elements[0];
      const lastSection = elements[elements.length - 1];
      const firstRect = firstSection?.getBoundingClientRect();
      const lastRect = lastSection?.getBoundingClientRect();
      const nextIsVisible = Boolean(
        firstRect &&
          lastRect &&
          firstRect.top <= viewportAnchor &&
          lastRect.bottom >= viewportAnchor,
      );
      let nextActiveId = elements[0]?.id ?? "";
      let closestDistance = Number.POSITIVE_INFINITY;

      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - viewportAnchor);

        if (rect.top <= viewportAnchor && rect.bottom >= 120 && distance < closestDistance) {
          closestDistance = distance;
          nextActiveId = element.id;
        }
      });

      setIsVisible(nextIsVisible);
      setActiveId((currentActiveId) => (nextActiveId === currentActiveId ? currentActiveId : nextActiveId));
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  function handleNavigate(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!isVisible) {
    return null;
  }

  return (
    <nav className={styles.sectionIndex} aria-label="Навигация по главной странице">
      {homeSections.map((section, index) => {
        const isActive = section.id === activeId;

        return (
          <button
            aria-current={isActive ? "true" : undefined}
            className={styles.sectionIndexItem}
            data-active={isActive || undefined}
            key={section.id}
            onClick={() => handleNavigate(section.id)}
            type="button"
          >
            <span>{index + 1}</span>
            <i aria-hidden="true" />
            <strong>{section.label}</strong>
          </button>
        );
      })}
    </nav>
  );
}
