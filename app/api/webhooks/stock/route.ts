import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { db, hasDatabase } from "@/lib/db";

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
    payload = JSON.parse(rawBody) as StockPayload;
    if (!Array.isArray(payload.items)) throw new Error("items manquant");
  } catch {
    return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ received: true, demo: true }, { status: 200 });
  }

  try {
    const results = await Promise.all(
      payload.items
        .filter(
          (item) =>
            typeof item.sku === "string" &&
            Number.isInteger(item.stock) &&
            item.stock >= 0
        )
        .map((item) =>
          db.productVariant.updateMany({
            where: { sku: item.sku },
            data: { stock: item.stock },
          })
        )
    );

    const updated = results.reduce((sum, result) => sum + result.count, 0);
    return NextResponse.json({ received: true, updated }, { status: 200 });
  } catch (error) {
    console.error("[stock-webhook] Synchronisation impossible", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
