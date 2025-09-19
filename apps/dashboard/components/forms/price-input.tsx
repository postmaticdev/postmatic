"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatIdr } from "@/helper/formatter";
import { Info } from "lucide-react";

// Format currency based on currency code
const formatCurrency = (amount: number, currency: string) => {
  if (currency === "IDR") {
    return formatIdr(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  label?: string;
  currency?: string;
  error?: string;
  onFocus?: () => void;
}

export function PriceInput({
  value,
  onChange,
  placeholder = "Masukkan harga produk",

  currency = "IDR",
  error,
  onFocus,
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Parse formatted string back to number

  // Update display value when value prop changes
  useEffect(() => {
    if (!isFocused && value > 0) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only digits and decimal point
    const sanitized = inputValue.replace(/[^\d]/g, "");

    if (sanitized === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    const numericValue = parseInt(sanitized, 10);

    // Limit to reasonable maximum (999,999,999,999)
    if (numericValue > 999999999999) {
      return;
    }

    setDisplayValue(formatNumber(numericValue));
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    setDisplayValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format with thousand separators when not focused
    if (value > 0) {
      setDisplayValue(formatNumber(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
    if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
      return;
    }

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88, 90].includes(e.keyCode)) {
      return;
    }

    // Allow only digits
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-1 flex-grow">
      <div className="relative">
        <Input
          id="price"
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => {
            handleFocus();
            onFocus?.();
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pr-16 ${
            error ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {currency}
        </div>
      </div>

      {/* Display formatted price preview */}
      {value > 0 && !isFocused && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Preview:</span>{" "}
          {formatCurrency(value, currency)}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1">
          <Info className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
