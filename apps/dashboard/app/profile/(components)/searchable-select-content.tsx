"use client";

import * as React from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Country {
  name: string;
  dial_code: string; // contoh: "+62"
  code: string;      // contoh: "ID"
}

interface SearchableCountrySelectProps {
  countries: Country[];
  value: string; // simpan dial_code (mis. "+62")
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function SearchableCountrySelect({
  countries,
  value,
  onValueChange,
  placeholder = "Pilih negara",
  searchPlaceholder = "Cari negara...",
  className,
}: SearchableCountrySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // --- detect mobile (<= 640px) ---
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // --- posisi dropdown utk mode fixed (mobile) ---
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const updateDropdownPos = React.useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDropdownPos({
      top: rect.bottom,         // viewport-based (fixed)
      left: rect.left,
      width: rect.width,
    });
  }, []);

  React.useEffect(() => {
    if (isOpen && isMobile) {
      updateDropdownPos();
      // re-calc ketika scroll/resize agar tetap nempel tombol
      const handler = () => updateDropdownPos();
      window.addEventListener("scroll", handler, true);
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("scroll", handler, true);
        window.removeEventListener("resize", handler);
      };
    }
  }, [isOpen, isMobile, updateDropdownPos]);

  // country terpilih
  const selectedCountry = React.useMemo(
    () => countries.find((c) => c.dial_code === value),
    [countries, value]
  );

  // filter: nama, dial code, ISO code
  const filteredCountries = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial_code.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countries, searchTerm]);

  // keyboard nav (trigger)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((p) => (p < filteredCountries.length - 1 ? p + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((p) => (p > 0 ? p - 1 : filteredCountries.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredCountries.length) {
          onValueChange(filteredCountries[focusedIndex].dial_code);
          setIsOpen(false);
          setFocusedIndex(-1);
          triggerRef.current?.focus();
        }
        break;
    }
  };

  // keyboard di input search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setFocusedIndex(-1);
      triggerRef.current?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCountries.length > 0) {
        onValueChange(filteredCountries[0].dial_code);
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }
  };

  // fokuskan search saat buka
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // klik di luar → tutup
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
        setSearchTerm("");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // reset state saat tutup
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">
          {selectedCountry
            ? `${selectedCountry.name} (${selectedCountry.dial_code})`
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {/* --- DROPDOWN: mobile fixed, desktop absolute --- */}
      {isOpen &&
        (isMobile ? (
          // MOBILE: fixed mengikuti posisi tombol
          <div
            ref={dropdownRef}
            className="fixed z-50 max-h-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
            style={{
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
          >
            {/* Search */}
            <div className="sticky top-0 z-10 p-1 bg-popover border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="h-9 pl-8"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>
            {/* List */}
            <div className="max-h-[200px] overflow-y-auto overscroll-contain p-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country, index) => (
                  <div
                    key={`${country.code}-${country.dial_code}`}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      index === focusedIndex &&
                        "bg-accent text-accent-foreground",
                      value === country.dial_code &&
                        "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      onValueChange(country.dial_code);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {value === country.dial_code && (
                        <Check className="h-4 w-4" />
                      )}
                    </span>
                    {country.name} ({country.dial_code})
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Tidak ada hasil
                </div>
              )}
            </div>
          </div>
        ) : (
          // DESKTOP: absolute seperti sebelumnya (muncul di atas tombol)
          <div
            ref={dropdownRef}
            className="absolute z-50 mb-1 bottom-full left-0 min-w-[280px] max-h-[300px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          >
            {/* Search */}
            <div className="sticky top-0 z-10 p-1 bg-popover border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="h-9 pl-8"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>
            {/* List */}
            <div className="max-h-[200px] overflow-y-auto overscroll-contain p-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country, index) => (
                  <div
                    key={`${country.code}-${country.dial_code}`}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                      index === focusedIndex &&
                        "bg-accent text-accent-foreground",
                      value === country.dial_code &&
                        "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      onValueChange(country.dial_code);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      {value === country.dial_code && (
                        <Check className="h-4 w-4" />
                      )}
                    </span>
                    {country.name} ({country.dial_code})
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Tidak ada hasil
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
