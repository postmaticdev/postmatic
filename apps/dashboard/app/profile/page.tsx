"use client";

import { Header } from "@/components/base/header";
import { WelcomeSection } from "@/components/base/welcome-section";
import { PersonalInformation } from "@/app/profile/(components)/personal-information";
import { DetailInformation } from "@/app/profile/(components)/detail-information";
import { BusinessInformation } from "@/app/profile/(components)/business-information";
import { SessionLogin } from "@/app/profile/(components)/session-login";
import { CreatorDesignInformation } from "@/app/profile/(components)/creator-design-information";
import { useAuthProfileGetProfile } from "@/services/auth.api";

export default function Profile() {
  const { data: profile } = useAuthProfileGetProfile();
  const userName = profile?.data?.data?.name;
  const greeting = `Selamat datang, ${userName}`;
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="py-4 sm:py-6 px-4 sm:px-6">
        <WelcomeSection message="Atur dan edit profil anda." title={greeting} />

        <div className="flex flex-col lg:flex-row gap-6 w-full ">
          <div className="w-full lg:w-3/5 ">
            <PersonalInformation />
            <div className="hidden lg:block mt-6">
              <CreatorDesignInformation />
            </div>
          </div>
          <div className="w-full lg:w-2/5 space-y-6">
            <DetailInformation />
            <BusinessInformation />
            <SessionLogin />
          </div>
          <div className="lg:hidden">
            <CreatorDesignInformation />
          </div>
        </div>
      </main>
    </div>
  );
}
