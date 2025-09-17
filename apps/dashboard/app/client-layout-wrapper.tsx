"use client";

import { usePathname } from "next/navigation";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isCheckoutPage =
    pathname === "/checkout" || pathname === "/business/new-business";

  return (
    <body
      className={`${!isCheckoutPage ? "mt-22" : ""} 
      } antialiased`}
    >
      {children}
    </body>
  );
}
