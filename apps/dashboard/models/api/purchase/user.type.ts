export interface UserPurchaseRes {
  id: string;
  totalAmount: number;
  method: string;
  productName: string;
  productType: string;
  status: string;
  token: number;
  createdAt: string;
  updatedAt: string;
  profileId?: string;
  rootBusinessId?: string;
  midtransId?: string;
  appProductSubscriptionItem?: AppProductSubscriptionItem;
  appProductToken?: string | null;
  paymentActions: PaymentAction[];
  paymentDetails: PaymentDetail[];
}

export interface AppProductSubscriptionItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  appProductSubscriptionId: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAction {
  id: string;
  action: string;
  method: string;
  value: string;
  paymentPurchaseId: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDetail {
  name: string;
  price: number;
}
