"use client";

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEvent,
  ReactNode,
} from "react";
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import styles from "./locker-button.module.css";

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "default" | "compact";

type CommonProps = {
  children: ReactNode;
  className?: string;
  loading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
    disabled?: boolean;
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: never;
  };

export type LockerButtonProps = LinkButtonProps | NativeButtonProps;

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function ButtonChrome({
  height,
  id,
  width,
}: {
  height: number;
  id: string;
  width: number;
}) {
  const svgWidth = width + 32;
  const svgHeight = height + 32;
  const innerRadius = height >= 42 ? 16 : 14;
  const echoOuterRadius = innerRadius * 2;
  const echoInnerRadius = innerRadius * 1.5;

  return (
    <svg
      aria-hidden="true"
      className={styles.chrome}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
    >
      <defs>
        <filter id={`${id}-blur-filter`}>
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`${id}-drop-shadow-filter`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="20" />
          <feOffset dx="0" dy="0" />
          <feComponentTransfer>
            <feFuncA slope="1" type="linear" />
          </feComponentTransfer>
          <feFlood floodColor="white" floodOpacity="0.5" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-gradient`} x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="10%" stopColor="#A281FF" />
          <stop offset="33%" stopColor="#EB8280" />
          <stop offset="66%" stopColor="#EBBF9A" />
          <stop offset="90%" stopColor="#90F6D9" />
        </linearGradient>
        <radialGradient
          cx="0"
          cy="0"
          gradientTransform={`translate(${width + 17.5} ${height - 1.5}) rotate(60.7945) scale(92.2239 67.8051)`}
          gradientUnits="userSpaceOnUse"
          id={`${id}-rgradient`}
          r="1"
        >
          <stop stopColor="#90F6D9" />
          <stop offset="1" stopColor="#35F0C1" />
        </radialGradient>
      </defs>
      <rect
        className={styles.baseSurface}
        fill="white"
        fillOpacity="1"
        height={height}
        rx={innerRadius}
        stroke={`url(#${id}-gradient)`}
        strokeOpacity="1"
        strokeWidth="2"
        width={width}
        x="16"
        y="16"
      />
      <rect
        className={styles.echoBorderLarge}
        fill="none"
        height={height + 30}
        rx={echoOuterRadius}
        stroke={`url(#${id}-gradient)`}
        strokeWidth="2"
        width={width + 30}
        x="1"
        y="1"
      />
      <rect
        className={styles.echoBorderSmall}
        fill="none"
        height={height + 16}
        rx={echoInnerRadius}
        stroke={`url(#${id}-gradient)`}
        strokeWidth="2"
        width={width + 16}
        x="8"
        y="8"
      />
      <rect
        className={styles.baseOutline}
        fill="none"
        height={height}
        rx={innerRadius}
        stroke={`url(#${id}-gradient)`}
        strokeOpacity="1"
        strokeWidth="2"
        width={width}
        x="16"
        y="16"
      />
      <rect
        className={styles.hoverEffect}
        fill={`url(#${id}-rgradient)`}
        fillOpacity="1"
        filter={`url(#${id}-drop-shadow-filter)`}
        height={height}
        rx={innerRadius}
        stroke={`url(#${id}-gradient)`}
        strokeWidth="4"
        width={width}
        x="16"
        y="16"
      />
      <rect
        className={styles.hoverBorder}
        fill="none"
        filter={`url(#${id}-blur-filter)`}
        height={height}
        rx={innerRadius}
        stroke={`url(#${id}-gradient)`}
        strokeWidth="4"
        width={width}
        x="16"
        y="16"
      />
      <rect
        className={styles.hoverBorderEffect}
        fill="none"
        height={height}
        pathLength="100"
        rx={innerRadius}
        stroke="white"
        strokeWidth="3"
        width={width}
        x="16"
        y="16"
      />
    </svg>
  );
}

function ButtonContent({ children, loading, size }: Pick<CommonProps, "children" | "loading" | "size">) {
  const label = loading ? "Загрузка" : children;
  const frameRef = useRef<HTMLSpanElement>(null);
  const generatedId = useId().replaceAll(":", "");
  const [frameSize, setFrameSize] = useState({
    height: size === "compact" ? 40 : 54,
    width: size === "compact" ? 110 : 180,
  });

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return undefined;
    }

    const frameElement = frame;

    function updateSize() {
      const rect = frameElement.getBoundingClientRect();
      setFrameSize({
        height: Math.max(1, Math.round(rect.height)),
        width: Math.max(1, Math.round(rect.width)),
      });
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(frameElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <span className={styles.frame} ref={frameRef}>
      <ButtonChrome height={frameSize.height} id={`locker-button-${generatedId}`} width={frameSize.width} />
      <span className={styles.inner}>
        <span className={styles.labelTrack}>
          <span className={styles.labelMain}>{label}</span>
          <span className={styles.labelClone} aria-hidden="true">
            {label}
          </span>
        </span>
        {loading ? <span className={styles.loader} aria-hidden="true" /> : null}
      </span>
    </span>
  );
}

export function LockerButton(props: LockerButtonProps) {
  const {
    children,
    className,
    loading = false,
    size = "default",
    variant = "primary",
  } = props;

  const buttonClassName = classNames(styles.button, className);

  if ("href" in props && props.href) {
    const {
      disabled,
      href,
      onClick,
      tabIndex,
      ...rest
    } = props;
    const isDisabled = Boolean(disabled || loading);

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      onClick?.(event);
    }

    return (
      <Link
        {...rest}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        className={buttonClassName}
        data-loading={loading || undefined}
        data-size={size}
        data-variant={variant}
        href={href}
        onClick={handleClick}
        tabIndex={isDisabled ? -1 : tabIndex}
      >
        <ButtonContent loading={loading} size={size}>{children}</ButtonContent>
      </Link>
    );
  }

  const {
    disabled,
    type: buttonType = "button",
    ...rest
  } = props as NativeButtonProps;
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      {...rest}
      aria-busy={loading || undefined}
      className={buttonClassName}
      data-loading={loading || undefined}
      data-size={size}
      data-variant={variant}
      disabled={isDisabled}
      type={buttonType}
    >
      <ButtonContent loading={loading} size={size}>{children}</ButtonContent>
    </button>
  );
}
