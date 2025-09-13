import { NextResponse } from "next/server";

export function GET() {
  const keys = Object.keys(process.env)
    .filter((k) => k.startsWith("NEXT_PUBLIC_"))
    .sort();
  // Hanya kirim nama & panjang nilai agar aman (tanpa membocorkan secret)
  const pub = Object.fromEntries(
    keys.map((k) => [k, (process.env[k] ?? "").length])
  );
  return NextResponse.json({
    envStage: process.env.ENV_STAGE || null,
    publicKeys: pub,
  });
}
