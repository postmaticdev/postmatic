/**
 * Script untuk backup database dari VPS
 * backup model untuk data Aplikasi:
 * AppProductSubscription, AppProductSubscriptionItem, AppProductToken, AppPaymentMethod,
 * TemplateImageCategory, TemplateImageContent, AppSocialPlatform
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { access } from "fs/promises";

const prisma = new PrismaClient();

// replacer untuk JSON.stringify agar aman kalau ada BigInt (jaga-jaga)
const jsonReplacer = (_: string, value: any) =>
  typeof value === "bigint" ? value.toString() : value;

async function writeJson(filename: string, data: unknown) {
  const dir = path.resolve(__dirname, "backup-app");
  if (!(await access(dir).catch(() => false))) {
    fs.mkdir(dir, { recursive: true });
  }
  const filePath = path.resolve(dir, filename);
  await fs.writeFile(filePath, JSON.stringify(data, jsonReplacer, 2), "utf8");
  console.log(
    `✔️  Tulis file: ${filePath} (size ~${JSON.stringify(data).length} bytes)`
  );
}

async function dump<T>(
  label: string,
  fetcher: () => Promise<T[]>,
  filename: string
) {
  console.log(`➡️  Mulai dump ${label} ...`);
  const rows = await fetcher();
  console.log(`   • Ditemukan ${rows.length} record`);
  await writeJson(filename, rows);
  return rows.length;
}

async function backupApp() {
  console.log("=== Backup Data Aplikasi (Prisma) ===");

  const counts: Record<string, number> = {};

  // Jangan lupa: jika kamu ingin select kolom tertentu saja, tambahkan { select: {...} } di findMany
  counts.AppProductSubscription = await dump(
    "AppProductSubscription",
    () => prisma.appProductSubscription.findMany(),
    "AppProductSubscription.json"
  );

  counts.AppProductSubscriptionItem = await dump(
    "AppProductSubscriptionItem",
    () => prisma.appProductSubscriptionItem.findMany(),
    "AppProductSubscriptionItem.json"
  );

  counts.AppProductToken = await dump(
    "AppProductToken",
    () => prisma.appProductToken.findMany(),
    "AppProductToken.json"
  );

  counts.AppPaymentMethod = await dump(
    "AppPaymentMethod",
    () => prisma.appPaymentMethod.findMany(),
    "AppPaymentMethod.json"
  );

  counts.TemplateImageCategory = await dump(
    "TemplateImageCategory",
    () => prisma.templateImageCategory.findMany(),
    "TemplateImageCategory.json"
  );

  counts.TemplateImageContent = await dump(
    "TemplateImageContent",
    () => prisma.templateImageContent.findMany(),
    "TemplateImageContent.json"
  );

  counts.AppSocialPlatform = await dump(
    "AppSocialPlatform",
    () => prisma.appSocialPlatform.findMany(),
    "AppSocialPlatform.json"
  );

  // (Opsional) Ekspor join table M2M untuk TemplateImageCategory <-> TemplateImageContent (kalau ada)
  // Nama tabel implisit Prisma: _<ModelA>To<ModelB> sesuai urutan alfabet
  // Di sini: _TemplateImageCategoryToTemplateImageContent
  try {
    console.log(
      "➡️  Coba dump join table TemplateImageCategory<->TemplateImageContent ..."
    );
    const joinRows = await prisma.$queryRaw<
      { A: string; B: string }[]
    >`SELECT "A", "B" FROM "_TemplateImageCategoryToTemplateImageContent"`;
    console.log(`   • Ditemukan ${joinRows.length} record relasi`);
    await writeJson(
      "TemplateImageCategory_To_TemplateImageContent.json",
      joinRows
    );
    counts.TemplateImageCategory_To_TemplateImageContent = joinRows.length;
  } catch (err: any) {
    console.log(
      `   • Lewati join table (kemungkinan tidak ada / nama berbeda). Detail: ${
        err?.message ?? err
      }`
    );
  }

  // Tulis ringkasan
  await writeJson("backup-summary.json", {
    generatedAt: new Date().toISOString(),
    counts,
  });

  console.log(
    "✅ Selesai backup. Cek file JSON di folder yang sama dengan script ini."
  );
}

backupApp()
  .catch((e) => {
    console.error("❌ Terjadi error saat backup:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
