"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Lock, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { UploadPhoto } from "@/components/forms/upload-photo";
import {
  useAuthProfileChangePassword,
  useAuthProfileGetProfile,
  useAuthProfileUpdateProfile,
} from "@/services/auth.api";
import { ProfilePld, UpdatePasswordPld } from "@/models/api/auth/profile.type";
import { showToast } from "@/helper/show-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import countryCodes from "@/lib/country-code.json";

type ViewMode = "profile" | "password";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData: ProfilePld = {
  countryCode: "",
  phone: "",
  image: null,
  email: "",
  name: "",
  description: "",
};

type UpdatePasswordData = UpdatePasswordPld & { confirmPassword: string };
const initialPasswordData: UpdatePasswordData = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialShowPasswords = {
  current: false,
  new: false,
  confirm: false,
};

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { data: profileData } = useAuthProfileGetProfile();
  const profile = profileData?.data?.data;
  const mUpdateProfile = useAuthProfileUpdateProfile();
  const mChangePassword = useAuthProfileChangePassword();

  const [formData, setFormData] = useState<ProfilePld>(initialFormData);
  const [passwordData, setPasswordData] =
    useState<UpdatePasswordData>(initialPasswordData);
  const [showPasswords, setShowPasswords] = useState(initialShowPasswords);
  useEffect(() => {
    if (profile) {
      setFormData({
        countryCode: profile.countryCode || "",
        phone: profile.phone || "",
        image: profile.image || null,
        email: profile.email || "",
        name: profile.name || "",
        description: profile.description || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      if (!profile) return;
      const res = await mUpdateProfile.mutateAsync(formData);
      showToast("success", res.data.responseMessage);
      onClose();
    } catch {}
  };

  const [currentView, setCurrentView] = useState<ViewMode>("profile");

  const handleInputChange = (field: keyof ProfilePld, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (
    field: keyof UpdatePasswordData,
    value: string
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field as keyof UpdatePasswordData]: value,
    }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = () => {
    setCurrentView("password");
  };

  const handleBackToProfile = () => {
    setCurrentView("profile");
    // Reset password form when going back
    setPasswordData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handlePasswordSave = async () => {
    try {
      const res = await mChangePassword.mutateAsync(passwordData);
      showToast("success", res.data.responseMessage);
      onClose();
      setCurrentView("profile");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    } catch {}
  };

  const handleModalClose = () => {
    setCurrentView("profile");
    setPasswordData(initialPasswordData);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <div>
            <DialogTitle>
              {currentView === "profile" ? "Edit Profil" : "Ganti Password"}
            </DialogTitle>
            <DialogDescription>
              {currentView === "profile"
                ? "Ubah profile anda"
                : "Masukkan password saat ini dan password baru"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentView === "profile" ? (
            <>
              {/* Profile Image */}
              <div className="flex justify-center">
                <UploadPhoto
                  label="Foto Profil"
                  onImageChange={(image: string | null) => {
                    setFormData((prev) => ({
                      ...prev,
                      image: image,
                    }));
                  }}
                  currentImage={formData.image}
                />
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-card"
                  placeholder="Masukkan nama lengkap..."
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="bg-card min-h-24 resize-none"
                  placeholder="Masukkan bio anda..."
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-card"
                  placeholder="Masukkan email..."
                  disabled
                />
              </div>

              {/* Phone with Country Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">No HP</label>
                <div className="flex space-x-2">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) =>
                      handleInputChange("countryCode", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Kode">
                        {formData.countryCode &&
                          countryCodes.find(
                            (c) => c.dial_code === formData.countryCode
                          )?.dial_code}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem
                          key={country.dial_code}
                          value={country.dial_code}
                        >
                          {country.name} ({country.dial_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-card flex-1"
                    placeholder="Masukkan nomor HP..."
                  />
                </div>
              </div>

              {/* Change Password Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-between space-x-3 bg-card text-muted-foreground hover:bg-background"
                  onClick={handleChangePassword}
                >
                  <div className="flex items-center space-x-3">
                    <Lock className="h-5 w-5" />
                    <span className="text-sm font-medium">Ganti Password</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Saat Ini</label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      handlePasswordChange("oldPassword", e.target.value)
                    }
                    className="bg-card pr-10"
                    placeholder="Masukkan password saat ini..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Password Baru</label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    className="bg-card pr-10"
                    placeholder="Masukkan password baru..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    className="bg-card pr-10"
                    placeholder="Konfirmasi password baru..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0">
          {currentView === "password" && (
            <Button
              variant="outline"
              onClick={handleBackToProfile}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali</span>
            </Button>
          )}
          <div className={currentView === "password" ? "ml-auto" : "w-full"}>
            <Button
              onClick={
                currentView === "profile"
                  ? handleSaveProfile
                  : handlePasswordSave
              }
              className="w-full flex items-center justify-center space-x-2"
            >
              <span>
                {currentView === "profile"
                  ? "Simpan Perubahan"
                  : "Ubah Password"}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
