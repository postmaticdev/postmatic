"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooterWithButton,
} from "@/components/ui/dialog";
import { ChevronDown, Shield, Trash2 } from "lucide-react";
import {
  useMemberDelete,
  useMemberGetAllMembers,
  useMemberInvite,
  useMemberUpdateRole,
} from "@/services/member.api";
import { useParams } from "next/navigation";
import { MemberRole } from "@/models/api/business/index.type";
import { showToast } from "@/helper/show-toast";
import { MembersInvitePld } from "@/models/api/member/index.type";
import { JOINED_STATUS, ROLES } from "./members-table";

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessIdFromProps: string | null;
}

export function MemberManagementModal({
  isOpen,
  onClose,
  businessIdFromProps: businessIdFromProps,
}: MemberManagementModalProps) {
  const [formData, setFormData] = useState<MembersInvitePld>({
    email: "",
    role: "Member",
  });

  const { businessId } = useParams() as { businessId: string };
  const { data: dataMembers } = useMemberGetAllMembers(
    businessIdFromProps || businessId || ""
  );
  const members = dataMembers?.data?.data || [];
  const mInvite = useMemberInvite();
  const mUpdateRole = useMemberUpdateRole();
  const mDelete = useMemberDelete();

  const handleAddMember = async () => {
    try {
      const res = await mInvite.mutateAsync({
        businessId: businessIdFromProps || businessId || "",
        formData,
      });
      showToast("success", res.data.responseMessage);
      setFormData({
        email: "",
        role: "Member",
      });
    } catch {}
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const res = await mDelete.mutateAsync(id);
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  const onChangeRole = async (id: string, role: MemberRole) => {
    try {
      const findMember = members.find((member) => member.id === id);
      if (findMember?.role === role) return;
      const res = await mUpdateRole.mutateAsync({
        businessId,
        formData: {
          memberId: id,
          role,
        },
      });
      showToast("success", res.data.responseMessage);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <div>
            <DialogTitle>Member Management</DialogTitle>
            <DialogDescription>
              Undang, ubah role, hapus member, dan kirim ulang undangan untuk
              status pending.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          {/* Add New Member Section */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="masukkan email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {formData.role}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {ROLES.map((role) => (
                        <DropdownMenuItem
                          key={role.value}
                          onClick={() =>
                            setFormData({ ...formData, role: role.value })
                          }
                        >
                          {role.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button
                  onClick={handleAddMember}
                  className="bg-primary hover:bg-blue-700 text-white"
                >
                  + Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Members Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Anggota Sekarang</h3>
            <div className="space-y-3">
              {members?.map((member, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.profile.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.profile.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.profile.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center flex-row space-x-3">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 border-0"
                        >
                          {member.status}
                        </Badge>

                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="flex items-center space-x-1"
                          >
                            <Shield className="h-3 w-3" />
                            <span>{member.role}</span>
                          </Badge>

                          {JOINED_STATUS.includes(member.status) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {ROLES.map((role) => (
                                  <DropdownMenuItem
                                    key={role.value}
                                    onClick={() =>
                                      onChangeRole(member.id, role.value)
                                    }
                                  >
                                    {role.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                          {JOINED_STATUS.includes(member.status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleDeleteMember(member.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooterWithButton buttonMessage="Simpan" onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}
