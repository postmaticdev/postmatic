"use client";

import { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, User } from "lucide-react";
import { IconBrandTiktokFilled } from "@tabler/icons-react";
import { IMAGE_PATH } from "@/constants/path-file";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] dark:bg-slate-800",
      className
    )}
  >
    {children}
  </div>
));
Circle.displayName = "Circle";

export default function EndToEndClient({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use resolvedTheme for more accurate theme detection
  const isDark = mounted ? (resolvedTheme === "dark") : false;

  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10",
        className
      )}
      ref={containerRef}
    >
      <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center">
          <Circle ref={div7Ref}>
            <User />
          </Circle>
        </div>
        <div className="flex flex-col justify-center">
          <Circle ref={div6Ref} className="size-16 ">
            <Image
              src={IMAGE_PATH}
              alt="POSTMATIC"
              width={64}
              height={64}
              className="rounded-full"
            />
          </Circle>
        </div>
        <div className="flex flex-col justify-center gap-2">
          <Circle ref={div1Ref}>
            <Facebook />
          </Circle>
          <Circle ref={div2Ref}>
            <Instagram />
          </Circle>
          <Circle ref={div3Ref}>
            <Linkedin />
          </Circle>
          <Circle ref={div4Ref}>
            <IconBrandTiktokFilled />
          </Circle>
          <Circle ref={div5Ref}>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Circle>
        </div>
      </div>

      {/* animated beams */}
      {isDark ? (
        <>
          {[div1Ref, div2Ref, div3Ref, div4Ref, div5Ref].map((ref, i) => (
            <AnimatedBeam
              key={i}
              containerRef={containerRef}
              fromRef={ref}
              toRef={div6Ref}
              pathColor="white"
            />
          ))}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div6Ref}
            toRef={div7Ref}
            pathColor="white"
          />
        </>
      ) : (
        <>
          {[div1Ref, div2Ref, div3Ref, div4Ref, div5Ref].map((ref, i) => (
            <AnimatedBeam
              key={i}
              containerRef={containerRef}
              fromRef={ref}
              toRef={div6Ref}
              pathColor="black"
            />
          ))}
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div6Ref}
            toRef={div7Ref}
            pathColor="black"
          />
        </>
      )}
    </div>
  );
}
