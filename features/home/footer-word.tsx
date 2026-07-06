"use client";

import { useEffect, useRef } from "react";
import styles from "./home-page.module.css";

type FooterPoint = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
};

const WORD = "Locker";
const CHROMA_PASSES = [
  { color: "rgba(255, 84, 38, 0.38)", displacement: 0.9 },
  { color: "rgba(244, 247, 241, 0.84)", displacement: 1 },
  { color: "rgba(144, 246, 217, 0.38)", displacement: 1.1 },
];

export function FooterWord() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      return;
    }

    const canvasElement = canvas;
    const canvasContext = context;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let drawSize = 5;
    let points: FooterPoint[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let smoothX = -9999;
    let smoothY = -9999;
    let previousX = -9999;
    let previousY = -9999;
    let velocityX = 0;
    let velocityY = 0;

    function createWordMask() {
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;

      const maskContext = mask.getContext("2d", { alpha: true });

      if (!maskContext) {
        return [];
      }

      const computed = getComputedStyle(canvasElement);
      const fontFamily =
        computed.getPropertyValue("--footer-word-font").trim() ||
        getComputedStyle(document.documentElement).getPropertyValue("--font-heading").trim() ||
        "Impact, sans-serif";

      let fontSize = height * 1.54;
      maskContext.textAlign = "center";
      maskContext.textBaseline = "middle";
      maskContext.fillStyle = "#fff";

      do {
        maskContext.font = `900 ${fontSize}px ${fontFamily}`;
        fontSize *= 0.965;
      } while (maskContext.measureText(WORD).width > width * 1.06 && fontSize > 80);

      maskContext.clearRect(0, 0, width, height);
      maskContext.font = `900 ${fontSize}px ${fontFamily}`;
      maskContext.fillText(WORD, width / 2, height * 0.62);

      const imageData = maskContext.getImageData(0, 0, width, height).data;
      const sampleStep = Math.max(4, Math.round(width / 430));
      const createdPoints: FooterPoint[] = [];

      for (let y = 0; y < height; y += sampleStep) {
        for (let x = 0; x < width; x += sampleStep) {
          const alpha = imageData[(y * width + x) * 4 + 3];

          if (alpha > 32) {
            createdPoints.push({
              x,
              y,
              ox: 0,
              oy: 0,
              vx: 0,
              vy: 0,
            });
          }
        }
      }

      drawSize = sampleStep * 1.18;
      return createdPoints;
    }

    function resizeCanvas() {
      const rect = canvasElement.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.45);

      width = Math.max(420, Math.round(rect.width * pixelRatio));
      height = Math.max(160, Math.round(rect.height * pixelRatio));
      canvasElement.width = width;
      canvasElement.height = height;
      points = createWordMask();
    }

    function updatePointer(event: PointerEvent) {
      const rect = canvasElement.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;

      pointerX = (event.clientX - rect.left) * scaleX;
      pointerY = (event.clientY - rect.top) * scaleY;
    }

    function draw() {
      canvasContext.clearRect(0, 0, width, height);

      smoothX += (pointerX - smoothX) * 0.1;
      smoothY += (pointerY - smoothY) * 0.1;

      const nextVelocityX = smoothX - previousX;
      const nextVelocityY = smoothY - previousY;
      const velocityLength = Math.hypot(nextVelocityX, nextVelocityY);

      velocityX = velocityLength > 60 ? 0 : nextVelocityX;
      velocityY = velocityLength > 60 ? 0 : nextVelocityY;
      previousX = smoothX;
      previousY = smoothY;

      const radius = Math.min(width, height) * 0.72;
      const radiusSq = radius * radius;

      for (const point of points) {
        const dx = point.x - smoothX;
        const dy = point.y - smoothY;
        const distanceSq = dx * dx + dy * dy;
        const falloff = Math.max(0, 1 - distanceSq / radiusSq);
        const softened = falloff * falloff;
        const distance = Math.sqrt(distanceSq) || 1;
        const push = softened * Math.min(width, height) * 0.075;
        const targetX = (dx / distance) * push + velocityX * softened * 0.34;
        const targetY = (dy / distance) * push + velocityY * softened * 0.34;

        point.vx += (targetX - point.ox) * 0.13;
        point.vy += (targetY - point.oy) * 0.13;
        point.vx *= 0.74;
        point.vy *= 0.74;
        point.ox += point.vx;
        point.oy += point.vy;
      }

      canvasContext.globalCompositeOperation = "lighter";

      for (const pass of CHROMA_PASSES) {
        canvasContext.fillStyle = pass.color;

        for (const point of points) {
          canvasContext.fillRect(
            point.x + point.ox * pass.displacement,
            point.y + point.oy * pass.displacement,
            drawSize,
            drawSize,
          );
        }
      }

      canvasContext.globalCompositeOperation = "source-over";
      animationFrame = window.requestAnimationFrame(draw);
    }

    resizeCanvas();
    animationFrame = window.requestAnimationFrame(draw);

    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("pointermove", updatePointer);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("pointermove", updatePointer);
    };
  }, []);

  return (
    <div aria-hidden="true" className={styles.footerWordStage}>
      <canvas className={styles.footerWordCanvas} ref={canvasRef} />
      <span className={styles.footerWordFallback}>Locker</span>
    </div>
  );
}
