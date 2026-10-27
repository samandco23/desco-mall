import { describe, expect, it } from "vitest";

import { checkoutSchema } from "@/lib/validations/order";

const validLine = {
  key: "prod_robe_sawa-M-Écru fleuri",
  productId: "prod_robe_sawa",
  slug: "robe-longue-sawa",
  name: "Robe longue Sawa",
  image: "/products/photo-1496747611176-843222e1e57c.jpg",
  price: 2_450_000,
  size: "M",
  color: "Écru fleuri",
  quantity: 2,
  maxQuantity: 14,
};

const validCheckout = {
  fullName: "Aïcha Ngo Bell",
  email: "client@descomall.cm",
  phone: "+237 655 234 118",
  city: "Douala",
  neighborhood: "Bonapriso",
  paymentMethod: "MTN_MOMO" as const,
  items: [validLine],
};

describe("checkoutSchema", () => {
  it("accepte une commande complète", () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it("refuse un panier vide", () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, items: [] });
    expect(result.success).toBe(false);
  });

  it("refuse un numéro non camerounais", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      phone: "+33 6 12 34 56 78",
    });
    expect(result.success).toBe(false);
  });

  it("refuse un mode de paiement inconnu", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      paymentMethod: "CARTE_BANCAIRE",
    });
    expect(result.success).toBe(false);
  });

  it("refuse une quantité négative", () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      items: [{ ...validLine, quantity: -2 }],
    });
    expect(result.success).toBe(false);
  });
});
