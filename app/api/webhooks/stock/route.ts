import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { db, hasDatabase } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StockPayload = {
  items: { sku: string; stock: number }[];
};

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.STOCK_API_KEY;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(signature.replace(/^sha256=/, ""), "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (rawBody.length > 1_000_000) return NextResponse.json({ message: "Payload trop volumineux." }, { status: 413 });
  const signature =
    request.headers.get("x-desco-signature") ??
    request.headers.get("x-signature") ??
    "";

  if (!process.env.STOCK_API_KEY) {
    return NextResponse.json(
      { message: "Synchronisation de stock non configurée." },
      { status: 503 }
    );
  }

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ message: "Signature invalide." }, { status: 401 });
  }

  let payload: StockPayload;
  try {
    const parsed = z.object({ items: z.array(z.object({ sku: z.string().trim().min(1).max(120), stock: z.number().int().min(0).max(1_000_000) }).strict()).min(1).max(1000).refine((items) => new Set(items.map((item) => item.sku)).size === items.length, "SKU en double") }).strict().safeParse(JSON.parse(rawBody));
    if (!parsed.success) throw new Error("Payload invalide");
    payload = parsed.data;
  } catch {
    return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ received: true, demo: true }, { status: 200 });
  }

  try {
    const known = await db.productVariant.findMany({ where: { sku: { in: payload.items.map((item) => item.sku) } }, select: { id: true, sku: true } });
    const knownSkus = new Set(known.flatMap((variant) => variant.sku ? [variant.sku] : []));
    let updated = 0;
    for (const item of payload.items) {
      const variant = known.find((entry) => entry.sku === item.sku);
      if (!variant) continue;
      await db.productVariant.update({ where: { id: variant.id }, data: { stock: item.stock } });
      updated += 1;
    }
    return NextResponse.json({ received: true, updated, unknownSkus: payload.items.filter((item) => !knownSkus.has(item.sku)).map((item) => item.sku) }, { status: 200 });
  } catch (error) {
    console.error("[stock-webhook] Synchronisation impossible", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
