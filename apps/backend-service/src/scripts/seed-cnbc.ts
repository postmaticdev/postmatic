import { connect } from "http2";
import db from "../config/db";
import { dataCnbc } from "./data-cnbc";

const seed = async () => {
  let total = 0;
  try {
    console.log("🚀 ~ file: seed-cnbc.ts:6 ~ seed ~ db.profile.createMany:");

    for await (const item of dataCnbc) {
      const checkCategory = await db.masterRssCategory.findFirst({
        where: {
          name: item.category,
        },
        select: {
          id: true,
        },
      });
      console.log(
        checkCategory ? item.category + " exist" : item.category + " not exist"
      );
      const rss = await db.masterRss.create({
        data: {
          title: item.title,
          url: item.url,
          //   masterRssCategoryId: checkCategory?.id || categoryId,
          publisher: "cnbc",
          masterRssCategory: {
            connectOrCreate: {
              where: {
                id: checkCategory?.id || "some-id",
              },
              create: {
                name: item.category,
              },
            },
          },
        },
      });
      console.log("RSS Created: ", rss.title);
      total += 1;
    }
  } catch (error) {
    console.log(error);
  } finally {
    console.log("🚀 ~ file: seed-cnbc.ts:6 ~ seed ~ db.profile.createMany:");
    console.log("TOTAL: ", total);
    await db.$disconnect();
  }
};

seed();
