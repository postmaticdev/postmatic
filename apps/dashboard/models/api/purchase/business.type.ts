export interface BusinessPurchaseRes {
  id: string;
  totalAmount: number;
  method: string;
  productName: string;
  productType: string;
  status: EnumPaymentStatus;
  createdAt: string;
  updatedAt: string;
  paymentActions: PaymentAction[];
  paymentDetails: PaymentDetail[];
  profile: Profile;
}

export type EnumPaymentStatus =
  | "Pending"
  | "Success"
  | "Failed"
  | "Canceled"
  | "Refunded"
  | "Expired"
  | "Denied";

export interface PaymentAction {
  id: string;
  action: string;
  value: string;
  type: "image" | "redirect" | "text" | "claim";
  paymentPurchaseId: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetail {
  name: string;
  price: number;
}

export interface Profile {
  name: string;
  image?: string | null;
  email: string;
  members: Member[];
}

export interface Member {
  role: string;
}
