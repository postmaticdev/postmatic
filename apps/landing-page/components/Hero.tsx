import { cn, getMobileMargins } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SIGNUP_URL } from "@/constants";
import { ShimmerButton } from "./magicui/shimmer-button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex items-center w-full min-h-[94vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden"
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>

      <div className={cn("relative flex items-center justify-center h-full w-full pt-20 pb-32", getMobileMargins())}>
        <div className="flex flex-col max-w-6xl text-center items-center justify-center">
          <div
            className="animate-fade-in mb-7"
            style={{ animationDelay: "0.2s" }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-foreground leading-tight tracking-tight">
              Automate your Social Media{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                with Postmatic
              </span>
            </h1>
          </div>
          {/* CTA Button */}
          <Link href={SIGNUP_URL}>
            <ShimmerButton
              borderRadius="10px"
              background="oklch(0.4911 0.225 262.83)"
              className="shadow-2xl gap-2  text-white hover:from-primary/90 hover:to-secondary/90"
            >
              <span className="whitespace-pre-wrap text-center text-sm sm:text-base font-semibold leading-tight tracking-wide text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Get Started
              </span>
              <ArrowRight className="h-5 w-5 text-white " />
            </ShimmerButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
