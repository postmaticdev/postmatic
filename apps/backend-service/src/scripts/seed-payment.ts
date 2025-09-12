import { $Enums } from ".prisma/client";
import db from "../config/db";

const data = [
  {
    code: "bri",
    name: "BRI",
    type: "Virtual Account",
    image: null,
    adminType: "Fixed",
    adminFee: 7000,
    taxFee: 0.1,
  },
  {
    code: "bca",
    name: "BCA",
    type: "Virtual Account",
    image: null,
    adminType: "Fixed",
    adminFee: 7000,
    taxFee: 0.1,
  },
  {
    code: "bni",
    name: "BNI",
    type: "Virtual Account",
    image: null,
    adminType: "Fixed",
    adminFee: 7000,
    taxFee: 0.1,
  },
  {
    code: "cimb",
    name: "Cimb Niaga",
    type: "Virtual Account",
    image: null,
    adminType: "Fixed",
    adminFee: 7000,
    taxFee: 0.1,
  },
  {
    code: "qris",
    name: "QRIS",
    type: "QRIS",
    image: null,
    adminType: "Percentage",
    adminFee: 0.05,
    taxFee: 0.1,
  },
];

async function seed() {
  console.log("~Seed start~");
  const check = await db.appPaymentMethod.findMany();
  if (check.length > 0) return console.log("Data already exist");
  for await (const item of data) {
    const product = await db.appPaymentMethod.create({
      data: {
        adminFee: item.adminFee,
        adminType: item.adminType as $Enums.AppPaymentAdminType,
        code: item.code,
        name: item.name,
        taxFee: item.taxFee,
        type: item.type,
      },
    });
    console.log(product);
  }
  console.log("~Seed success~");
}

seed();
