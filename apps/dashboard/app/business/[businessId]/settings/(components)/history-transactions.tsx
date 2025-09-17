"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Eye } from "lucide-react";
import { useBusinessPurchaseGetHistory } from "@/services/purchase.api";
import { useParams } from "next/navigation";
import { mapEnumPaymentStatus } from "@/helper/map-enum-payment-status";
import { BusinessPurchaseRes } from "@/models/api/purchase/business.type";
import { PurchaseDetailModal } from "@/app/business/[businessId]/settings/(components)/purchase-detail-modal";
import { useState } from "react";
import { NoContent } from "@/components/base/no-content";

export function HistoryTransactions() {
  const { businessId } = useParams() as { businessId: string };
  const { data: transactionsData } = useBusinessPurchaseGetHistory(businessId);
  const transactions = transactionsData?.data?.data || [];
  const [selectedTransaction, setSelectedTransaction] =
    useState<BusinessPurchaseRes | null>(null);
  const onViewDetail = (transaction: BusinessPurchaseRes) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-card ">
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-screen">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground p-4">
              Riwayat Pembelian
            </CardTitle>
            {transactions.length > 0 ? (
            <table className="w-full ">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4 font-medium text-foreground">
                    Created At
                  </th>
                  <th className="p-4 font-medium text-foreground">Product</th>
                  <th className="p-4 font-medium text-foreground">Type</th>
                  <th className="p-4 font-medium text-foreground">Method</th>
                  <th className="p-4 font-medium text-foreground">Total</th>
                  <th className="p-4 font-medium text-foreground">Status</th>
                  <th className="p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-border last:border-b-0 hover:bg-muted/50"
                  >
                    <td className="p-4 text-foreground">
                      {transaction.createdAt}
                    </td>
                    <td className="p-4 text-foreground">
                      {transaction.productName}
                    </td>
                    <td className="p-4 text-foreground">
                      {transaction.productType}
                    </td>
                    <td className="p-4 text-foreground">
                      {transaction.method}
                    </td>
                    <td className="p-4 text-foreground">
                      {transaction.totalAmount}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={`${mapEnumPaymentStatus.getStatusColor(
                          transaction.status
                        )} border-0`}
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(transaction)}
                        className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <NoContent
                icon={CreditCard}
                title="Tidak ada riwayat pembelian"
                titleDescription="Bisnis anda belum melakukan pembelian apapun"
              />
            )}
          </div>
        </CardContent>
      </Card>
      <PurchaseDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
        setTransaction={setSelectedTransaction}
      />
    </div>
  );
}
