"use client";

import * as React from "react";
import { motion } from "framer-motion";

export type LogoLoaderProps = {
  size?: number;
  showBackground?: boolean;
  /** dark: konten gradasi + bg putih; light: konten putih + bg gradasi */
  theme?: "dark" | "light";
  /** animasi scale halus */
  pulse?: boolean;

  /** Durasi tiap fase (detik) */
  lineIn?: number;
  contentIn?: number;
  contentOut?: number;
  lineOut?: number;

  /** Hold tambahan */
  holdContent?: number;
  lineHold?: number;

  /** Ketebalan outline */
  strokeWidth?: number;

  /** Loop terus tanpa idle */
  loop?: boolean;

  /** Hilangkan background konten (fase 2 & 3) */
  hideContentBackground?: boolean;

  className?: string;
  label?: string;
  showLabel?: boolean;
};

export const LogoLoader = ({
  size = 160,
  showBackground = false,
  theme = "light",
  pulse = false,

  lineIn = 0.9,
  contentIn = 0.45,
  contentOut = 0.45,
  lineOut = 0.9,

  holdContent = 0,
  lineHold = 0,

  strokeWidth = 12,
  loop = true,

  hideContentBackground = true,

  className,
  label,
}: LogoLoaderProps) => {
  const uid = React.useId();
  const VB = 1113;
  const gradientStart = "#155DFC";
  const gradientEnd = "#4725F0";
  const gradientId = `lg-${uid}`;

  const contentFill = theme === "dark" ? `url(#${gradientId})` : "#0062FF";
  const outlineStroke = theme === "dark" ? gradientEnd : "#0062FF";
  const bgFill = theme === "dark" ? "#0062FF" : `url(#${gradientId})`;

  // Timeline
  const Traw =
    lineIn + contentIn + holdContent + contentOut + lineHold + lineOut;
  const T = Math.max(Traw, 0.0001);

  const t1 = lineIn / T;
  const t2 = (lineIn + contentIn) / T;
  const t2h = (lineIn + contentIn + holdContent) / T;
  const t3 = (lineIn + contentIn + holdContent + contentOut) / T;
  const t3l = (lineIn + contentIn + holdContent + contentOut + lineHold) / T;
  const t4 = 1;

  const linePathLength = [0, 1, 1, 0];
  const lineTimes = [0, t1, t3l, t4];

  const contentOpacity = holdContent > 0 ? [0, 0, 1, 1, 0, 0] : [0, 0, 1, 0, 0];

  const contentTimes =
    holdContent > 0 ? [0, t1, t2, t2h, t3, t4] : [0, t1, t2, t3, t4];

  const lineTransition = {
    duration: T,
    ease: "easeInOut" as const,
    times: lineTimes,
    repeat: loop ? Infinity : 0,
    repeatType: "loop" as const,
  };

  const contentTransition = {
    duration: T,
    ease: "easeInOut" as const,
    times: contentTimes,
    repeat: loop ? Infinity : 0,
    repeatType: "loop" as const,
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={[
        "inline-flex flex-col items-center justify-center",
        showBackground ? "p-3" : "",
        className || "",
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <motion.div
        aria-hidden
        className="relative"
        style={{ width: size, height: size }}
        animate={pulse ? { scale: [1, 1.03, 1] } : undefined}
        transition={
          pulse
            ? {
                duration: Math.max(0.8, T * 0.6),
                ease: "easeInOut",
                repeat: Infinity,
              }
            : undefined
        }
      >
        {showBackground && (
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${VB} ${VB}`}
            className="absolute inset-0"
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="556.5"
                y1="0"
                x2="556.5"
                y2="1113"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor={gradientStart} />
                <stop offset="1" stopColor={gradientEnd} />
              </linearGradient>
            </defs>
            <rect width={VB} height={VB} rx="60" fill={bgFill} />
          </svg>
        )}

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${VB} ${VB}`}
          className="relative"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="556.5"
              y1="0"
              x2="556.5"
              y2="1113"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor={gradientStart} />
              <stop offset="1" stopColor={gradientEnd} />
            </linearGradient>
          </defs>

          {/* Outline paths */}
          <motion.path
            d="M411.148 528.5L199 830L497.562 644H714.74L915 388.5L846.875 283H349.881L424.407 396.5H768.691L664.903 528.5H569.739L607.751 456.5L411.148 528.5Z"
            fill="none"
            stroke={outlineStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ pathLength: linePathLength }}
            transition={lineTransition}
          />
          <motion.path
            d="M502.134 666L430.809 715.5H659.417L704.681 666H502.134Z"
            fill="none"
            stroke={outlineStroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ pathLength: linePathLength }}
            transition={lineTransition}
          />

          {/* Content background (optional) */}
          {!hideContentBackground && (
            <motion.g
              animate={{ opacity: contentOpacity }}
              transition={contentTransition}
            >
              <path
                d="M411.148 528.5L199 830L497.562 644H714.74L915 388.5L846.875 283H349.881L424.407 396.5H768.691L664.903 528.5H569.739L607.751 456.5L411.148 528.5Z"
                fill={contentFill}
              />
              <path
                d="M502.134 666L430.809 715.5H659.417L704.681 666H502.134Z"
                fill={contentFill}
              />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
