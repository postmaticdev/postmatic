"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooterWithButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConnectedPlatformForm } from "@/app/business/[businessId]/knowledge-base/(components)/(form)/connected-platform-form";

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformModal({ isOpen, onClose }: PlatformModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kelola Platform Social Media</DialogTitle>
          <DialogDescription>
            Hubungkan atau putuskan platform media sosial Anda untuk
            meningkatkan strategi konten
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <ConnectedPlatformForm />
        </div>
        <DialogFooterWithButton buttonMessage="Tutup" onClick={onClose} />
      </DialogContent>
    </Dialog>
  );
}
