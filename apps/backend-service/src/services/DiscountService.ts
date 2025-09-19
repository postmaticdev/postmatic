import { BaseService } from "./BaseService";
import db from "../config/db";
import { DiscountCalculateDTO } from "../validators/DiscountValidator";

export class DiscountService extends BaseService {
  private DAY = 24 * 60 * 60 * 1000;
  private MONTH = this.DAY * 30;

  async validateDiscount(data: DiscountCalculateDTO) {
    const { code, profileId, rootBusinessId } = data;
    if (!code || !rootBusinessId || !profileId) return null;
    const discount = await db.discountCode.findUnique({
      where: {
        code,
      },
      select: {
        id: true,
        discount: true,
        type: true,
        maxDiscount: true,
        maxUses: true,
        profileId: true,
        expiredAt: true,
        deletedAt: true,
        isReusable: true,
        name: true,
        discountUsages: {
          where: {
            paymentPurchase: {
              status: {
                in: ["Success", "Pending"],
              },
            },
          },
          select: {
            rootBusinessId: true,
            profileId: true,
          },
        },
        description: true,
      },
    });
    if (!discount || discount.deletedAt) return "Kode diskon tidak valid";
    if (discount.profileId === profileId)
      return "Anda tidak dapat menggunakan kode diskon ini";
    if (discount.expiredAt && discount?.expiredAt < new Date())
      return "Kode diskon sudah kadaluarsa";
    if (discount.maxUses && discount.discountUsages.length >= discount.maxUses)
      return "Kode diskon telah mencapai batas penggunaan maksimum";
    const isEverUsed = discount.discountUsages.some((usage) => {
      return (
        usage.rootBusinessId === rootBusinessId || usage.profileId === profileId
      );
    });
    if (isEverUsed && !discount.isReusable)
      return "Kode diskon telah digunakan dan tidak dapat digunakan kembali";

    return {
      id: discount.id,
      discount: discount.discount,
      name: discount.name,
      type: discount.type,
      description: discount.description,
      maxDiscount: discount.maxDiscount,
      maxUses: discount.maxUses,
      expiredAt: discount.expiredAt,
      isReusable: discount.isReusable,
    };
  }

  async createFirstUserDiscount(profileId: string, name: string) {
    const randomCodeSix = Array.from({ length: 6 }, () =>
      String.fromCharCode(Math.floor(Math.random() * 26) + 65)
    ).join("");

    const discount = await db.discountCode.create({
      data: {
        code: randomCodeSix,
        discount: 100,
        isReusable: false,
        name: `Referral Code ${name}`,
        description: `Referral Code New User ${name}`,
        type: "Percentage",
        expiredAt: null,
        maxDiscount: 20000,
        maxUses: null,
        reward: 20000,
      },
    });
    return discount;
  }
}
