"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Settings, LogOut, User } from "lucide-react";
import {
  useAuthProfileGetProfile,
  useAuthProfileLogout,
} from "@/services/auth.api";
import { showToast } from "@/helper/show-toast";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  LOGIN_URL,
  DEFAULT_USER_AVATAR,
} from "@/constants";
import { useBusinessGetAll } from "@/services/business.api";

export function ProfileDropdown() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: profileData } = useAuthProfileGetProfile();
  const { data: businessesData } = useBusinessGetAll();
  const { businessId } = useParams() as { businessId?: string };
  const businesses = businessesData?.data?.data || [];
  const currentBusiness =
    businesses.find((business) => business.id === businessId) || null;
  const userRole = currentBusiness?.userPosition?.role;
  const profile = profileData?.data?.data;

  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  const handleProfile = () => {
    router.push("/profile");
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
      showToast("success", "Berhasil logout dari sesi ini");
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = LOGIN_URL;
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 sm:gap-3 h-auto p-2"
          >
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage
                src={profile?.image || DEFAULT_USER_AVATAR}
                alt={profile?.name || "U"}
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs sm:text-sm">
                {profile?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-medium text-foreground">
                {profile?.name || "User"}
              </span>
              {userRole && (
                <span className="text-xs text-muted-foreground">
                  {userRole}
                </span>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 p-0">
          {/* Profile Section */}
          <div className="flex items-center gap-3 p-4">
            <Avatar className="w-10 h-10">
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
                {profile?.name || "User"}
              </span>
              {userRole && (
                <span className="text-xs text-muted-foreground">
                  {userRole}
                </span>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Menu Items */}
          <DropdownMenuItem
            onClick={handleProfile}
            className="cursor-pointer px-4 py-2"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600 px-4 py-2"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
