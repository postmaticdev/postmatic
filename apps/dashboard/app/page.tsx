"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { countBusiness } from "@/services/business.api";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";

export default function Home() {
  useCheckBusiness();
  return null;
}

const useCheckBusiness = () => {
  const router = useRouter();

  return useEffect(() => {
    /* Ambil token dari query string */
    const params = new URLSearchParams(window.location.search);
    const tokenFromParam = params.get("postmaticToken");
    const refreshTokenFromParam = params.get("postmaticRefreshToken");
    const rootBusinessIdFromParam = params.get("rootBusinessId");

    /* 🔹 Jika ada token di query param */
    if (tokenFromParam) {
      localStorage.setItem(ACCESS_TOKEN_KEY, tokenFromParam);
    }

    if (refreshTokenFromParam) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenFromParam);
    }

    countBusiness().then((totalBusiness) => {
      if (!totalBusiness || totalBusiness === 0) {
        router.replace("/business/new-business");
      } else if (rootBusinessIdFromParam) {
        router.replace(`/business/${rootBusinessIdFromParam}`);
      } else {
        router.replace("/business");
      }
    });

    return;
  }, [router]);
};
