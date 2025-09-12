import { BaseService } from "./BaseService";
import db from "../config/db";
import {
  AwaitedBankCheckoutDTO,
  EWalletCheckoutDTO,
} from "../validators/CheckoutValidator";
import { MidtransService } from "./MidtransService";
import { APP_NAME } from "../constant";
import { v4 as uuidv4 } from "uuid";
import { $Enums } from ".prisma/client";
import { AppProductService } from "./AppProductService";
import {
  MidtransResponseCheckStatusDTO,
  MidtransResponseCheckStatusSchema,
} from "../validators/MidtransValidator";
import { DiscountService } from "./DiscountService";
import { FilterQueryType } from "src/middleware/use-filter";
import moment from "moment-timezone";

export class PurchaseService extends BaseService {
  constructor(
    private midtrans: MidtransService,
    private app: AppProductService,
    private discount: DiscountService
  ) {
    super();
  }

  async getAllUserPurchases(profileId: string, filter: FilterQueryType) {
    try {
      const [purchases, totalData] = await Promise.all([
        db.paymentPurchase.findMany({
          where: {
            AND: [
              {
                profileId: profileId,
              },
              {
                deletedAt: null,
              },
              {
                productName: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              Object.values($Enums.PaymentStatus).includes(
                filter.category as unknown as $Enums.PaymentStatus
              )
                ? {
                    status: {
                      equals:
                        filter.category as unknown as $Enums.PaymentStatus,
                    },
                  }
                : {},
              {
                createdAt: {
                  gte: filter.dateStart ? filter.dateStart : undefined,
                  lte: filter.dateEnd ? filter.dateEnd : undefined,
                },
              },
            ],
          },
          orderBy: {
            [filter.sortBy]: filter.sort,
          },
          skip: filter.skip,
          take: filter.limit,
          select: {
            id: true,
            totalAmount: true,
            method: true,
            productName: true,
            productType: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            paymentActions: true,
            paymentDetails: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        }),
        db.paymentPurchase.count({
          where: {
            AND: [
              { profileId: profileId },
              {
                deletedAt: null,
              },
              {
                productName: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              Object.values($Enums.PaymentStatus).includes(
                filter.category as unknown as $Enums.PaymentStatus
              )
                ? {
                    status: {
                      equals:
                        filter.category as unknown as $Enums.PaymentStatus,
                    },
                  }
                : {},
              {
                createdAt: {
                  gte: filter.dateStart ? filter.dateStart : undefined,
                  lte: filter.dateEnd ? filter.dateEnd : undefined,
                },
              },
            ],
          },
        }),
      ]);

      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });

      return { data: purchases, pagination };
    } catch (err) {
      this.handleError("PurchaseService.getAllUserPurchases", err);
    }
  }

  async getUserPurchase(profileId: string, paymentPurchaseId: string) {
    try {
      const purchase = await db.paymentPurchase.findUnique({
        where: { id: paymentPurchaseId },
        select: {
          id: true,
          totalAmount: true,
          method: true,
          productName: true,
          productType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          profileId: true,
          appProductSubscriptionItem: true,
          appProductToken: true,
          paymentActions: true,
          midtransId: true,
          rootBusinessId: true,
          paymentDetails: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      });
      if (!purchase) return null;
      if (profileId !== purchase.profileId) return null;
      if (purchase.status === "Pending") {
        const check = await this.checkPaymentStatus(purchase);
        if (check) {
          if (check?.status === "Success") {
            await db.tokenIncome.createMany({
              data: this.buildTokenIncomeInputs({
                appProductSubscriptionItem: purchase.appProductSubscriptionItem,
                appProductToken: purchase.appProductToken,
                rootBusinessId: purchase.rootBusinessId,
              }),
            });
          }
          purchase.status = check?.status;
        }
      }
      const returnData = {
        ...purchase,
        originalProduct:
          purchase.appProductSubscriptionItem || purchase.appProductToken,
      };
      // @ts-ignore
      delete returnData.appProductSubscriptionItem;
      // @ts-ignore
      delete returnData.appProductToken;
      return purchase;
    } catch (err) {
      this.handleError("PurchaseService.getUserPurchase", err);
    }
  }

  async getAllBusinessPurchases(
    rootBusinessId: string,
    filter: FilterQueryType
  ) {
    try {
      const [purchases, totalData] = await Promise.all([
        db.paymentPurchase.findMany({
          where: {
            AND: [
              {
                rootBusinessId: rootBusinessId,
              },
              {
                deletedAt: null,
              },
              {
                productName: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              Object.values($Enums.PaymentStatus).includes(
                filter.category as unknown as $Enums.PaymentStatus
              )
                ? {
                    status: {
                      equals:
                        filter.category as unknown as $Enums.PaymentStatus,
                    },
                  }
                : {},
            ],
          },
          select: {
            id: true,
            totalAmount: true,
            method: true,
            productName: true,
            productType: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            paymentActions: true,
            paymentDetails: {
              select: {
                name: true,
                price: true,
              },
            },
            profile: {
              select: {
                name: true,
                image: true,
                email: true,
                members: {
                  where: {
                    rootBusinessId: rootBusinessId,
                  },
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            [filter.sortBy]: filter.sort,
          },
          skip: filter.skip,
          take: filter.limit,
        }),
        db.paymentPurchase.count({
          where: {
            AND: [
              { rootBusinessId: rootBusinessId },
              {
                deletedAt: null,
              },
              {
                productName: {
                  contains: filter.search,
                  mode: "insensitive",
                },
              },
              Object.values($Enums.PaymentStatus).includes(
                filter.category as unknown as $Enums.PaymentStatus
              )
                ? {
                    status: {
                      equals:
                        filter.category as unknown as $Enums.PaymentStatus,
                    },
                  }
                : {},
              {
                createdAt: {
                  gte: filter.dateStart ? filter.dateStart : undefined,
                  lte: filter.dateEnd ? filter.dateEnd : undefined,
                },
              },
            ],
          },
        }),
      ]);

      const pagination = this.createPagination({
        total: totalData,
        page: filter.page,
        limit: filter.limit,
      });

      return { data: purchases, pagination };
    } catch (err) {
      this.handleError("PurchaseService.getAllUserPurchases", err);
    }
  }

  async getBusinessPurchase(rootBusinessId: string, paymentPurchaseId: string) {
    try {
      const purchase = await db.paymentPurchase.findUnique({
        where: { id: paymentPurchaseId },
        select: {
          id: true,
          totalAmount: true,
          method: true,
          productName: true,
          productType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          rootBusinessId: true,
          appProductSubscriptionItem: true,
          appProductToken: true,
          paymentActions: true,
          paymentDetails: {
            select: {
              name: true,
              price: true,
            },
          },
          profile: {
            select: {
              name: true,
              image: true,
              email: true,
              members: {
                where: {
                  rootBusinessId: rootBusinessId,
                },
                select: {
                  role: true,
                },
              },
            },
          },
        },
      });
      if (!purchase) return null;
      if (rootBusinessId !== purchase.rootBusinessId) return null;
      if (purchase.status === "Pending") {
        const check = await this.checkPaymentStatus(purchase);
        if (check) {
          purchase.status = check.status;
          if (check.status === "Success") {
            await db.tokenIncome.createMany({
              data: this.buildTokenIncomeInputs(purchase),
            });
          }
        }
      }
      const returnData = {
        ...purchase,
        originalProduct:
          purchase.appProductSubscriptionItem || purchase.appProductToken,
      };
      // @ts-ignore
      delete returnData.appProductSubscriptionItem;
      // @ts-ignore
      delete returnData.appProductToken;
      return purchase;
    } catch (err) {
      this.handleError("PurchaseService.getBusinessPurchase", err);
    }
  }

  async cancelPurchase(paymentPurchaseId: string) {
    try {
      const purchase = await db.paymentPurchase.findUnique({
        where: { id: paymentPurchaseId },
      });
      if (!purchase || !purchase.midtransId) return null;
      if (purchase.status === "Canceled") return "Purchase already canceled";
      if (purchase.status === "Success") return "Purchase already success";
      if (purchase.status === "Failed") return "Purchase already failed";
      if (purchase.status === "Denied") return "Purchase already denied";
      if (purchase.status === "Expired") return "Purchase already expired";
      if (purchase.status === "Refunded") return "Purchase already refunded";
      await this.midtrans.cancelTransaction(purchase.midtransId);
      await db.paymentPurchase.update({
        where: { id: paymentPurchaseId },
        data: {
          status: "Canceled",
        },
      });
      return purchase;
    } catch (error) {
      this.handleError("PurchaseService.cancelPurchase", error);
    }
  }

  async eWalletCheckout(
    data: EWalletCheckoutDTO,
    rootBusinessId: string,
    profileId: string
  ) {
    try {
      const [validate, method, discount] = await Promise.all([
        this.validateInformation(data, rootBusinessId, profileId),
        db.appPaymentMethod.findUnique({
          where: {
            code: data.acquirer,
          },
        }),
        this.discount.validateDiscount({
          code: data.discountCode,
          profileId,
          rootBusinessId,
        }),
      ]);

      if (typeof validate === "string") return validate;
      if (typeof discount === "string") return discount;
      if (!validate || !method) return "Pembayaran tidak valid";

      const id = this.createPaymentId();

      if (validate?.product?.price === 0) {
        return await this.checkoutFreePlan(
          id,
          profileId,
          rootBusinessId,
          validate
        );
      }

      if (!method) return "Terjadi kesalahan dengan payment gateway";

      const price = this.app.getPrice(validate.product.price, method, discount);

      const midtrans = await this.midtrans.gopayCharge({
        transaction_details: {
          order_id: id,
          gross_amount: price.subtotal.total,
        },
        customer_details: {
          first_name: validate.profile.name,
          last_name: validate.business.name,
          email: validate.profile.email,
          phone: validate.profile.countryCode + validate.profile.phone,
        },
        payment_type: data.acquirer,
        item_details: [
          {
            id: validate.product.id,
            price: price.subtotal.total,
            brand: APP_NAME,
            category: validate.type,
            merchant_name: APP_NAME,
            name: validate.productName,
            quantity: 1,
          },
        ],
      });

      if (!midtrans) return "Terjadi kesalahan dengan payment gateway";

      if (!midtrans.status_code.startsWith("2"))
        return "Terjadi kesalahan dengan payment gateway";

      const deeplinkRedirect = midtrans?.actions?.find(
        (action) => action.name === "deeplink-redirect"
      );

      const genereateQrCode = midtrans?.actions?.find(
        (action) => action.name === "generate-qr-code"
      );

      const actions: {
        action: string;
        value: string;
        type: $Enums.ActionType;
      }[] = [];
      if (deeplinkRedirect) {
        actions.push({
          action: "Redirect To Payment Page",
          value: deeplinkRedirect.url,
          type: "redirect",
        });
      }

      if (genereateQrCode) {
        actions.push({
          action: "Generate QR Code",
          value: genereateQrCode.url,
          type: "image",
        });
      }

      if (actions.length === 0)
        return "Terjadi kesalahan dengan payment gateway";

      const utcExpiredAt = moment(midtrans.expiry_time).utc();

      const payment = await db.paymentPurchase.create({
        data: {
          totalAmount: price.subtotal.total,
          method: data.acquirer,
          productName: validate.productName,
          productType: "subscription",
          profileId: profileId,
          rootBusinessId: rootBusinessId,
          status: "Pending",
          id: id,
          midtransId: midtrans.transaction_id,
          subscriptionValidFor: validate.subscriptionValidFor,
          appProductSubscriptionItemId:
            validate.type === "token" ? null : validate.product.id,
          appProductTokenId:
            validate.type === "subscription" ? null : validate.product.id,
          paymentActions: {
            createMany: {
              data: actions,
            },
          },
          discountUsage: discount
            ? {
                create: {
                  profileId: profileId,
                  rootBusinessId: rootBusinessId,
                  discountCodeId: discount.id,
                },
              }
            : undefined,
          paymentDetails: {
            createMany: {
              data: [
                {
                  name: "Item",
                  price: price.detail.item,
                },
                {
                  name: "Tax",
                  price: price.detail.tax,
                },
                {
                  name: "Admin Fee",
                  price: price.detail.admin,
                },
                {
                  name: "Discount",
                  price: -price.detail.discount,
                },
                {
                  name: "Product",
                  price: validate.product.price,
                },
              ],
            },
          },
          expiredAt: utcExpiredAt.toDate(),
        },
        include: {
          paymentActions: {
            select: {
              action: true,
              value: true,
              type: true,
            },
          },
          paymentDetails: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      });
      return payment;
    } catch (error) {
      this.handleError("PurchaseService.qrisCheckout", error);
    }
  }

  async bankCheckout(
    data: AwaitedBankCheckoutDTO,
    rootBusinessId: string,
    profileId: string
  ) {
    try {
      const [validate, method, discount] = await Promise.all([
        this.validateInformation(data, rootBusinessId, profileId),
        db.appPaymentMethod.findUnique({
          where: {
            code: data.bank,
          },
        }),
        this.discount.validateDiscount({
          code: data.discountCode,
          profileId,
          rootBusinessId,
        }),
      ]);

      if (typeof validate === "string") return validate;
      if (typeof discount === "string") return discount;
      if (!validate || !method) return "Pembayaran tidak valid";

      const id = this.createPaymentId();

      if (validate?.product?.price === 0) {
        return await this.checkoutFreePlan(
          id,
          profileId,
          rootBusinessId,
          validate
        );
      }

      if (!method) return "Terjadi kesalahan dengan payment gateway";

      const price = this.app.getPrice(validate.product.price, method, discount);
      const midtrans = await this.midtrans.bankCharge({
        transaction_details: {
          order_id: id,
          gross_amount: price.subtotal.total,
        },
        customer_details: {
          first_name: validate.profile.name,
          last_name: validate.business.name,
          email: validate.profile.email,
          phone: validate.profile.countryCode + validate.profile.phone,
        },
        payment_type: "bank_transfer",
        item_details: [
          {
            id: validate.product.id,
            price: price.subtotal.total,
            brand: APP_NAME,
            category: validate.type,
            merchant_name: APP_NAME,
            name: validate.productName,
            quantity: 1,
          },
        ],
        bank_transfer: {
          bank: data.bank,
        },
      });

      if (!midtrans) return "Terjadi kesalahan dengan payment gateway";
      if (!midtrans.status_code.startsWith("2"))
        return "Terjadi kesalahan dengan payment gateway";

      const vaNumbers =
        midtrans?.va_numbers?.[0]?.va_number || midtrans.permata_va_number;

      const paymentMethod = data.bank;

      if (!vaNumbers) {
        return "Terjadi kesalahan dengan payment gateway";
      }

      const utcExpiredAt = moment(midtrans.expiry_time).utc();

      const payment = await db.paymentPurchase.create({
        data: {
          totalAmount: price.subtotal.total,
          method: paymentMethod,
          productName: validate.productName,
          productType: "subscription",
          profileId: profileId,
          rootBusinessId: rootBusinessId,
          status: "Pending",
          id: id,
          midtransId: midtrans.transaction_id,
          subscriptionValidFor: validate.subscriptionValidFor,
          appProductSubscriptionItemId:
            validate.type === "token" ? null : validate.product.id,
          appProductTokenId:
            validate.type === "subscription" ? null : validate.product.id,
          paymentActions: {
            create: {
              action: "Virtual Account Number",
              value: vaNumbers,
              type: "text",
            },
          },
          discountUsage: discount
            ? {
                create: {
                  profileId: profileId,
                  rootBusinessId: rootBusinessId,
                  discountCodeId: discount.id,
                },
              }
            : undefined,
          paymentDetails: {
            createMany: {
              data: [
                {
                  name: "Item",
                  price: price.detail.item,
                },
                {
                  name: "Tax",
                  price: price.detail.tax,
                },
                {
                  name: "Admin Fee",
                  price: price.detail.admin,
                },
                {
                  name: "Discount",
                  price: -price.detail.discount,
                },
                {
                  name: "Product",
                  price: validate.product.price,
                },
              ],
            },
          },
          expiredAt: utcExpiredAt.toDate(),
        },
        include: {
          paymentActions: {
            select: {
              action: true,
              value: true,
              type: true,
            },
          },
          paymentDetails: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      });
      return payment;
    } catch (error) {
      this.handleError("PurchaseService.bankCheckout", error);
    }
  }

  private async validateInformation(
    data: EWalletCheckoutDTO | AwaitedBankCheckoutDTO,
    rootBusinessId: string,
    profileId: string
  ) {
    try {
      const [profile, business] = await Promise.all([
        db.profile.findUnique({
          where: {
            id: profileId,
          },
          select: {
            email: true,
            name: true,
            countryCode: true,
            phone: true,
            paymentPurchases: {
              select: {
                totalAmount: true,
              },
              where: {
                AND: [
                  {
                    status: "Success",
                  },
                  {
                    totalAmount: {
                      equals: 0,
                    },
                  },
                ],
              },
              take: 1,
            },
            members: {
              select: {
                profileId: true,
              },
              where: {
                profileId: profileId,
              },
              take: 1,
            },
          },
        }),
        db.rootBusiness.findUnique({
          where: {
            id: rootBusinessId,
          },
          select: {
            name: true,
            paymentPurchases: {
              select: {
                totalAmount: true,
              },
              where: {
                AND: [
                  {
                    status: "Success",
                  },
                  {
                    totalAmount: {
                      equals: 0,
                    },
                  },
                ],
              },
              take: 1,
            },
          },
        }),
      ]);
      const tokens = await db.appProductToken.findUnique({
        where: {
          id: data.productId,
        },
        select: {
          deletedAt: true,
          price: true,
          token: true,
          id: true,
          tokenType: true,
        },
      });
      const subs = await db.appProductSubscriptionItem.findUnique({
        where: {
          id: data.productId,
        },
        select: {
          deletedAt: true,
          name: true,
          price: true,
          id: true,
          tokenImage: true,
          tokenVideo: true,
          tokenLive: true,
          subscriptionValidFor: true,
          appProductSubscription: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!profile || !business) return "Profile atau business tidak ditemukan";
      if (!profile.members.find((member) => member.profileId === profileId))
        return "Member tidak ditemukan";

      if (
        (business?.paymentPurchases?.length ||
          profile?.paymentPurchases?.length) &&
        (subs?.price === 0 || tokens?.price === 0)
      ) {
        return "Free plan sudah digunakan";
      }
      if (data.type === "subscription") {
        if (!subs) return "Product tidak ditemukan";
        if (subs.deletedAt) return "Product tidak ditemukan atau dihapus";

        return {
          profile,
          business,
          product: subs,
          type: "subscription",
          productName: `Subscription ${subs.appProductSubscription.name} ${subs.name}`,
          tokenImage: subs.tokenImage,
          tokenVideo: subs.tokenVideo,
          tokenLive: subs.tokenLive,
          subscriptionValidFor: subs.subscriptionValidFor,
        };
      } else {
        if (!tokens) return "Product tidak ditemukan";
        if (tokens.deletedAt) return "Product tidak ditemukan atau dihapus";

        return {
          profile,
          business,
          product: tokens,
          type: "token",
          productName: `Extra Token ${tokens.token}`,
          tokenImage: tokens.tokenType === "Image" ? tokens.token : 0,
          tokenVideo: tokens.tokenType === "Video" ? tokens.token : 0,
          tokenLive: tokens.tokenType === "LiveStream" ? tokens.token : 0,
          subscriptionValidFor: 0,
        };
      }
    } catch (error) {
      this.handleError("PurchaseService.validateInformation", error);
    }
  }

  private createPaymentId() {
    return uuidv4();
  }

  private async checkPaymentStatus(purchase: {
    id: string;
    status: $Enums.PaymentStatus;
    method: string;
  }) {
    try {
      const status = await this.midtrans.getStatus(purchase.id);
      let updatedStatus = purchase.status;
      if (status) {
        switch (status.transaction_status) {
          case "settlement":
            updatedStatus = "Success";
            break;
          case "expire":
            updatedStatus = "Expired";
            break;
          case "cancel":
            updatedStatus = "Canceled";
            break;
          case "refund":
            updatedStatus = "Refunded";
            break;
          default:
            break;
        }
        if (updatedStatus !== purchase.status) {
          const update = await db.paymentPurchase.update({
            where: { id: purchase.id },
            data: { status: updatedStatus },
          });
          purchase.status = update.status;
        }
      }
      return purchase;
    } catch (error) {
      this.handleError("PurchaseService.checkPaymentStatus", error);
    }
  }

  private async checkoutFreePlan(
    id: string,
    profileId: string,
    rootBusinessId: string,
    validate: Awaited<ReturnType<typeof this.validateInformation>>
  ) {
    if (typeof validate === "string") return validate;
    if (!validate) return "Terjadi kesalahan dengan pembayaran";
    const tokenIncomes: TokenIncome[] = [
      {
        amount: validate.tokenImage,
        tokenType: "Image",
      },
      {
        amount: validate.tokenVideo,
        tokenType: "Video",
      },
      {
        amount: validate.tokenLive,
        tokenType: "LiveStream",
      },
    ];
    const filteredTokenIncomes = tokenIncomes.filter(
      (token) => token.amount > 0
    );
    const business = await db.rootBusiness.update({
      where: {
        id: rootBusinessId,
      },
      data: {
        paymentPurchases: {
          create: {
            totalAmount: 0,
            method: "claim",
            productName: validate.productName,
            productType: "subscription",
            profileId: profileId,
            status: "Success",
            id: id,
            midtransId: null,
            subscriptionValidFor: validate.subscriptionValidFor,
            appProductSubscriptionItemId:
              validate.type === "token" ? null : validate.product.id,
            appProductTokenId:
              validate.type === "subscription" ? null : validate.product.id,
            paymentActions: {
              create: {
                action: "Free Plan",
                value: validate.productName,
                type: "claim",
              },
            },
            paymentDetails: {
              createMany: {
                data: [
                  {
                    name: "Free Plan",
                    price: 0,
                  },
                ],
              },
            },
          },
        },
        tokenIncomes: {
          createMany: {
            data: filteredTokenIncomes,
          },
        },
      },
      include: {
        paymentPurchases: {
          where: {
            id: id,
          },
          take: 1,
          include: {
            paymentActions: {
              select: {
                action: true,
                value: true,
                type: true,
              },
            },
            paymentDetails: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return business.paymentPurchases[0];
  }

  private buildTokenIncomeInputs(purchase: {
    appProductSubscriptionItem: {
      tokenImage: number;
      tokenVideo: number;
      tokenLive: number;
    } | null;
    appProductToken: {
      token: number;
      tokenType: $Enums.TokenType;
    } | null;
    rootBusinessId: string;
  }) {
    interface TokenIncome {
      amount: number;
      tokenType: $Enums.TokenType;
      rootBusinessId: string;
    }
    const data: TokenIncome[] = [
      {
        amount: purchase?.appProductSubscriptionItem?.tokenImage || 0,
        rootBusinessId: purchase.rootBusinessId,
        tokenType: "Image",
      },
      {
        amount: purchase?.appProductSubscriptionItem?.tokenVideo || 0,
        rootBusinessId: purchase.rootBusinessId,
        tokenType: "Video",
      },
      {
        amount: purchase?.appProductSubscriptionItem?.tokenLive || 0,
        rootBusinessId: purchase.rootBusinessId,
        tokenType: "LiveStream",
      },
      {
        amount: purchase?.appProductToken?.token || 0,
        rootBusinessId: purchase.rootBusinessId,
        tokenType: purchase.appProductToken?.tokenType || "Image",
      },
    ];
    return data.filter((token) => token.amount > 0);
  }
  async midtransWebhook(data: MidtransResponseCheckStatusDTO) {
    try {
      const parsed = MidtransResponseCheckStatusSchema.safeParse(data);
      if (!parsed.success) return null;

      const { data: parse } = parsed;
      this.log("PurchaseService.midtransWebhook", parse);

      const order = await db.paymentPurchase.findUnique({
        where: { id: parse.order_id },
        select: {
          id: true,
          appProductSubscriptionItem: true,
          appProductToken: true,
          status: true,
          rootBusinessId: true,
        },
      });
      if (!order) return null;

      const isValid = this.midtrans.isValidSignature({
        gross_amount: parse.gross_amount,
        order_id: parse.order_id,
        signature_key: parse.signature_key,
        status_code: parse.status_code,
      });

      this.log("PurchaseService.midtransWebhook", { isValid });
      if (parse.status_code?.startsWith("2") && isValid) {
        this.log("PurchaseService.midtransWebhook", "TRANSACTION VALID");

        switch (parse.transaction_status) {
          case "settlement":
            this.log("PurchaseService.midtransWebhook", "Status: SETTLEMENT");
            if (order.status === "Pending") {
              const tokenIncomes = this.buildTokenIncomeInputs(order);
              await db.rootBusiness.update({
                where: {
                  id: order.rootBusinessId,
                },
                data: {
                  paymentPurchases: {
                    update: {
                      where: {
                        id: order.id,
                      },
                      data: {
                        status: "Success",
                      },
                    },
                  },
                  tokenIncomes: {
                    createMany: {
                      data: tokenIncomes.map((token) => {
                        return {
                          amount: token.amount,
                          tokenType: token.tokenType,
                        };
                      }),
                    },
                  },
                },
              });
            }
            break;

          case "capture":
            this.log("PurchaseService.midtransWebhook", "Status: CAPTURE");
            if (order.status === "Pending") {
              const tokenIncomes = this.buildTokenIncomeInputs(order);
              await db.rootBusiness.update({
                where: {
                  id: order.rootBusinessId,
                },
                data: {
                  paymentPurchases: {
                    update: {
                      where: {
                        id: order.id,
                      },
                      data: {
                        status: "Success",
                      },
                    },
                  },
                  tokenIncomes: {
                    createMany: {
                      data: tokenIncomes.map((token) => {
                        return {
                          amount: token.amount,
                          tokenType: token.tokenType,
                        };
                      }),
                    },
                  },
                },
              });
            }
            break;

          case "pending":
            this.log("PurchaseService.midtransWebhook", "Status: PENDING");
            // NOTHING HAPPENS
            break;

          case "cancel":
            this.log("PurchaseService.midtransWebhook", "Status: CANCEL");
            await db.paymentPurchase.update({
              where: {
                id: order.id,
              },
              data: {
                status: "Canceled",
              },
            });
            break;

          case "failure":
            this.log("PurchaseService.midtransWebhook", "Status: FAILURE");
            await db.paymentPurchase.update({
              where: {
                id: order.id,
              },
              data: {
                status: "Failed",
              },
            });
            break;

          case "deny":
            this.log("PurchaseService.midtransWebhook", "Status: DENY");
            await db.paymentPurchase.update({
              where: {
                id: order.id,
              },
              data: {
                status: "Denied",
              },
            });
            break;

          case "expire":
            this.log("PurchaseService.midtransWebhook", "Status: EXPIRE");
            await db.paymentPurchase.update({
              where: {
                id: order.id,
              },
              data: {
                status: "Expired",
              },
            });
            break;

          case "refund":
            this.log("PurchaseService.midtransWebhook", "Status: REFUND");
            await db.paymentPurchase.update({
              where: {
                id: order.id,
              },
              data: {
                status: "Refunded",
              },
            });
            break;

          default:
            this.log(
              "PurchaseService.midtransWebhook",
              `Status: UNKNOWN (${parse.transaction_status})`
            );
            break;
        }
      } else {
        this.log(
          "DANGER: PurchaseService.midtransWebhook",
          "TRANSACTION INVALID"
        );
      }

      return null;
    } catch (error) {
      this.handleError("PurchaseService.midtransWebhook", error);
    }
  }
}

interface TokenIncome {
  amount: number;
  tokenType: $Enums.TokenType;
}
