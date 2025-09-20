"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { countBusiness } from "@/services/business.api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import { LogoLoader } from "@/components/base/logo-loader";

export default function Home() {
  useCheckBusiness();
  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)]">
      <LogoLoader />
    </div>
  );
}

const useCheckBusiness = () => {
  const router = useRouter();

  return useEffect(() => {
    /* Ambil token dari query string */
    const params = new URLSearchParams(window.location.search);
    const tokenFromParam = params.get("postmaticAccessToken");
    const refreshTokenFromParam = params.get("postmaticRefreshToken");
    const rootBusinessIdFromParam = params.get("rootBusinessId");

    /* 🔹 Jika ada token di query param */
    if (tokenFromParam) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenFromParam);
    }

    if (refreshTokenFromParam) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenFromParam);
    }

    countBusiness()
      .then((totalBusiness) => {
        if (!totalBusiness || totalBusiness === 0) {
          console.log("no business");
          router.replace("/business/new-business");
        } else if (rootBusinessIdFromParam) {
          console.log("rootBusinessIdFromParam", rootBusinessIdFromParam);
          router.replace(`/business/${rootBusinessIdFromParam}`);
        } else {
          console.log("business");
          router.replace("/business");
        }
      })
      .catch((error) => {
        console.log("error", error);
      });

    console.log("done");

    return;
  }, [router]);
};
