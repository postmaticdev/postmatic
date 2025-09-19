/**
 * Script RESTORE data aplikasi dari folder ./backup-app/*.json
 *
 * Urutan restore:
 * 1) AppProductSubscription
 * 2) AppProductToken
 * 3) AppPaymentMethod
 * 4) TemplateImageCategory
 * 5) TemplateImageContent (tanpa relasi dulu)
 * 6) AppSocialPlatform
 * 7) AppProductSubscriptionItem (FK ke Subscription)
 * 8) Relasi M2M TemplateImageCategory <-> TemplateImageContent (dari file join)
 *
 * Catatan:
 * - File JSON diharapkan berasal dari script backup yang kita buat.
 * - Jika file join M2M tidak ada, langkah 8 dilewati.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.resolve(__dirname, "backup-app");

// Util: baca JSON array aman
async function readJsonArray<T = any>(filename: string): Promise<T[]> {
  const p = path.join(BACKUP_DIR, filename);
  try {
    const buf = await fs.readFile(p, "utf8");
    const data = JSON.parse(buf);
    if (Array.isArray(data)) return data as T[];
    console.warn(`⚠️  ${filename} bukan array, lewati`);
    return [];
  } catch (e: any) {
    if (e.code === "ENOENT") {
      console.warn(`ℹ️  File tidak ditemukan: ${filename} (lewati)`);
      return [];
    }
    throw new Error(`Gagal baca ${filename}: ${e.message || e}`);
  }
}

type AnyRow = Record<string, any>;

// Util: buang properti yang tak boleh di-set langsung (relasi/otomatis)
function stripFields<T extends AnyRow>(row: T, fields: string[]): Partial<T> {
  const clone: AnyRow = { ...row };
  for (const f of fields) delete clone[f];
  return clone as Partial<T>;
}

// Batching biar aman (menghindari payload terlalu besar)
async function processInBatches<T>(
  items: T[],
  batchSize: number,
  handler: (chunk: T[]) => Promise<void>
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    await handler(chunk);
  }
}

// ==== Restore functions ====

async function restoreAppProductSubscription() {
  const rows = await readJsonArray<AnyRow>("AppProductSubscription.json");
  console.log(`➡️  Restore AppProductSubscription (${rows.length})`);
  await processInBatches(rows, 100, async (chunk) => {
    await prisma.$transaction(
      chunk.map((row) => {
        const data = stripFields(row, [
          "paymentPurchases",
          "deletedAt",
          // updatedAt dibuat otomatis; createdAt tetap bisa diisi jika perlu,
          // tapi biasanya biarkan default.
        ]);
        return prisma.appProductSubscription.upsert({
          where: { id: row.id },
          create: { ...(data as any), id: row.id },
          update: data as any,
        });
      })
    );
  });
  console.log("   ✔️ Selesai AppProductSubscription");
}

async function restoreAppProductToken() {
  const rows = await readJsonArray<AnyRow>("AppProductToken.json");
  console.log(`➡️  Restore AppProductToken (${rows.length})`);
  await processInBatches(rows, 200, async (chunk) => {
    await prisma.$transaction(
      chunk.map((row) => {
        const data = stripFields(row, ["paymentPurchases", "deletedAt"]);
        return prisma.appProductToken.upsert({
          where: { id: row.id },
          create: { ...(data as any), id: row.id },
          update: data as any,
        });
      })
    );
  });
  console.log("   ✔️ Selesai AppProductToken");
}

async function restoreAppPaymentMethod() {
  const rows = await readJsonArray<AnyRow>("AppPaymentMethod.json");
  console.log(`➡️  Restore AppPaymentMethod (${rows.length})`);
  await processInBatches(rows, 200, async (chunk) => {
    await prisma.$transaction(
      chunk.map((row) => {
        const data = stripFields(row, ["deletedAt"]);
        return prisma.appPaymentMethod.upsert({
          where: { id: row.id },
          create: { ...(data as any), id: row.id },
          update: data as any,
        });
      })
    );
  });
  console.log("   ✔️ Selesai AppPaymentMethod");
}

async function restoreTemplateImageCategory() {
  const rows = await readJsonArray<AnyRow>("TemplateImageCategory.json");
  console.log(`➡️  Restore TemplateImageCategory (${rows.length})`);
  await processInBatches(rows, 200, async (chunk) => {
    await prisma.$transaction(
      chunk.map((row) => {
        const data = stripFields(row, ["templateImageContents"]);
        return prisma.templateImageCategory.upsert({
          where: { id: row.id },
          create: { ...(data as any), id: row.id },
          update: data as any,
        });
      })
    );
  });
  console.log("   ✔️ Selesai TemplateImageCategory");
}

async function restoreTemplateImageContentWithoutRelations() {
  const rows = await readJsonArray<AnyRow>("TemplateImageContent.json");
  console.log(
    `➡️  Restore TemplateImageContent (tanpa relasi categories) (${rows.length})`
  );
  await processInBatches(rows, 200, async (chunk) => {
    await prisma.$transaction(
      chunk.map((row) => {
        // buang kolom relasi & array lain yang tidak langsung di-set
        const data = stripFields(row, [
          "templateImageCategories",
          "templateImageSaved",
          "publisher", // objek relasi
        ]);
        // jaga FK publisher (opsional); jika publisherId null/undefined, aman
        return prisma.templateImageContent.upsert({
          where: { id: row.id },
          create: {
            ...(data as any),
            id: row.id,
            // gunakan publisherId bila ada
            publisherId: row.publisherId ?? null,
          },
          update: {
            ...(data as any),
            publisherId: row.publisherId ?? null,
          },
        });
      })
    );
  });
  console.log("   ✔️ Selesai TemplateImageContent (tanpa relasi)");
}

async function restoreAppSocialPlatform() {
  const rows = await readJsonArray<AnyRow>("AppSocialPlatform.json");
  console.log(`➡️  Restore AppSocialPlatform (${rows.length})`);
  await processInBatches(rows, 200, async (chunk) => {
    await prisma.$transaction(
      chunk.map((row) => {
        const data = stripFields(row, ["deletedAt"]);
        return prisma.appSocialPlatform.upsert({
          where: { id: row.id },
          create: { ...(data as any), id: row.id },
          update: data as any,
        });
      })
    );
  });
  console.log("   ✔️ Selesai AppSocialPlatform");
}

async function restoreAppProductSubscriptionItem() {
  const rows = await readJsonArray<AnyRow>("AppProductSubscriptionItem.json");
  console.log(`➡️  Restore AppProductSubscriptionItem (${rows.length})`);

  // Prefetch semua subscription yang valid sekali saja (hindari await di dalam map)
  const validSubs = new Set(
    (
      await prisma.appProductSubscription.findMany({
        select: { id: true },
      })
    ).map((x) => x.id)
  );

  let skipped = 0;

  await processInBatches(rows, 200, async (chunk) => {
    const ops = chunk.flatMap((row) => {
      const subId = row.appProductSubscriptionId as string | undefined;

      if (!subId || !validSubs.has(subId)) {
        skipped++;
        console.warn(
          `   ⚠️  skip item ${row.id} (subscription ${
            subId ?? "null"
          } tidak valid/tdk ada)`
        );
        return []; // JANGAN return Promise biasa; cukup lewati
      }

      const data = stripFields(row, ["paymentPurchases", "deletedAt"]);
      return [
        prisma.appProductSubscriptionItem.upsert({
          where: { id: row.id },
          create: { ...(data as any), id: row.id },
          update: data as any,
        }),
      ];
    });

    if (ops.length > 0) {
      await prisma.$transaction(ops);
    }
  });

  console.log(
    `   ✔️ Selesai AppProductSubscriptionItem (skipped karena FK hilang/invalid: ${skipped})`
  );
}

/**
 * Restore relasi M2M TemplateImageCategory <-> TemplateImageContent
 * dari file: TemplateImageCategory_To_TemplateImageContent.json
 * Berisi array record { A: categoryId, B: contentId }
 *
 * Strategi: bangun mapping contentId -> list categoryId,
 * lalu untuk setiap content lakukan:
 *  update({ data: { templateImageCategories: { set: [{id: ...}, ...] } } })
 * sehingga tidak tabrakan/duplikat.
 */
async function restoreTemplateImage_M2M() {
  const rows = await readJsonArray<{ A: string; B: string }>(
    "TemplateImageCategory_To_TemplateImageContent.json"
  );
  if (!rows.length) {
    console.log(
      "➡️  Relasi M2M TemplateImageCategory<->TemplateImageContent: tidak ada file join, lewati."
    );
    return;
  }
  console.log(
    `➡️  Restore relasi M2M TemplateImageCategory<->TemplateImageContent (${rows.length} pairs)`
  );

  // Build mapping: contentId -> Set<categoryId>
  const mapContentToCats = new Map<string, Set<string>>();
  for (const r of rows) {
    const catId = r.A;
    const contentId = r.B;
    if (!mapContentToCats.has(contentId))
      mapContentToCats.set(contentId, new Set());
    mapContentToCats.get(contentId)!.add(catId);
  }

  // Untuk keamanan: pastikan content & category eksis → filter
  // Ambil semua id content & category dari DB (bisa jadi besar; jika besar, bisa diubah jadi cek per batch)
  const existingContent = new Set(
    (
      await prisma.templateImageContent.findMany({
        select: { id: true },
      })
    ).map((x) => x.id)
  );

  const existingCategory = new Set(
    (
      await prisma.templateImageCategory.findMany({
        select: { id: true },
      })
    ).map((x) => x.id)
  );

  // Apply per content dengan batching
  const contentIds = Array.from(mapContentToCats.keys());
  await processInBatches(contentIds, 50, async (chunk) => {
    await prisma.$transaction(
      chunk.map((contentId) => {
        if (!existingContent.has(contentId)) {
          console.warn(`   ⚠️  lewati content ${contentId} (tidak ada)`);
          return prisma.$executeRaw`SELECT 1`; // no-op
        }
        const catIds = Array.from(mapContentToCats.get(contentId)!).filter(
          (c) => existingCategory.has(c)
        );
        const setList = catIds.map((id) => ({ id }));
        // set: menggantikan relasi yang ada → mencegah tabrakan/duplikat
        return prisma.templateImageContent.update({
          where: { id: contentId },
          data: { templateImageCategories: { set: setList } },
        });
      })
    );
  });

  console.log("   ✔️ Selesai set relasi M2M (menggunakan set: [...])");
}

async function main() {
  console.log("=== RESTORE Data Aplikasi dari ./backup-app ===");
  // 1–7: entity
  await restoreAppProductSubscription();
  await restoreAppProductToken();
  await restoreAppPaymentMethod();
  await restoreTemplateImageCategory();
  await restoreTemplateImageContentWithoutRelations();
  await restoreAppSocialPlatform();
  await restoreAppProductSubscriptionItem();

  // 8: relasi M2M
  await restoreTemplateImage_M2M();

  console.log("✅ RESTORE selesai.");
}

main()
  .catch((e) => {
    console.error("❌ Error restore:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
