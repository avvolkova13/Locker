"use client";

import { useEffect } from "react";

export function HashScrollRestorer() {
  useEffect(() => {
    function restoreHashScroll() {
      if (!window.location.hash) {
        return;
      }

      const target = document.querySelector(window.location.hash);

      if (!target) {
        return;
      }

      [0, 120, 420, 900].forEach((delay) => {
        window.setTimeout(() => {
          const rect = target.getBoundingClientRect();

          window.scrollTo({
            behavior: "auto",
            top: window.scrollY + rect.top,
          });
        }, delay);
      });
    }

    restoreHashScroll();
    window.addEventListener("hashchange", restoreHashScroll);

    return () => {
      window.removeEventListener("hashchange", restoreHashScroll);
    };
  }, []);

  return null;
}
