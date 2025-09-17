export interface BankPld {
  bank: string;
  productId: string;
  type: "subscription" | "token";
  discountCode?: string;
}

export interface EWalletPld {
  productId: string;
  type: "subscription" | "token";
  discountCode?: string;
  acquirer: "gopay" | "qris" | "";
}

export interface CheckoutRes {
  id: string;
  midtransId: string;
  productName: string;
  productType: string;
  totalAmount: number;
  method: string;
  token: number;
  expiredAt: string;
  status: string;
  appProductSubscriptionItemId: string;
  appProductTokenId: string | null;
  profileId: string;
  rootBusinessId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  paymentActions: PaymentAction[];
  paymentDetails: PaymentDetail[];
  discountCode?:
    | string
    | null /* tambahan jika API mengembalikan kode diskon */;
}

export interface PaymentAction {
  action: string;
  value: string;
  type: "image" | "redirect" | "text";
  method: string;
}

export interface PaymentDetail {
  name: string;
  price: number;
}
