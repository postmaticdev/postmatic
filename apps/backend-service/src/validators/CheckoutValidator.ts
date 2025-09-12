import db from "../config/db";
import { z } from "zod";

export const EWalletCheckoutSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  type: z.enum(["token", "subscription"]),
  discountCode: z.string().nullable().optional(),
  acquirer: z.enum(["gopay", "qris"]),
});

export type EWalletCheckoutDTO = z.infer<typeof EWalletCheckoutSchema>;

const fetchBank = async (): Promise<string[]> => {
  const paymentMethod = await db.appPaymentMethod.findMany({
    where: {
      type: "Virtual Account",
      isActive: true,
    },
  });
  return paymentMethod.map((item) => item.code);
};

export const AwaitedBankCheckoutSchema = async () => {
  const bank = await fetchBank();
  return z.object({
    productId: z.string().min(1, "Product ID is required"),
    type: z.enum(["token", "subscription"]),
    bank: z.enum(bank as [string, ...string[]]),
    discountCode: z.string().nullable().optional(),
  });
};

export type AwaitedBankCheckoutDTO = z.infer<
  Awaited<ReturnType<typeof AwaitedBankCheckoutSchema>>
>;
