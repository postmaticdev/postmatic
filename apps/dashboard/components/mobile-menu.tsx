"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Send,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  CreditCard,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useAuthProfileGetProfile,
  useAuthProfileLogout,
} from "@/services/auth.api";
import {
  ACCESS_TOKEN_KEY,
  DEFAULT_USER_AVATAR,
  LOGIN_URL,
  REFRESH_TOKEN_KEY,
} from "@/constants";
import { useBusinessGetAll } from "@/services/business.api";
import { showToast } from "@/helper/show-toast";
import { useTokenGetTokenUsage } from "@/services/tier/token.api";
import { useSubscribtionGetSubscription } from "@/services/tier/subscribtion.api";
import { dateFormat } from "@/helper/date-format";

const navigationItems = [
  {
    name: "Dashboard",
    href: "dashboard",
    icon: LayoutGrid,
  },
  {
    name: "Basis Pengetahuan",
    href: "knowledge-base",
    icon: BookOpen,
  },
  {
    name: "Pembuat Konten",
    href: "content-generate",
    icon: Sparkles,
  },
  {
    name: "Penjadwal Konten",
    href: "content-scheduler",
    icon: Send,
  },
  {
    name: "Pengaturan",
    href: "settings",
    icon: Settings,
  },
  {
    name: "Profil",
    href: "profile",
    icon: User,
  },
];

export function MobileMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const { data: profileData } = useAuthProfileGetProfile();
  const profile = profileData?.data?.data;
  const { data: businessesData } = useBusinessGetAll();
  const businesses = businessesData?.data?.data || [];
  const { businessId } = useParams() as { businessId?: string };
  const currentBusiness =
    businesses.find((business) => business.id === businessId) || null;
  const userRole = currentBusiness?.userPosition?.role;
  
  // Get subscription data
  const { data: subscriptionData } = useSubscribtionGetSubscription(
    businessId ?? ""
  );
  const subscription = subscriptionData?.data?.data ?? null;
  
  // Get token usage data
  const { data: tokenUsageData } = useTokenGetTokenUsage(businessId ?? "");
  const credits = tokenUsageData?.data?.data?.availableToken ?? 0;
  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const mLogout = useAuthProfileLogout();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await mLogout.mutateAsync(refreshToken);
      }
    } catch {
    } finally {
      showToast("success", "Berhasil keluar dari sesi ini");
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = LOGIN_URL;
    }
  };

  // Check if we're currently inside a business context
  const isInBusinessContext = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    // We're in business context if we have at least 2 segments and first one is not a known root page
    return (
      pathSegments.length >= 2 &&
      !["profile", "pricing", "checkout", "newbusiness"].includes(
        pathSegments[0]
      )
    );
  };

  // Get filtered navigation items based on context
  const getFilteredNavigationItems = () => {
    if (isInBusinessContext()) {
      // Show all navigation items when in business context
      return navigationItems;
    } else {
      // Show only profile when not in business context
      return navigationItems.filter((item) => item.href === "profile");
    }
  };

  const handleNavigation = (href: string) => {
    // Handle profile differently - don't go through businessId
    if (href === "profile") {
      router.push(`/${href}`);
    } else {
      const fullPath = `/business/${businessId}/${href}`;
      router.push(fullPath);
    }

    setIsOpen(false);
  };

  return (
    <>
      {/* Burger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-muted"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Profile Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={profile?.image || DEFAULT_USER_AVATAR}
                      alt={profile?.name || "U"}
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {profile?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {profile?.name || "Pengguna"}
                    </span>
                    {userRole && (
                      <span className="text-xs text-muted-foreground">
                        {userRole || "Pengguna"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription Info Section */}
              {businessId && (
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        {subscription?.subscription?.productName || "Paket Gratis"}
                      </span>
                      {subscription?.expiredAt && (
                        <span className="text-xs text-muted-foreground">
                          Valid sampai{" "}
                          {dateFormat.indonesianDate(new Date(subscription.expiredAt))}
                        </span>
                      )}
                      <span className="text-sm font-bold">{credits}</span>
                    </div>
                    <button
                      onClick={() => {
                        router.push(`/business/${businessId}/pricing`);
                        setIsOpen(false);
                      }}
                      className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-2 py-2">
                    Navigasi
                  </h3>
                  <div className="space-y-1">
                    {getFilteredNavigationItems().map((item) => {
                      const isActive = pathname.endsWith(`/${item.href}`);
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group",
                            isActive
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5 transition-transform duration-200",
                              isActive ? "" : "group-hover:scale-110"
                            )}
                          />
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="p-4 border-t border-border space-y-3">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Mode Gelap</span>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                  />
                </div>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
