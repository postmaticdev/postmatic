import { BaseService } from "./BaseService";
import db from "../config/db";
import { AppPaymentMethod, DiscountType, $Enums } from ".prisma/client";
import {
  DiscountCalculateDTO,
  DiscountDTO,
  ProductDetailDTO,
} from "../validators/DiscountValidator";
import { DiscountService } from "./DiscountService";
import { stringManipulation } from "../helper/string-manipulation";

export class AppProductService extends BaseService {
  constructor(private discount: DiscountService) {
    super();
  }

  async getAllSubscriptionAppProducts(
    profileId: string,
    rootBusinessId: string,
    data: DiscountDTO
  ) {
    try {
      const [appProducts, methods, discount, countClaimedFreePlan] =
        await Promise.all([
          db.appProductSubscription.findMany({
            where: { deletedAt: null },
            select: {
              id: true,
              benefits: true,
              name: true,
              appProductSubscriptionItems: {
                where: { deletedAt: null },
                orderBy: {
                  price: "asc",
                },
                select: {
                  id: true,
                  name: true,
                  price: true,
                  description: true,
                  subscriptionValidFor: true,
                  tokenImage: true,
                  tokenVideo: true,
                  tokenLive: true,
                },
              },
            },
          }),
          db.appPaymentMethod.findMany({
            where: {
              isActive: true,
            },
          }),
          this.discount.validateDiscount({
            code: data.code,
            profileId,
            rootBusinessId,
          }),
          db.paymentPurchase.count({
            where: {
              profileId,
              rootBusinessId,
              status: "Success",
              method: "claim",
            },
          }),
        ]);
      const isClaimed = countClaimedFreePlan > 0;
      const orderedAppProducts = appProducts.sort((a, b) => {
        return (
          a.appProductSubscriptionItems.reduce(
            (acc, item) => acc + item.price,
            0
          ) -
          b.appProductSubscriptionItems.reduce(
            (acc, item) => acc + item.price,
            0
          )
        );
      });
      const returnData = orderedAppProducts.map((appProduct) => {
        return {
          ...appProduct,
          appProductSubscriptionItems:
            appProduct.appProductSubscriptionItems.map((appProductSubs) => {
              const pricingByMethod: PricingByMethod[] = [];
              for (const method of methods) {
                const isTypeExist = pricingByMethod.find(
                  (item) => item.type === method.type
                );
                const fixDiscount =
                  typeof discount === "string" || !discount ? null : discount;
                const pricing = this.getPrice(
                  appProductSubs.price,
                  method,
                  fixDiscount
                );
                const isFree = appProductSubs.price === 0;
                // @ts-ignore
                appProductSubs.isClaimed = isClaimed && isFree;
                if (isTypeExist && !isFree) {
                  isTypeExist.methods.push(pricing);
                } else if (!isFree) {
                  pricingByMethod.push({
                    type: method.type,
                    methods: [pricing],
                  });
                }
              }
              return {
                ...appProductSubs,
                pricingByMethod,
              };
            }),
        };
      });

      return {
        discount: {
          message:
            typeof discount === "string" ? discount : "Kode diskon valid",
          detail: typeof discount === "string" ? null : discount,
        },
        products: returnData,
      };
    } catch (err) {
      this.handleError("AppProductService.getAllSubscriptionAppProducts", err);
    }
  }

  async getAllTokenAppProducts(
    profileId: string,
    rootBusinessId: string,
    data: DiscountCalculateDTO
  ) {
    try {
      const [tokenProducts, methods, discount] = await Promise.all([
        db.appProductToken.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            price: true,
            token: true,
            tokenType: true,
          },
          orderBy: {
            price: "asc",
          },
        }),
        db.appPaymentMethod.findMany({
          where: {
            isActive: true,
          },
        }),
        this.discount.validateDiscount({
          code: data.code,
          profileId,
          rootBusinessId,
        }),
      ]);
      const returnData = tokenProducts.map((appProduct) => {
        const pricingByMethod: PricingByMethod[] = [];
        for (const method of methods) {
          const isTypeExist = pricingByMethod.find(
            (item) => item.type === method.type
          );
          const fixDiscount =
            typeof discount === "string" || !discount ? null : discount;
          const pricing = this.getPrice(appProduct.price, method, fixDiscount);
          const isFree = appProduct.price === 0;
          if (isTypeExist && !isFree) {
            isTypeExist.methods.push(pricing);
          } else if (!isFree) {
            pricingByMethod.push({
              type: method.type,
              methods: [pricing],
            });
          }
        }
        return {
          ...appProduct,
          pricingByMethod,
        };
      });

      return {
        discount: {
          message:
            typeof discount === "string" ? discount : "Kode diskon valid",
          detail: typeof discount === "string" ? null : discount,
        },
        products: returnData,
      };
    } catch (err) {
      this.handleError("AppProductService.getAllTokenAppProducts", err);
    }
  }

  getPrice(
    price: number,
    method: AppPaymentMethod,
    discount: {
      type: DiscountType;
      discount: number;
      maxDiscount: number | null;
    } | null
  ): Method {
    if (price === 0) {
      return {
        detail: {
          item: 0,
          discount: 0,
          admin: 0,
          tax: 0,
        },
        issued: {
          name: "Free",
          code: "Free",
          image: null,
        },
        subtotal: {
          item: 0,
          afterDiscount: 0,
          afterAdmin: 0,
          afterTax: 0,
          total: 0,
        },
        admin: {
          fee: 0,
          type: "Fixed",
          percentage: 0,
        },
        discount: {
          fee: 0,
          type: "Fixed",
          percentage: 0,
        },
      };
    }

    let discountFee = 0;
    if (discount) {
      if (discount?.type === "Fixed") {
        discountFee = discount.discount;
      } else {
        discountFee = Math.ceil(price * (discount.discount / 100));
      }
    }

    if (discount?.maxDiscount && discountFee > discount?.maxDiscount) {
      discountFee = discount.maxDiscount;
    }

    let adminFee = 0;
    if (method?.adminType === "Fixed") {
      adminFee = method.adminFee;
    } else if (method?.adminType === "Percentage") {
      adminFee = price * (method.adminFee / 100);
    }

    const subtotalWithDiscount = Math.ceil(price - discountFee);
    const subtotalAfterAdmin = Math.ceil(subtotalWithDiscount + adminFee);
    const tax = Math.ceil(subtotalAfterAdmin * (method?.taxFee || 0));
    const total = Math.ceil(subtotalAfterAdmin + tax);

    return {
      detail: {
        item: price,
        discount: Math.ceil(discountFee),
        admin: Math.ceil(adminFee),
        tax: Math.ceil(tax),
      },
      issued: {
        name: method?.name,
        code: method?.code,
        image: method?.image || null,
      },
      subtotal: {
        item: price,
        afterDiscount: subtotalWithDiscount,
        afterAdmin: subtotalAfterAdmin,
        afterTax: total,
        total: total,
      },
      admin: {
        fee: Math.ceil(adminFee),
        type: method?.adminType,
        percentage: method?.adminType === "Percentage" ? method.adminFee : 0,
      },
      discount: {
        fee: Math.ceil(discountFee),
        type: discount?.type || "Fixed",
        percentage: discount?.type === "Percentage" ? discount.discount : 0,
      },
    };
  }

  async getProductDetail(
    data: ProductDetailDTO,
    code: string | null,
    profileId: string
  ) {
    try {
      switch (data.type) {
        case "subscription":
          return this.getSubscriptionProductDetail(data, code, profileId);
        case "token":
          return this.getTokenProductDetail(data, code, profileId);
      }
      return null;
    } catch (error) {
      this.handleError("AppProductService.getProductDetail", error);
    }
  }
  private async getSubscriptionProductDetail(
    data: ProductDetailDTO,
    code: string | null,
    profileId: string
  ): Promise<ProductDetail | null> {
    try {
      const { productId, rootBusinessId } = data;
      const [checkProduct, methods, discount] = await Promise.all([
        db.appProductSubscriptionItem.findUnique({
          where: {
            id: productId,
          },
        }),
        db.appPaymentMethod.findMany({
          where: {
            isActive: true,
          },
        }),
        this.discount.validateDiscount({
          code,
          rootBusinessId,
          profileId,
        }),
      ]);
      if (!checkProduct) return null;
      if (checkProduct.price === 0) return null;
      if (checkProduct.deletedAt) return null;
      let hintCode: string | null = null;
      let isValidCode = true;
      let benefitCode: string | null = null;
      if (typeof discount === "string") {
        hintCode = discount;
        isValidCode = false;
        benefitCode = null;
      }
      if (discount && typeof discount === "object") {
        hintCode = null;
        isValidCode = true;
        benefitCode = this.buildBenefitCode(discount);
      }
      const pricingByMethod: PricingByMethod[] = [];
      for (const method of methods) {
        const pricing = this.getPrice(
          checkProduct.price,
          method,
          typeof discount === "string" || !discount ? null : discount
        );
        pricingByMethod.push({
          type: method.type,
          methods: [pricing],
        });
      }
      return {
        id: checkProduct.id,
        name: checkProduct.name,
        description:
          checkProduct.description || `${checkProduct.name} subscription`,
        type: "subscription",
        validFor: checkProduct.subscriptionValidFor,
        validForInfo:
        checkProduct.subscriptionValidFor === 30 ? "monthly" : "annually",
        defaultPrice: checkProduct.price,
        isValidCode,
        hintCode,
        benefitCode,
        pricingByMethod,
      };
    } catch (error) {
      this.handleError("AppProductService.getSubscriptionProductDetail", error);
      return null;
    }
  }

  private async getTokenProductDetail(
    data: ProductDetailDTO,
    code: string | null,
    profileId: string
  ): Promise<ProductDetail | null> {
    try {
      const { productId, rootBusinessId } = data;
      const [checkProduct, methods, discount] = await Promise.all([
        db.appProductToken.findUnique({
          where: {
            id: productId,
          },
        }),
        db.appPaymentMethod.findMany({
          where: {
            isActive: true,
          },
        }),
        this.discount.validateDiscount({
          code,
          rootBusinessId,
          profileId,
        }),
      ]);
      if (!checkProduct) return null;
      if (checkProduct.price === 0) return null;
      if (checkProduct.deletedAt) return null;
      let hintCode: string | null = null;
      let isValidCode = false;
      let benefitCode: string | null = null;
      if (typeof discount === "string") {
        hintCode = discount;
        isValidCode = false;
        benefitCode = null;
      }
      if (discount && typeof discount === "object") {
        hintCode = null;
        isValidCode = true;
        benefitCode = this.buildBenefitCode(discount);
      }
      const pricingByMethod: PricingByMethod[] = [];
      for (const method of methods) {
        const pricing = this.getPrice(
          checkProduct.price,
          method,
          typeof discount === "string" || !discount ? null : discount
        );
        pricingByMethod.push({
          type: method.type,
          methods: [pricing],
        });
      }
      return {
        id: checkProduct.id,
        name: `${checkProduct.token} Extra Token ${checkProduct.tokenType}`,
        description: checkProduct.tokenType,
        type: "token",
        validFor: 0,
        validForInfo: "unlimited",
        defaultPrice: checkProduct.price,
        isValidCode,
        hintCode,
        benefitCode,
        pricingByMethod,
      };
    } catch (error) {
      this.handleError("AppProductService.getTokenProductDetail", error);
      return null;
    }
  }

  private buildBenefitCode(
    discount: Awaited<ReturnType<typeof this.discount.validateDiscount>>
  ) {
    if (!discount) return null;
    if (typeof discount === "string") return null;
    const { maxDiscount, type, discount: discountValue } = discount;
    switch (type) {
      case "Fixed":
        return `Potongan ${stringManipulation.formatRupiah(discountValue)}`;
      case "Percentage":
        return `Potongan ${discountValue}% ${
          maxDiscount
            ? `dengan maksimum ${stringManipulation.formatRupiah(maxDiscount)}`
            : ""
        }`;
    }
  }
}

// Interface For Detail
interface ProductDetail {
  id: string;
  name: string;
  description: string;
  type: "subscription" | "token";
  pricingByMethod: PricingByMethod[];
  validFor: number;
  validForInfo: "monthly" | "annually" | "unlimited";
  defaultPrice: number;
  isValidCode: boolean;
  hintCode: string | null;
  benefitCode: string | null;
}

// Interface For All
interface PricingByMethod {
  type: string;
  methods: Method[];
}

interface Method {
  detail: Detail;
  issued: Issued;
  subtotal: Subtotal;
  admin: Admin;
  discount: Discount;
}

interface Detail {
  item: number;
  discount: number;
  admin: number;
  tax: number;
}

interface Issued {
  name: string;
  code: string;
  image: string | null;
}

interface Subtotal {
  item: number;
  afterDiscount: number;
  afterAdmin: number;
  afterTax: number;
  total: number;
}

interface Admin {
  fee: number;
  type: $Enums.AppPaymentAdminType;
  percentage: number;
}

interface Discount {
  fee: number;
  type: $Enums.DiscountType;
  percentage: number;
}
