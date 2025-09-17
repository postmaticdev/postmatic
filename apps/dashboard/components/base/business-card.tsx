"use client";

import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_BUSINESS_IMAGE } from "@/constants";
import { useBusinessDelete } from "@/services/business.api";
import { showToast } from "@/helper/show-toast";

interface BusinessCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  owner?: {
    name: string;
    image: string;
  };
  onClickInvite?: () => void;
}

export function BusinessCard({
  id,
  name,
  description,
  imageUrl,
  owner,
  onClickInvite,
}: BusinessCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/business/${id}/dashboard`);
  };

  const handleClickInvite = () => {
    onClickInvite?.();
  };

  const mDelete = useBusinessDelete();

  const handleDelete = async () => {
    try {
      const res = await mDelete.mutateAsync(id);
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  return (
    <Card
      className="group transition-all duration-300 hover:scale-105 bg-card border-border shadow-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="py-4 md:py-6">
        {/* Image Section */}
        <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg overflow-hidden">
          {/* Business Image Content */}

          <Image
            src={imageUrl || DEFAULT_BUSINESS_IMAGE}
            alt="Gambar Bisnis"
            fill
            className="object-cover rounded-xl select-none pointer-events-none
             transform-gpu transition-transform duration-500 ease-out will-change-transform
             group-hover:scale-110"
            priority
          />

          {/* Interactive Elements */}

          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-card hover:bg-muted/30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickInvite();
                  }}
                >
                  Undang
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-foreground mb-1 text-sm sm:text-base">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
            {description}
          </p>

          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
              <AvatarImage src={owner?.image} alt={owner?.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                🦉
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{owner?.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
