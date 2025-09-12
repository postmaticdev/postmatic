import React from "react";
import { Compare } from "./ui/compare";
import { ContainerScroll } from "./ui/container-scroll-animation";
import ProductShowcase from "./poduct-showcase";
import texts from "@/content/id/text.json"; // Adjust the path as necessary
export function Comparison() {
  const { titleLine1, titleLine2 } = texts.comparison;

  return (
    <div className="flex flex-col overflow-hidden bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black pb-20">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-slate-900 dark:text-slate-100 px-4 sm:px-0 leading-tight">
              {titleLine1}{" "}
              <span className="hidden sm:inline">
                <br />
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-[4rem] font-extrabold mt-1 leading-none bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                {titleLine2}
              </span>
            </h1>
          </>
        }
      >
        <div className="w-full aspect-[16/9]">
          <Compare
            firstImage="/content/tas-after.png"
            secondImage="/content/tas-before.png"
            firstImageClassName="object-cover object-left-top"
            secondImageClassname="object-cover object-left-top"
            className="w-full h-full mx-auto"
            slideMode="hover"
            autoplay={true}
          />
        </div>

      </ContainerScroll>

      <ProductShowcase />
    </div>
  );
}
