// Token

export interface TokenProductRes {
  discount: Discount;
  products: ProductToken[];
}

export interface Discount {
  message: string;
  detail: Detail;
}

export interface Detail {
  id: string;
  discount: number;
  name: string;
  type: string;
  description: string;
  maxDiscount: number;
  maxUses: number | null;
  expiredAt: string;
  isReusable: boolean;
}

export interface ProductToken {
  id: string;
  price: number;
  token: number;
  tokenType: string;
  pricingByMethod: PricingByMethod[];
}

export interface PricingByMethod {
  detail: DetailPricingItem;
  issued: Issued;
  subtotal: Subtotal;
  admin: Admin;
  discount: Discount2;
}

export interface Issued {
  name: string;
  code: string;
  image: string;
}

export interface Subtotal {
  item: number;
  afterDiscount: number;
  afterAdmin: number;
  afterTax: number;
  total: number;
}

export interface Admin {
  fee: number;
  type: string;
  percentage: number;
}

export interface Discount2 {
  fee: number;
  type: string;
  percentage: number;
}

// Subscription
export interface SubscriptionProductRes {
  discount: Discount;
  products: ProductSubscription[];
}

export interface Discount {
  message: string;
  detail: Detail;
}

export interface Detail {
  id: string;
  discount: number;
  name: string;
  type: string;
  description: string;
  maxDiscount: number;
  maxUses: number | null;
  expiredAt: string;
  isReusable: boolean;
}

export interface ProductSubscription {
  id: string;
  benefits: string[];
  name: string;
  appProductSubscriptionItems: AppProductSubscriptionItem[];
}

export interface AppProductSubscriptionItem {
  id: string;
  name: "Monthly" | "Annually" | "Free";
  price: number;
  description?: string;
  subscriptionValidFor: number;
  tokenImage: number;
  tokenVideo: number;
  tokenLive: number;
  isClaimed: boolean;
  pricingByMethod: PricingByMethod[];
}

export interface DetailPricingItem {
  item: number;
  discount: number;
  admin: number;
  tax: number;
}

export interface Subtotal {
  item: number;
  afterDiscount: number;
  afterAdmin: number;
  afterTax: number;
  total: number;
}

export interface Admin {
  fee: number;
  type: string;
  percentage: number;
}

export interface Discount2 {
  fee: number;
  type: string;
  percentage: number;
}

// Detail
export interface ProductDetailRes {
  id: string;
  name: string;
  description: string;
  type: "subscription" | "token";
  pricingByMethod: {
    type: "Virtual Account" | "E-Wallet";
    methods: PricingByMethod[];
  }[];
  validFor: number;
  validForInfo: "monthly" | "annually" | "unlimited";
  defaultPrice: number;
  isValidCode: boolean;
  hintCode: string | null;
  benefitCode: string | null;
}

export interface ProductDetailParamsPld {
  rootBusinessId: string;
  productId: string;
  type: "subscription" | "token";
  code?: string;
}
