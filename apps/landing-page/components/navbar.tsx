"use client";

import { useState } from "react";
import {
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";

type NavItem = { name: string; link: string };

export default function MobileNavWrapper({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Mobile Navbar with solid background */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <NavbarLogo />
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
            <MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} />
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Menu - positioned below fixed navbar */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 z-40 bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800 shadow-lg transition-all duration-300 ease-in-out",
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="px-4 py-6 space-y-4">
          {items.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setOpen(false)}
              className="block text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 text-sm sm:text-base font-medium"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
            <NavbarButton
              onClick={() => setOpen(false)}
              variant="primary"
              className="w-full"
            >
              Get Started
            </NavbarButton>
          </div>
        </div>
      </div>
    </div>
  );
}
