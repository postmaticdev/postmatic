"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useBusinessGetAll } from "@/services/business.api";
import { DEFAULT_BUSINESS_IMAGE } from "@/constants";
import Link from "next/link";

export function BusinessInformation() {
  const { data: businessesData } = useBusinessGetAll();
  const businesses = businessesData?.data?.data || [];
  return (
    <Card className="h-fit">
      <CardContent className="py-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Informasi Bisnis
        </h2>

        <div className={`space-y-4 ${businesses.length > 3 ? 'max-h-[400px] overflow-y-auto ' : ''}`}>
          {businesses.map((business) => (
            <div
              key={business.id}
              className="flex flex-col md:flex-row flex-warp md:items-center justify-between p-3 rounded-lg bg-background-secondary"
            >
              <div className="flex items-center flex-row gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Image
                    src={business.logo || DEFAULT_BUSINESS_IMAGE}
                    alt={business.name}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">
                    Nama Bisnis
                  </span>
                  <span className="font-medium text-foreground">
                    {business.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-row flex-warp items-center md:space-x-24 mt-4 md:mt-0 justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Peran
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {business?.userPosition?.role}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/business/${business.id}/dashboard`}
                  prefetch={false}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Lihat
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
