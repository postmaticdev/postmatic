"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useAuthProfileGetProfile,
  useAuthProfileLogout,
  useAuthProfileLogoutAll,
} from "@/services/auth.api";
import { dateFormat } from "@/helper/date-format";
import { ACCESS_TOKEN_KEY, LOGIN_URL, REFRESH_TOKEN_KEY } from "@/constants";
import { showToast } from "@/helper/show-toast";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function SessionLogin() {
  const { data: userData } = useAuthProfileGetProfile();
  const sessions = userData?.data?.data?.sessions || [];
  const mLogout = useAuthProfileLogout();
  const mLogoutAll = useAuthProfileLogoutAll();

  const handleLogout = async (refreshToken: string) => {
    try {
      await mLogout.mutateAsync(refreshToken);
    } catch {
    } finally {
      showToast("success", "Berhasil logout dari sesi ini");
      await sleep(1000);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = LOGIN_URL;
    }
  };

  const handleLogoutAll = async () => {
    try {
      await mLogoutAll.mutateAsync();
    } catch {
    } finally {
      showToast("success", "Berhasil logout dari semua sesi");
      await sleep(1000);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = LOGIN_URL;
    }
  };
  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        <div className="flex justify-between">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Sesi Login
          </h2>
          <Button variant="destructive" size="sm" onClick={handleLogoutAll}>
            Keluar Semua
          </Button>
        </div>

        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-background-secondary p-4 rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">
                  {session.browser} • {session.platform}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dateFormat.indonesianDate(new Date(session.updatedAt))}
                </p>
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="bg-pink-500 hover:bg-pink-600 text-white px-6"
                onClick={() => handleLogout(session.refreshToken)}
              >
                Keluar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
