"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Image from "next/image";
import { EditProfileModal } from "./edit-profile-modal";
import { useAuthProfileGetProfile } from "@/services/auth.api";
import { DEFAULT_USER_AVATAR } from "@/constants";

export function PersonalInformation() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: profileData } = useAuthProfileGetProfile();
  const profile = profileData?.data?.data;

  return (
    <Card className="h-fit">
      <CardContent className="py-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Informasi Personal
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-40 h-40 rounded-full overflow-hidden mb-4 md:hidden ">
          <Image
            src={profile?.image || DEFAULT_USER_AVATAR}
            alt="Foto Profil"
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-row items-center gap-6">
          <div className="w-32 h-32 rounded-full overflow-hidden hidden md:block flex-shrink-0 ">
            <Image
              src={profile?.image || DEFAULT_USER_AVATAR}
              alt="Foto Profil"
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </div>
          <div className=" md:max-w-[70%]">
            <h3 className="font-semibold text-lg mb-2">
              {profile?.name || "-"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile?.description || "Belum ada deskripsi"}
            </p>
          </div>
        </div>

        <div className=" mt-6 flex-1  flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-[92%]">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Nama Lengkap
            </label>
            <p className="text-foreground font-medium">
              {profile?.name || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-foreground font-medium">
              {profile?.email || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Telepon
            </label>
            <p className="text-foreground font-medium">
              {profile?.phone
                ? `(${profile?.countryCode})${profile?.phone}`
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </Card>
  );
}
