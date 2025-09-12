import { z } from "zod";

// ==================================
//             REQUIRED
// ==================================
export const MidtransItemDetailSchema = z.object({
  id: z.string(),
  price: z.number().positive(),
  quantity: z.number().positive(),
  name: z.string(),
  brand: z.string().optional(),
  category: z.string().optional(),
  merchant_name: z.string().optional(),
  url: z.string().url().optional(),
});

export type MidtransItemDetail = z.infer<typeof MidtransItemDetailSchema>;

export const TransactionDetailsSchema = z.object({
  order_id: z.string(),
  gross_amount: z.number().positive(),
});
export type TransactionDetails = z.infer<typeof TransactionDetailsSchema>;

export const CustomerDetailsSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
export type CustomerDetails = z.infer<typeof CustomerDetailsSchema>;

// ==================================
//           BankTransfer
// ==================================
// export const BankTransferSchema = z.object({
//   bank: z.enum(["bca", "bni", "bri", "cimb"]),
// });
export const BankTransferSchema = z.object({
  bank: z.string(),
});
export type BankTransfer = z.infer<typeof BankTransferSchema>;

export const BankTransferPayloadSchema = z.object({
  payment_type: z.enum(["bank_transfer"]),
  transaction_details: TransactionDetailsSchema,
  customer_details: CustomerDetailsSchema,
  item_details: z.array(MidtransItemDetailSchema),
  bank_transfer: BankTransferSchema,
});
export type BankTransferPayload = z.infer<typeof BankTransferPayloadSchema>;

export const VaNumberSchema = z.object({
  bank: z.string(),
  va_number: z.string(),
});

export type VaNumber = z.infer<typeof VaNumberSchema>;

export const MidtransBankTransferResponseChargeSchema = z.object({
  status_code: z.string(),
  status_message: z.string(),
  transaction_id: z.string(),
  order_id: z.string(),
  merchant_id: z.string(),
  gross_amount: z.string(),
  currency: z.string(),
  payment_type: z.string(),
  transaction_time: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string(),
  va_numbers: z.array(VaNumberSchema).optional(),
  permata_va_number: z.string().optional(),
  expiry_time: z.string(),
});

export type MidtransBankTransferResponseCharge = z.infer<
  typeof MidtransBankTransferResponseChargeSchema
>;

// ==================================
//              QRIS
// ==================================
export const GopayPayloadSchema = z.object({
  payment_type: z.enum(["gopay", "qris"]),
  transaction_details: TransactionDetailsSchema,
  customer_details: CustomerDetailsSchema,
  item_details: z.array(MidtransItemDetailSchema),
});
export type GopayPayload = z.infer<typeof GopayPayloadSchema>;

export type MidtransGopayResponseCharge = z.infer<
  typeof MidtransGopayResponseChargeSchema
>;

export const ActionSchema = z.object({
  name: z.string(),
  method: z.string(),
  url: z.string(),
});

export const MidtransGopayResponseChargeSchema = z.object({
  status_code: z.string(),
  status_message: z.string(),
  transaction_id: z.string(),
  order_id: z.string(),
  merchant_id: z.string(),
  gross_amount: z.string(),
  currency: z.string(),
  payment_type: z.string(),
  transaction_time: z.string(),
  transaction_status: z.string(),
  fraud_status: z.string(),
  actions: z.array(ActionSchema),
  acquirer: z.string(),
  qr_string: z.string(),
  expiry_time: z.string(),
});

export type Action = z.infer<typeof ActionSchema>;

// ==================================
//          CHECK STATUS
// ==================================

export const MidtransTransactionStatusEnum = z.enum([
  "pending", // Sudah checkout, menunggu user transfer ke VA
  "settlement", // Dana sudah diterima, transaksi sukses
  "cancel", // Transaksi dibatalkan manual atau sistem
  "expire", // Waktu transfer habis, VA sudah expired, user tidak membayar
  "deny", // Ditolak oleh sistem, biasanya karena salah input atau fraud
  "refund", // Dana dikembalikan (full/parsial), transaksi direfund
  "failure", // Error sistem, sangat jarang tapi bisa muncul
]);

export type TransactionStatus = z.infer<typeof MidtransTransactionStatusEnum>;

export const MidtransResponseCheckStatusSchema = z.object({
  transaction_time: z.string(), // ISO datetime string
  transaction_status: z.enum([
    "capture",
    "settlement",
    "pending",
    "deny",
    "cancel",
    "expire",
    "failure",
    "refund",
  ]),
  transaction_id: z.string(),
  status_message: z.string(),
  status_code: z.string(),
  signature_key: z.string(),
  settlement_time: z.string().optional(), // <- ini penting
  payment_type: z.string(), // atau z.enum([...]) kalau mau ketat
  order_id: z.string(),
  merchant_id: z.string(),
  gross_amount: z.string(),
  fraud_status: z.enum(["accept", "challenge", "deny"]).optional(), // bisa tidak ada kalau non-CC
  currency: z.enum(["IDR"]),
});

export type MidtransResponseCheckStatusDTO = z.infer<
  typeof MidtransResponseCheckStatusSchema
>;
