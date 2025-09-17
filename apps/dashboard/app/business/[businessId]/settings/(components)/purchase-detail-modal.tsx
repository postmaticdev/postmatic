"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooterWithButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy} from "lucide-react";
import {
  BusinessPurchaseRes,
  PaymentAction,
} from "@/models/api/purchase/business.type";
import { showToast } from "@/helper/show-toast";
import { formatIdr } from "@/helper/formatter";
import Image from "next/image";
import { dateFormat } from "@/helper/date-format";
import {
  businessPurchaseService
} from "@/services/purchase.api";
import { useParams } from "next/navigation";
import { mapEnumPaymentStatus } from "@/helper/map-enum-payment-status";
import { useQueryClient } from "@tanstack/react-query";

interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BusinessPurchaseRes | null;
  setTransaction: (transaction: BusinessPurchaseRes) => void;
}

export function PurchaseDetailModal({
  isOpen,
  onClose,
  transaction,
  setTransaction,
}: PurchaseDetailModalProps) {
  const { businessId } = useParams() as { businessId: string };
  const queryClient = useQueryClient();
  if (!transaction) return null;

  const { paymentDetails, paymentActions } = transaction;

  const renderPaymentActions = (item: PaymentAction) => {
    switch (item.type) {
      case "claim":
        return (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Item sudah diambil melalui claim
            </div>
          </div>
        );
      case "redirect":
        return (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRedirect(item.value)}
            >
              Klik untuk melakukan pembayaran
            </Button>

            <div className="text-sm text-muted-foreground">
              Anda akan diarahkan ke halaman pembayaran, harap melakukan
              pembayaran sesuai dengan instruksi yang diberikan.
            </div>
          </div>
        );
      case "text":
        return (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">{item.action}</div>
            <div className="flex items-center space-x-2">
              <Input
                value={item.value}
                readOnly
                className="font-mono text-blue-600 font-bold bg-gray-50 text-sm sm:text-base flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(item.value)}
                className="flex-shrink-0 px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Gunakan {item.action} di atas untuk melakukan pembayaran.
            </div>
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">QRIS</div>
            <div className="flex items-center space-x-2">
              <Image
                src={item.value}
                alt={item.action}
                width={600}
                height={600}
                className="aspect-square rounded-lg w-full h-auto"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Gunakan gambar di atas untuk melakukan pembayaran.
            </div>
          </div>
        );
    }
  };

  const handleCopy = async (str: string) => {
    try {
      await navigator.clipboard.writeText(str);
      showToast("success", "Berhasil menyalin nomor virtual account");
    } catch {
      showToast("error", "Gagal menyalin");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRedirect = (url: string) => {
    window.open(url, "_blank");
  };

  const handleCheckPaymentStatus = async () => {
    try {
      const { data: res } = await businessPurchaseService.getDetail(
        businessId,
        transaction.id
      );

      showToast(
        "success",
        mapEnumPaymentStatus.getStatusDescription(res.data.status)
      );
      if (res.data.status !== transaction.status) {
        queryClient.invalidateQueries({
          queryKey: ["businessPurchaseDetail"],
        });
      }
      setTransaction(res.data);

      console.log(res);
    } catch (e) {
      console.log(e);
      showToast("error", "Gagal memeriksa status pembayaran");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <div>
            <DialogTitle>Purchase Detail</DialogTitle>
            <DialogDescription>lihat detail pembelian disini</DialogDescription>
          </div>
        </DialogHeader>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 p-6">
          {/* Invoice and Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Invoice</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs">📄</span>
                    </div>
                    <span className="font-mono text-sm font-bold">
                      {transaction.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(transaction.status)} border-0`}
                  >
                    {transaction.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Method and Total Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Method</div>
                  <div className="font-bold">
                    {transaction?.method?.toUpperCase()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Total</div>
                  <div className="font-bold">
                    {formatIdr(transaction.totalAmount)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Section */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <CardTitle>Product</CardTitle>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-bold">{transaction.productName}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-bold">{transaction.productType}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Created At</div>
                <div className="font-bold">
                  {dateFormat.indonesianDate(new Date(transaction.createdAt))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instruction Section */}
          {transaction.status === "Pending" && (
            <Card>
              <CardContent className="space-y-4 py-4">
                <CardTitle>Payment Instruction</CardTitle>
                {paymentActions.map((act) => (
                  <div key={act.id}>{renderPaymentActions(act)}</div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment Details Section */}
          <Card>
            <CardContent>
              <div className="space-y-3 py-4">
                <CardTitle>Payment Details</CardTitle>
                {paymentDetails.map((detail, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-muted-foreground">
                      {detail.name}
                    </span>
                    <span className="font-semibold">
                      {formatIdr(detail.price)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Purchased By Section */}
          <Card>
            <CardContent className="space-y-4 py-4">
              <CardTitle>Purchased By</CardTitle>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-bold">{transaction?.profile?.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-bold">{transaction?.profile?.email}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Role</div>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-800 border-0"
                >
                  {transaction?.profile?.members?.[0]?.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}

        <DialogFooterWithButton buttonMessage="Tutup" onClick={onClose}>
          <Button variant="outline" onClick={() => handleCheckPaymentStatus()}>
            Cek Status Pembayaran
          </Button>
        </DialogFooterWithButton>
      </DialogContent>
    </Dialog>
  );
}
