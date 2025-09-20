"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Zap } from "lucide-react";
import { ProfileDropdown } from "./profile-dropdown";
import { MobileMenu } from "../mobile-menu";
import Image from "next/image";
import Link from "next/link";
import { useBusinessGetAll } from "@/services/business.api";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useTokenGetTokenUsage } from "@/services/tier/token.api";
import { useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { businessId } = useParams() as { businessId?: string };

  const { data: businessesData, isLoading: isLoadingBusinesses } =
    useBusinessGetAll({
      limit: 40,
      sort: "asc",
      sortBy: "name",
    });

  // Panggil usage hanya kalau ada businessId (kalau hook-mu dukung options)
  const { data: tokenUsageData } = useTokenGetTokenUsage(businessId ?? "");

  const credits = tokenUsageData?.data?.data?.availableToken ?? 0;

  const businesses = useMemo(
    () => businessesData?.data?.data ?? [],
    [businessesData?.data?.data]
  );

  const currentBusiness = useMemo(
    () => businesses.find((b) => b.id === businessId) ?? null,
    [businesses, businessId]
  );

  // Bangun path yang robust
  const buildBusinessPath = (targetId: string) => {
    const segments = pathname.split("?")[0].split("/").filter(Boolean);
    const i = segments.indexOf("business");

    if (i === -1) {
      return `/business/${targetId}`;
    }
    if (segments[i + 1]) {
      segments[i + 1] = targetId;
    } else {
      segments.splice(i + 1, 0, targetId);
    }

    const base = `/${segments.join("/")}`;
    const q = searchParams.toString();
    return q ? `${base}?${q}` : base;
  };

  const onBusinessChange = (targetBusinessId: string) => {
    queryClient.clear(); // bersihkan cache TanStack
    router.push(buildBusinessPath(targetBusinessId));
    router.refresh(); // <- aktifkan kalau perlu refetch RSC
  };

  // Cegah redirect otomatis saat di "/business" (tanpa id)
  // Redirect hanya ketika: path "/business/[id]" TAPI id tidak valid, atau tidak ada bisnis sama sekali.
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (redirectedRef.current) return;
    if (isLoadingBusinesses) return;

    const hasBusinesses = businesses.length > 0;

    // Check if isNewBusiness=true is in the URL
    const isNewBusiness = searchParams.get("isNewBusiness") === "true";

    // Skip redirect if isNewBusiness=true
    if (isNewBusiness) return;

    // Kalau bukan halaman ber-scope bisnis, tidak usah apa-apa
    if (!pathname.startsWith("/business")) return;

    // Jika tepat di "/business" (tanpa id) -> JANGAN auto-redirect
    if (pathname === "/business") {
      // Kalau tidak ada bisnis sama sekali, tetap biarkan di halaman ini.
      return;
    }

    // Sampai sini: path dimulai "/business/..." (ada segmen setelah "business")
    // Jika tidak ada bisnis sama sekali -> arahkan ke halaman pilih bisnis
    if (!hasBusinesses) {
      redirectedRef.current = true;
      router.replace("/business");
      return;
    }

    // Jika ada businessId tapi tidak valid -> arahkan ke halaman pilih bisnis
    if (businessId && !businesses.some((b) => b.id === businessId)) {
      redirectedRef.current = true;
      router.replace("/business");
      return;
    }
    // Kalau valid, tidak melakukan apa-apa
  }, [
    isLoadingBusinesses,
    pathname,
    businessId,
    businesses,
    router,
    searchParams,
  ]);

  return (
    <header className="flex items-center justify-between w-full px-4 sm:px-6 py-4 bg-card border-b border-border fixed top-0 left-0 right-0 z-50">
      {/* Logo Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/logoblue.png"
            alt="logol"
            width={200}
            height={200}
            className="w-12 h-12"
          />
        </Link>
        <div className="flex items-center gap-1">
          {currentBusiness && businesses.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto p-0 text-base sm:text-lg font-bold text-foreground hover:text-foreground"
                >
                  {currentBusiness.name}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <Button
                  onClick={() => router.push("/business/new-business")}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full justify-start"
                >
                  <Plus className="w-4 h-4" />
                  Buat Bisnis Baru
                </Button>
                {businesses.map((business) => (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() => onBusinessChange(business.id)}
                    className={
                      currentBusiness.id === business.id ? "bg-accent" : ""
                    }
                  >
                    {business.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-base sm:text-lg font-bold text-foreground">
              Postmatic
            </span>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-2">
        {businessId && (
          <div className="hidden md:flex items-center gap-2">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">{credits}</span>
                <Zap className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
              </div>
            </div>
            <Link
              href={`/business/${businessId}/pricing?tab=extraToken`}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </Link>
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <MobileMenu />

          {/* Desktop Profile Dropdown */}
          <div className="hidden md:block">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
